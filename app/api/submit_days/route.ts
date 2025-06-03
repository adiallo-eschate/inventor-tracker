import { createClient } from '@/utils/supabase/server'

export async function POST(req:Request){
    const formData = req.formData()
    const days = Number((await formData).get("cuttOffDays"))
    console.log("The number of days choosen is:", days)

    const supabase= await createClient()

    const {data:{session}} = await supabase.auth.getSession()

    const access_token = session?.access_token
    
    if(!access_token) {
        return new Response(JSON.stringify({ error: "Could Not Retrieve User Token" }), { status: 401 });
    }
                                                                                // add '|| 30'
    const { data, error } = await supabase.functions.invoke(`rapid-task?days=${days}`,{
        headers:{
            Authorization: `Bearer ${access_token}`
        },
        method: 'GET',
    })

    if (error){
        console.log(error)
        return new Response(JSON.stringify({ error: "Error Retrieving Products: Edge Function", details: error.message }), { status: 500 });
    } 

    console.log(data)
    return new Response(JSON.stringify({data:data}), {status:200})

}