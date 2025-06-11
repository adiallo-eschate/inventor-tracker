import NextLogo from "./next-logo";
import SupabaseLogo from "./supabase-logo";
import Link from "next/link"

export default function Header() {
  return (
    <section className="text-center mb-20 px-4">
      <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
        Dead Stock Alerts
      </h1>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
        Automatically identify slow-moving inventory before it becomes dead stock and costs you money.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button className="px-8 py-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-all shadow-lg">
          <Link href={"/sign-up"}>Start Free Trial</Link>
        </button>
      </div>
    </section>
  );
}
