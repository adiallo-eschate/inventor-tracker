"use client";
import { useState, useEffect, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal } from "react"
import {createClient} from "@/utils/supabase/client"
import AddSkuForm from "@/components/ui/addSkuForm";
import { useRouter } from "next/navigation";
import { checkUser } from "@/app/actions";

export default function Dashboard(){
    const [skus,setSkus] = useState<any>([])
    const [expiredSkus, setExpiredSkus] = useState<any>([])

  useEffect(()=>{
        checkUser()
    },[])
    


    const router = useRouter();


const handleDaysFormSubmit = async (e:React.FormEvent)=>{
        e.preventDefault()
        const form = new FormData(e.currentTarget as HTMLFormElement)

        const res = await fetch('/api/submit_days',{
            method:'POST',
            body:form
        })

       const result = await res.json()
       console.log("arrayed_result", result.data.data)
        setExpiredSkus(result.data.data)
    }


useEffect(() => {
  async function fetchData() {
    const supabase = await createClient();
    const { data: skus_data, error } = await supabase.from("skus").select();

    if (error) {
      console.error("Error fetching SKUs:", error);
      return;
    }

    console.log("Fetched SKUs:", JSON.stringify(skus_data, null, 5)); // Use this for debugging
    setSkus(skus_data);
  }

  fetchData();
}, []);


console.log("expried skus here", expiredSkus)
const expiredIds = new Set(
    Array.isArray(expiredSkus) ?  expiredSkus.map((s: { id: string | number }) => s.id) : []
);


    return (
        <>
            <h1>hello world</h1>
        <div>
            <div>
                 <div>
                    <button className="text text-blue-500" onClick={()=> router.push('/pricing')}>Go To Pricing</button>
                 </div>
                <div className='formfil'>
                    <AddSkuForm />
                </div>
                <div className="days">
                    <form onSubmit={handleDaysFormSubmit}>
                        <input name="cuttOffDays" type="number" className="border border-blue-500"required/>
                        <button type="submit">Submit</button>
                    </form>
                </div> 
            <table>
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Quantity</th>
                    <th>Last Sold Date</th>
                </tr>
                </thead>
                  <tbody>
                  {skus.map((sku: { id: string; name: string; quantity: number; last_sold_at: string }) => {
                        
                    return (
                      <tr key={sku.id}>
                        <td className={expiredIds.has(sku.id) ? 'text-red-500' : ''}>{sku.name}</td>
                        <td className={expiredIds.has(sku.id) ? 'text-red-500' : ''}>{sku.quantity}</td>
                        <td className={expiredIds.has(sku.id) ? 'text-red-500' : ''}>{sku.last_sold_at}</td>
                      </tr>
                    );
                  })}
                </tbody>
            </table>

            </div>

        </div>
        </>
    )
}