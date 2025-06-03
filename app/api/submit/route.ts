// this api handles the add skus form


import { createClient } from "@/utils/supabase/server";
import { create } from "domain";
import { cookies } from "next/headers";



export async function POST(req:Request){
    const formData = req.formData()
    const name = (await formData).get('name')
    const quantity = Number((await formData).get('quantity'))
    const last_sold_at = (await formData).get('last_sold_date')


    const supabase = await createClient()
    try{
        const { data:{ user } } = await supabase.auth.getUser()

        if (!user){
            return new Response(JSON.stringify({error:"Not authenticated"}), {status:401})
        }


        const {error} = await supabase.from("skus").insert([{user_id:user.id,name,quantity,last_sold_at}])
        
        console.log(error)
        
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }
    
    return new Response(JSON.stringify({success:true}), {status:200})

    } catch(e){
        return new Response(JSON.stringify({error:'Invalid form submission'}), {status:500})
    }
    

}





