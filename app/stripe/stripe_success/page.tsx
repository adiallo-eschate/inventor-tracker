"use client";
import { checkUser } from "@/app/actions";



export default function StripeSuccess(){
    checkUser()
    return (
        <>
            <h2>Stripe payment was successful</h2>
        </>
    )
}