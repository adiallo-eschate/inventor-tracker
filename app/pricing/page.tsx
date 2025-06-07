"use client";
import { createClient } from "@/utils/supabase/client";


export default function PricingPage(){
    


const handleSubscribe = async (priceId:string) => {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    const { data, error} = await supabase.from('subscriptions').select('stripe_user_id').eq("user_id", user?.id)
    
    if (error){
        console.error("Could Not Retrieve Customer Id from Supabase")
    }

    console.log("Returned data in page.tsx: ", data)

    const res = await fetch('/api/checkout_session', {
        method: 'POST',
        body: JSON.stringify({ priceId, data }),
    });

    const { url } = await res.json();
    window.location.href = url; // Redirect to Stripe Checkout
};
    return (
        <>
            <h1>Subscribe to continue </h1>
            <div className='border border-red-500'>
                <p>Plan: Free</p>
                <button onClick={() => handleSubscribe('price_1RVfdcRxxyfmlGjIqHXumet6')}>Choose Option</button>
            </div>
            <div className='border border-yellow-500'>
                <p>Plan: Starter</p>
                <button onClick={() => handleSubscribe('price_1RVfeBRxxyfmlGjIveeq6KTK')}>Choose Option</button>
            </div>
            <div className='border border-green-500'>
                <p>Plan: Pro</p>
                <button  onClick={() => handleSubscribe('price_1RVfegRxxyfmlGjI8Ketv6yI')}>Choose Option</button>
            </div>
        </>
    )
}