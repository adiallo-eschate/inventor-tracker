"use client";
import { checkUser } from "@/app/actions";
import { useEffect } from "react";


export default function StripeSuccess(){
    
    useEffect(()=>{
        checkUser()
    },[])

    return (
        <>
            <h2>Stripe payment was successful</h2>
        </>
    )
}