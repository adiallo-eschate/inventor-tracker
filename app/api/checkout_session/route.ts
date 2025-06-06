import Stripe from "stripe"
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)



export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user?.aud !== 'authenticated'){
        return NextResponse.redirect(new URL('/sign-in', request.url))
    }


    const { priceId } = await request.json();

    console.log("priceId: ", priceId)

    const { data: existingSub } = await supabase.from('subscriptions')
    .select('stripe_user_id, stripe_info')
    .eq('email', user.email)
    .maybeSingle()
    
    let stripeCustomerId = existingSub?.stripe_user_id

    console.log("stripeCustomerid: ", stripeCustomerId)

    if (!stripeCustomerId){
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id
        }
      })

      stripeCustomerId = customer.id

      console.log("user did not exist and this is the new returned customer id ", stripeCustomerId)
    }


    // check if user has active subs if not create checkout session
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: 'all',
      limit: 1
    })

    console.log("subscriptions retured from stripe:  ", subscriptions)

    const subscription = subscriptions.data?.[0];

    if(!subscription){
      console.log("Could not find a subscription for the user")
    }

    const isActive = subscription?.status === 'active';
    const subscriptionId = subscription?.id

    console.log("isActive is: ", isActive)
    console.log("subscriptionId if any: ", subscriptionId)

    if (isActive && subscriptionId){
      // update db first

      const {error} = await supabase.from('subscriptions').upsert({
        stripe_user_id: stripeCustomerId,
        email: user.email,
        stripe_info: subscription,
      })

      if (error){
        console.log("Could not update customers information in the subscriptions table api/checkout_session")
      }
      // open portal for the existing customer

      const billingPortalSession = await stripe.billingPortal.sessions.create({
            customer: stripeCustomerId,
            return_url: 'https://deadstockalert.vercel.app/dashboard/skus',
      })

      return NextResponse.json({url: billingPortalSession.url})

    }


    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer: stripeCustomerId ?? undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: 'https://deadstockalert-l426dwus0-somethingsomethingorothers-projects.vercel.app/stripe/stripe_success',
      cancel_url: 'https://deadstockalert-l426dwus0-somethingsomethingorothers-projects.vercel.app/stripe/stripe_failure',
      metadata:{
        price_id: priceId,
        user_id: user.id,
        customer_email: user.email ?? ''
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
//success_url: 'http://localhost:3000/stripe/strip_success',
//cancel_url: 'http://localhost:3000/stripe/strip_failure',



