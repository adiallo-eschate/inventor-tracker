// this api gets all the skus to render in the frontend

import {createClient } from "@/utils/supabase/server"


export default async function GET(req:Request){
      const supabase = await createClient();
    const { data: skus_data, error } = await supabase.from("skus").select();

    if (error) {
      console.error("Error fetching SKUs:", error);
      return;
    }

    console.log("Fetched SKUs:", JSON.stringify(skus_data, null, 2));
    return Response.json(skus_data)
}


