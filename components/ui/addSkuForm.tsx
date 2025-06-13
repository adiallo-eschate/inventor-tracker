"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"

export default function AddSkuForm() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget as HTMLFormElement);

    const res=  await fetch("/api/submit", {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      const result = await res.json();
      setError(result.error || "An error occurred.");
    } else {
      (e.currentTarget as HTMLFormElement).reset();
      router.refresh();
    }
  };

  return (
    <>
    {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button
            className="ml-4 underline hover:text-red-900"
          >
             <Link href={"/pricing"}>Upgrade Plan</Link>
          </button>
        </div>
      )}
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row flex-wrap gap-4 mb-8"
    >
      <input
        name="name"
        type="text"
        required
        placeholder="SKU Name"
        className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <input
        name="quantity"
        type="number"
        required
        placeholder="Quantity"
        className="w-full sm:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <input
        name="last_sold_date"
        type="datetime-local"
        required
        className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <button
        type="submit"
        className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-all"
      >
        Submit
      </button>
    </form>
    </>
  );
}
