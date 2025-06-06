import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';


// server client with service role key 
const createClient = async ()=>{

    const cookieStore = await cookies();
    
    return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
}


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

 
    const userId = session.id;
     if (!userId) {
        console.log("userId returned:", userId)
        console.error('Missing user_id in session metadata');
        break;
    }
    
    const plan = getPlanFromPriceId(session?.metadata?.price_id);
    const limits = getLimitsForPlan(plan);

    const insertResult = await supabase.from('subscriptions').insert({
      stripe_user_id: userId,                                     //session.metadata?.user_id,
      email: session?.customer_email,
      plan:plan,
      limits:limits,
      stripe_info: session,
    }).select();

    console.log("Inserted data:", insertResult)

    if (insertResult.error) {
      const updateResult = await supabase
        .from('subscriptions')
        .update({
          email: session?.customer_email,
          plan:plan,
          limits:limits,
          stripe_info: session,
        })
        .eq('stripe_user_id', userId)//session.metadata?.user_id);

      if (updateResult.error) {
        console.error('Supabase update error (session.completed):', updateResult.error);
      }
    }

    break;
  }

  case 'customer.subscription.updated': {
    const subscription = event.data.object as Stripe.Subscription;

    console.log("This is the subscription object:", subscription)

    const userId = subscription.metadata?.user_id;
     if (!userId) {
        console.error('Missing user_id in session metadata');
        break;
    }
    const plan = getPlanFromPriceId(subscription.items.data[0].price.id);
    const limits = getLimitsForPlan(plan);

    const insertResult = await supabase.from('subscriptions').insert({
      stripe_user_id: userId,                                      //subscription.metadata?.user_id,
      email: subscription.metadata?.email,
      plan:plan,
      limits:limits,
      stripe_info: subscription,
    });

    if (insertResult.error) {
      const updateResult = await supabase
        .from('subscriptions')
        .update({
          plan:plan,
          limits:limits,
          stripe_info: subscription,
        })
        .eq('stripe_user_id', userId)//subscription.metadata?.user_id);

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
  if (priceId === process.env.STRIPE_FREE_PLAN!) return 'free';
  if (priceId === process.env.STRIPE_STARTER_PLAN) return 'starter';
  if (priceId === process.env.STRIPE_PRO_PLAN) return 'pro'
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
