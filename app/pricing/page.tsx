"use client";

import { useEffect } from "react";
import { checkUser } from "../actions";

export default function PricingPage() {
  useEffect(() => {
    checkUser();
  }, []);

  const handleSubscribe = async (priceId: string) => {
    const res = await fetch("/api/checkout_session", {
      method: "POST",
      body: JSON.stringify({ priceId }),
    });

    const { url } = await res.json();
    window.location.href = url; // Redirect to Stripe Checkout
  };

  const plans = [
    {
      name: "Free",
      description: "Max 10 SKUs. No real-time alerts.",
      color: "border-gray-300",
      button: "bg-gray-200 text-gray-700 hover:bg-gray-300",
      priceId: process.env.STRIPE_FREE_PLAN!,
    },
    {
      name: "Starter",
      description: "Max 500 SKUs. Real-time alerts.",
      color: "border-indigo-300",
      button: "bg-indigo-600 text-white hover:bg-indigo-700",
      priceId: process.env.STRIPE_STARTER_PLAN!,
    },
    {
      name: "Pro",
      description: "1000+ SKUs. Real-time alerts.",
      color: "border-green-300",
      button: "bg-green-600 text-white hover:bg-green-700",
      priceId: process.env.STRIPE_PRO_PLAN!,
    },
  ];

  return (
    <section className="max-w-5xl mx-auto px-4 py-20">
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-10 text-gray-800">
        Choose Your Plan
      </h1>
      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`bg-white p-8 rounded-xl shadow-md border ${plan.color} flex flex-col justify-between`}
          >
            <div>
              <h2 className="text-2xl font-semibold mb-4">{plan.name}</h2>
              <p className="text-gray-600">{plan.description}</p>
            </div>
            <button
              className={`mt-6 px-6 py-3 rounded-lg font-medium transition-all ${plan.button}`}
              onClick={() => handleSubscribe(plan.priceId)}
            >
              Choose Plan
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
