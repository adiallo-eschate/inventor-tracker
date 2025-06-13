"use client";
import { useState, useRef } from "react";
import Link from "next/link"
import { useRouter } from "next/navigation";

export default function AddSkuForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const form = new FormData(e.currentTarget as HTMLFormElement);

    const res=  await fetch("/api/submit", {
      method: "POST",
      body: form,
    });

    const result = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(result.error || "An error occurred.");
    } else {
      formRef.current?.reset();
      setSuccess(true);
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

      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
          SKU added successfully!
        </div>
      )}

      <form
        ref={formRef}
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
          disabled={loading}
          className={`px-6 py-2 font-medium rounded-lg transition-all ${
            loading
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </>
  );
}
