"use client";

export default function PricingPage(){
    


const handleSubscribe = async (priceId:string) => {

    const res = await fetch('/api/checkout_session', {
        method: 'POST',
        body: JSON.stringify({ priceId }),
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