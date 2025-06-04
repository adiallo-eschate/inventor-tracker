import { createClient } from "@/utils/supabase/server";

export async function GET(){
    const supabase = await createClient()

    const { data:{ user }, error } = await supabase.auth.getUser()

    if (error){
        console.error("Could not get user auth information")
    }
    const userId = user?.id

    if (!userId){
        return new Response(JSON.stringify({error_message:"Error retrieving auth Data"}), {status:401}) 
    }
    return new Response(JSON.stringify({data:userId}), {status:200})

}