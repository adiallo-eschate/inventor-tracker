import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;


export async function POST(request: Request) {
  const supabase = await createClient();

  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
  } catch (err) {
    return new NextResponse(`Webhook Error: ${(err as Error).message}`, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;

      const plan = getPlanFromPriceId(session?.metadata?.price_id);
      const limits = getLimitsForPlan(plan);
      
      const { error } = await supabase.from('subscriptions').upsert({
        user_id: session.metadata?.user_id,
        email: session?.customer_email,                //session.customer_email,
        plan,
        limits,
        stripe_info: session,
      }, {
        onConflict: 'user_id'
      })
      .select();

      if (error) console.error('Supabase upsert error (session.completed):', error);
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;

      const plan = getPlanFromPriceId(subscription.items.data[0].price.id);
      const limits = getLimitsForPlan(plan);

      const { error } = await supabase.from('subscriptions').upsert({
        user_id: subscription.metadata?.user_id,
        email: subscription.metadata?.email,
        plan,
        limits,
        stripe_info: subscription,
      }, {
        onConflict: 'user_id'
      })
      .select();

      if (error) console.error('Supabase upsert error (subscription.updated):', error);
      break;
    }

    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session;

      const { error } = await supabase.from('subscriptions').delete().eq('email', session.customer_email);

      if (error) console.error('Supabase delete error (session.expired):', error);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

function getPlanFromPriceId(priceId: string | undefined) {
  if (!priceId) return 'unknown';
  if (priceId === 'price_1RVfdcRxxyfmlGjIqHXumet6') return 'free';
  if (priceId === 'price_1RVfeBRxxyfmlGjIveeq6KTK') return 'starter';
  if (priceId === 'price_1RVfegRxxyfmlGjI8Ketv6yI') return 'pro'
  return 'custom';
}

function getLimitsForPlan(plan: string) {
  switch (plan) {
    case 'free':
        return { skus: 10 }
    case 'starter':
      return { skus: 100 };
    case 'pro':
      return { skus: 500 };
    default:
      return { skus: 0 };
  }
}
