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

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: user?.email,
      line_items: [{ price: priceId, quantity: 1 }],
       success_url: 'https://deadstockalert-l426dwus0-somethingsomethingorothers-projects.vercel.app/stripe/stripe_success',
      cancel_url: 'https://deadstockalert-l426dwus0-somethingsomethingorothers-projects.vercel.app/stripe/stripe_failure',
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
//success_url: 'http://localhost:3000/stripe/strip_success',
//cancel_url: 'http://localhost:3000/stripe/strip_failure',



