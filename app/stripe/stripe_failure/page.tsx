import { checkUser } from "@/app/actions"


export default function StripeFailure(){
    checkUser()
    return (
        <>
            stripe payment failed
        </>
    )
}