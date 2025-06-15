"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import AddSkuForm from "@/components/ui/addSkuForm";
import { useRouter } from "next/navigation";
import { checkUser } from "@/app/actions";

export default function Dashboard() {
  const [loading, setLoading] = useState(false)
  const [cutoffDays, setCutoffDays] = useState<number | null>(null);
  const [skus, setSkus] = useState<any[]>([]);
  const [expiredSkus, setExpiredSkus] = useState<any[]>([]);
  const router = useRouter();
  const submitFormReset = useRef<HTMLFormElement>(null)

  useEffect(() => {
    checkUser();
  }, []);

  const handleDaysFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget as HTMLFormElement);

    const res = await fetch("/api/submit_days", {
      method: "POST",
      body: form,
    });

    const result = await res.json();
    setExpiredSkus(result.data.data || []);
    submitFormReset.current?.reset()
    
    const submittedDays = Number(form.get("cuttOffDays"));
    setCutoffDays(submittedDays);
    setLoading(false)
    router.refresh()
  };

  useEffect(() => {
    async function fetchData() {
      const supabase = await createClient();
      const { data: skus_data, error } = await supabase.from("skus").select();

      if (error) {
        console.error("Error fetching SKUs:", error);
        return;
      }

      setSkus(skus_data || []);
    }

    fetchData();
  }, []);

  const expiredIds = new Set(
    Array.isArray(expiredSkus)
      ? expiredSkus.map((s: { id: string | number }) => s.id)
      : []
  );

  return (<section className="max-w-5xl mx-auto px-4 py-16 space-y-10">
  
  <div className="flex justify-between items-center">
    <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
  </div>

  
  <div className="bg-white shadow rounded-xl p-6">
    <h2 className="text-xl font-semibold mb-2 text-gray-800">How to Use</h2>
    <p className="text-gray-600">
      Add your product by entering its name, quantity in stock, and the last date it was sold. 
      Then, use the cutoff days field to detect dead stock — you get an alert for products that haven’t sold for the number of days you set.
      <p>***Cuttoff days default to 30 days</p>
      <p>***Dead stock colored red in the table</p>
    </p>
  </div>

  
  <div className="flex justify-end"> 
    <div className="bg-red-100 text-red-600 font-medium px-4 py-2 rounded-lg shadow">
      Dead Stock Detected: {expiredIds.size}
    </div>
  </div>

  
  <div>
    <AddSkuForm />
  </div>

   {cutoffDays !== null && (
      <div className="text-sm text-gray-600 italic mb-2">
        Current cutoff: <span className="font-semibold">{cutoffDays}</span> days
      </div>
    )} 
  
  <form
    ref={submitFormReset}
    onSubmit={handleDaysFormSubmit}
    className="flex flex-col sm:flex-row items-center gap-4"
  >
    <input
      name="cuttOffDays"
      type="number"
      placeholder="Enter cutoff days"
      className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
      required
    />
    <button
      disabled={loading}
      type="submit"
      className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-all"
    >
      Submit
    </button>
  </form>

{/* this is table*/}
  <div className="overflow-x-auto">
    <table className="w-full table-auto text-left border border-gray-200 rounded-lg shadow-md">
      <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
        <tr>
          <th className="p-4">Name</th>
          <th className="p-4">Quantity</th>
          <th className="p-4">Last Sold Date</th>
        </tr>
      </thead>
      <tbody>
        {skus.map(
          (sku: {
            id: string;
            name: string;
            quantity: number;
            last_sold_at: string;
          }) => {
            const formattedDate = new Date(sku.last_sold_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            });
            const isExpired = expiredIds.has(sku.id);
            return (
              <tr
                key={sku.id}
                className={isExpired ? "bg-red-50 text-red-600" : "text-gray-700"}
              >
                <td className="p-4">{sku.name}</td>
                <td className="p-4">{sku.quantity}</td>
                <td className="p-4">{formattedDate}</td>
              </tr>
            );
          }
        )}
      </tbody>
    </table>
  </div>
</section>
  );
}
