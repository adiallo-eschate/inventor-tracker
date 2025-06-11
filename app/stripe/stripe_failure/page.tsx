"use client";

import { checkUser } from "@/app/actions"
import { useEffect } from "react";


export default function StripeFailure(){
    useEffect(()=>{
        checkUser()
    },[])
    
    return (
        <>
            stripe payment failed
        </>
    )
}