// this api gets all the skus to render in the frontend
import { NextResponse } from "next/server";
import {createClient } from "@/utils/supabase/server"


export async function GET(req:Request){
      const supabase = await createClient();
    const { data: skus_data, error } = await supabase.from("skus").select();

    if (error) {
      console.error("Error fetching SKUs:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("Fetched SKUs:", JSON.stringify(skus_data, null, 2));
     return NextResponse.json(skus_data);
}


