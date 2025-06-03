import { createClient } from "@/utils/supabase/server";


export default async function pollDeadStock(){
    const days = 30
    const supabase = await createClient()
    const { data: dead_stock_data, error } = await supabase.from("skus").select()
    .lt("last_sold_at", new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

    if (error){
        console.error("Error fetching dead stocks", error);
    }

    console.log("Fetched stock:", JSON.stringify(dead_stock_data,null,2))
    return Response.json(dead_stock_data)
}










