"use client";
import {useState, useEffect} from "react"
import { createClient } from "@/utils/supabase/client";
import Hero from "@/components/hero";
import ConnectSupabaseSteps from "@/components/tutorial/connect-supabase-steps";
import SignUpUserSteps from "@/components/tutorial/sign-up-user-steps";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import Link from "next/link"

export default function Home() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();
  }, []);

  return (
    <>
      <Hero />
 <main className="flex-1 flex flex-col gap-6 px-4">
        <section className="grid md:grid-cols-2 gap-8 mb-20">
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-xl shadow-md transition-all">
            <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-950 rounded-xl mb-6 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
                className="text-indigo-600 w-6 h-6"
                fill="currentColor"
              >
                <path d="M224 0c-17.7 0-32 14.3-32 32v19.2C119 66 64 130.6 64 208v18.8c0 47-17.3 92.4-48.5 127.6l-7.4 8.3c-8.4 9.4-10.4 22.9-5.3 34.4S19.4 416 32 416h384c12.6 0 24-7.4 29.2-18.9s3.1-25-5.3-34.4l-7.4-8.3C401.3 319.2 384 273.9 384 226.8V208c0-77.4-55-142-128-156.8V32c0-17.7-14.3-32-32-32zm45.3 493.3c12-12 18.7-28.3 18.7-45.3h-64c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7 33.3-6.7 45.3-18.7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-foreground">
              Real-time Alerts
            </h3>
            <p className="text-muted-foreground">
              Get notified before products become dead stock with our smart algorithms.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-8 rounded-xl shadow-md transition-all">
            <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-950 rounded-xl mb-6 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                className="text-indigo-600 w-6 h-6"
                fill="currentColor"
              >
                <path d="M500 384h-16V272c0-13.3-10.7-24-24-24h-88v-48h48c13.3 0 24-10.7 24-24V56c0-13.3-10.7-24-24-24H88C74.7 32 64 42.7 64 56v120c0 13.3 10.7 24 24 24h48v48H48c-13.3 0-24 10.7-24 24v112H8c-4.4 0-8 3.6-8 8v24c0 17.7 14.3 32 32 32h448c17.7 0 32-14.3 32-32v-24c0-4.4-3.6-8-8-8zM192 272h128v112H192V272z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-foreground">
              Sales Analytics
            </h3>
            <p className="text-muted-foreground">
              Visualize sales trends and inventory movement to make informed decisions.
            </p>
          </div>
        </section>

        <section className="mb-20 px-4 w-full">
            <h2 className="text-center text-3xl md:text-4xl font-bold text-gray-800 mb-12">Pricing Plans</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="bg-white p-8 rounded-xl shadow-md flex flex-col items-center text-center">
                <h3 className="text-xl font-semibold mb-2">Free</h3>
                <p className="text-gray-600 mb-6">Max 10 SKUs<br />No real-time alerts</p>
                <span className="text-3xl font-bold text-indigo-600 mb-4">$0</span>
                <button className="px-6 py-3 mt-auto bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-all">
                  <Link href={user?.aud === 'authenticated' ? "/pricing" : "/sign-up"}>Upgrade Now</Link>
                </button>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-md flex flex-col items-center text-center border-2 border-indigo-600">
                <h3 className="text-xl font-semibold mb-2">Starter</h3>
                <p className="text-gray-600 mb-6">Max 500 SKUs<br />Real-time alerts</p>
                <span className="text-3xl font-bold text-indigo-600 mb-4">$20/mo</span>
                <button className="px-6 py-3 mt-auto bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-all">
                    <Link href={user?.aud === 'authenticated' ? "/pricing" : "/sign-up"}>Upgrade Now</Link>
                </button>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-md flex flex-col items-center text-center">
                <h3 className="text-xl font-semibold mb-2">Pro</h3>
                <p className="text-gray-600 mb-6"> 1000+ SKUs<br />Real-time alerts</p>
                <span className="text-3xl font-bold text-indigo-600 mb-4">$49/mo</span>
                <button className="px-6 py-3 mt-auto bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-all">
                       <Link href={user?.aud === 'authenticated' ? "/pricing" : "/sign-up"}>Upgrade Now</Link>
                </button>
              </div>
            </div>
        </section>

      </main>
    </>
  );
}
