import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion } from "framer-motion";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ComingSoon() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    const { data, error } = await supabase.from("newsletter_subscribers").insert({ email });
    if (error) {
      setMessage("Something went wrong or you already signed up.");
      setStatus("error");
    } else {
      setMessage("Thanks! You'll be notified when we launch.");
      setStatus("success");
      setEmail("");
    }
  };

  return (
    <main className="min-h-screen bg-[#E6EAD7] text-[#29432B] flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="max-w-lg w-full text-center"
      >
        <img src="/stg-logo.png" alt="Second Turn Logo" className="mx-auto mb-6 w-32" />
        <h1 className="text-3xl md:text-5xl font-bold mb-4">Second Turn is almost ready to roll!</h1>
        <p className="text-lg mb-6">
          A community marketplace for used board games in the Baltics is coming in <strong>Autumn 2025</strong>.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-center justify-center">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="p-3 rounded-2xl border w-full sm:w-auto text-sm"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="bg-[#D95323] text-white px-6 py-3 rounded-2xl hover:bg-opacity-80 transition"
          >
            Notify Me
          </button>
        </form>
        {message && <p className="mt-4 text-sm">{message}</p>}

        <p className="mt-8 text-sm text-[#29432B]">Give your games a second life.</p>
      </motion.div>

      <footer className="mt-12 text-center text-sm text-[#29432B]">
        <p className="mb-2">Contact us: <a href="mailto:info@secondturn.games" className="underline">info@secondturn.games</a></p>
        <div className="space-x-4">
          <a href="/privacy" className="underline">Privacy Policy</a>
          <a href="/cookies" className="underline">Cookies</a>
          <a href="/terms" className="underline">Terms</a>
        </div>
      </footer>
    </main>
  );
}
