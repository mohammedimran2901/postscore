import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import Stripe from 'stripe';
import { sendUpgradeConfirmationEmail } from '@/lib/email';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    const error = err as Error;
    console.error('Webhook signature verification failed:', error.message);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;

        if (userId) {
          const { data: profile } = await getSupabaseAdmin()
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

          await getSupabaseAdmin()
            .from('profiles')
            .update({
              subscription_status: 'active',
              subscription_id: session.subscription as string,
              stripe_customer_id: session.customer as string,
            })
            .eq('id', userId);

          if (profile?.email && profile?.full_name) {
            await sendUpgradeConfirmationEmail(profile.email, profile.full_name);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;

        if (userId) {
          await getSupabaseAdmin()
            .from('profiles')
            .update({
              subscription_status: subscription.status as
                | 'active'
                | 'past_due'
                | 'canceled',
            })
            .eq('id', userId);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;

        if (userId) {
          await getSupabaseAdmin()
            .from('profiles')
            .update({
              subscription_status: 'canceled',
            })
            .eq('id', userId);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const { data: profile } = await getSupabaseAdmin()
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profile) {
          await getSupabaseAdmin()
            .from('profiles')
            .update({
              subscription_status: 'past_due',
            })
            .eq('id', profile.id);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}