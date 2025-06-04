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
    const supabase = await createClient()

    console.log("This is the session data:", session)
    const {data:{ user }, error } = await supabase.auth.getUser()

    if (error){
        console.log("Error returned by auth.getUser()",error)
        console.error("Could Not Retrieve User Auth Information")
    } 

    const userId = user?.id
     // const userId = session.metadata?.user_id;
     if (!userId) {
        console.log("userId returned:", userId)
        console.error('Missing user_id in session metadata');
        break;
    }
    
    const plan = getPlanFromPriceId(session?.metadata?.price_id);
    const limits = getLimitsForPlan(plan);

    const insertResult = await supabase.from('subscriptions').insert({
      user_id: userId,                                     //session.metadata?.user_id,
      email: session?.customer_email,
      plan,
      limits,
      stripe_info: session,
    });

    if (insertResult.error) {
      const updateResult = await supabase
        .from('subscriptions')
        .update({
          email: session?.customer_email,
          plan,
          limits,
          stripe_info: session,
        })
        .eq('user_id', userId)//session.metadata?.user_id);

      if (updateResult.error) {
        console.error('Supabase update error (session.completed):', updateResult.error);
      }
    }

    break;
  }

  case 'customer.subscription.updated': {
    const subscription = event.data.object as Stripe.Subscription;

     // const userId = subscription.metadata?.user_id;
    const { data:{ user }, error } = await supabase.auth.getUser()
    const userId = user?.id
     if (!userId) {
        console.error('Missing user_id in session metadata');
        break;
    }
    const plan = getPlanFromPriceId(subscription.items.data[0].price.id);
    const limits = getLimitsForPlan(plan);

    const insertResult = await supabase.from('subscriptions').insert({
      user_id: userId,                                      //subscription.metadata?.user_id,
      email: subscription.metadata?.email,
      plan,
      limits,
      stripe_info: subscription,
    });

    if (insertResult.error) {
      const updateResult = await supabase
        .from('subscriptions')
        .update({
          plan,
          limits,
          stripe_info: subscription,
        })
        .eq('user_id', userId)//subscription.metadata?.user_id);

      if (updateResult.error) {
        console.error('Supabase update error (subscription.updated):', updateResult.error);
      }
    }

    break;
  }

  case 'checkout.session.expired': {
    const session = event.data.object as Stripe.Checkout.Session;

    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('email', session.customer_email);

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
