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
  const supabase = await createClient();

  console.log("This is the session data:", session);

  const customerId = session.customer as string;
  const email = session.metadata?.customer_email ?? session.customer_email ?? session?.metadata?.customer_email;
  const userId = session.metadata?.user_id; // optional: for tracking Supabase user

  if (!customerId || !email) {
    console.error('Missing customer_id or email in session metadata');
    break;
  }

  const plan = getPlanFromPriceId(session.metadata?.price_id);
  const limits = getLimitsForPlan(plan);

  const { error } = await supabase.from('subscriptions').upsert(
    {
      user_id: session?.metadata?.user_id,
      stripe_user_id: customerId,
      email,
      plan,
      limits,
      stripe_info: session,
    },
    {
      onConflict: 'stripe_user_id', // requires UNIQUE constraint
    }
  );

  if (error) {
    console.error('Supabase upsert error (session.completed):', error);
  }

  break;
}


case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;

      console.log("This is the subscription object:", subscription);

      const stripeCustomerId = subscription.customer as string;
      
    const customer = await stripe.customers.retrieve(stripeCustomerId) as Stripe.Customer;
    const supabaseUserId = customer.metadata?.user_id;
    const email = customer.email;

      if (!supabaseUserId || !stripeCustomerId) {
        console.error('Missing user_id or customer_id in subscription metadata');
        break;
      }

      const priceId = subscription.items.data[0]?.price?.id;
      const plan = getPlanFromPriceId(priceId);
      const limits = getLimitsForPlan(plan);

      const { error } = await supabase.from('subscriptions').upsert({
        user_id: supabaseUserId,
        stripe_user_id: stripeCustomerId,
        email,
        plan,
        limits,
        stripe_info: subscription,
      }, { onConflict: 'stripe_user_id' }); // assumes stripe_user_id is unique

      if (error) {
        console.error('Supabase upsert error (subscription.updated):', error);
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
