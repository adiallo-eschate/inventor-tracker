// this api handles the add skus form


import { createClient } from "@/utils/supabase/server";
import { create } from "domain";
import { cookies } from "next/headers";

function getPlanLimit(plan:string){
    switch (plan){
        case 'free': 
            return 10
        case 'starter':
            return 500
        case 'pro':
            return 1000
        default:
            return 0
    }
}

function hasExceededUsage(plan: string | undefined, skuCount: number): boolean {
  const limit = getPlanLimit(plan ?? "free");
  return skuCount >= limit; 
}

export async function POST(req:Request){
    const formData = req.formData()
    const name = (await formData).get('name')
    const quantity = Number((await formData).get('quantity'))
    const last_sold_at = (await formData).get('last_sold_date')

    const supabase = await createClient()
    const { data:{ user } } = await supabase.auth.getUser()

    const [skusRes, subRes] = await Promise.all([
      supabase.from("skus").select("id").eq("email", user?.email),
      supabase.from("subscriptions").select("plan,limits").eq("email", user?.email)
    ]);

    const skus = skusRes.data;
    const subs = subRes.data;

    const sku_count = skus?.length ?? 0;

    const { plan, limits } = subs?.[0] ?? {};
    const maxLimit = limits?.limits ?? getPlanLimit(plan);

    console.log({ sku_count, plan, maxLimit });

    if (hasExceededUsage(plan, sku_count)) {
        return new Response(
          JSON.stringify({ error: "SKU usage limit exceeded for your plan." }),
          { status: 403 }
        );
  }

  
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





