"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function TestSupabasePage() {
  const [status, setStatus] = useState<string>("Testing...");

  useEffect(() => {
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.from('users').select('*').limit(1);

        if (error) {
          console.log("Supabase error (expected if table missing):", error);

          // If the error is about a missing table, the connection itself is actually WORKING.
          if (error.message.includes("Could not find the table") || error.code === 'PGRST116') {
            setStatus("Connected! (Database reached, but 'users' table is not created yet).");
          } else {
            setStatus(`Error: ${error.message}`);
          }
        } else {
          console.log("Supabase connection success:", { data });
          setStatus("Connected successfully! Found 'users' table.");
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setStatus("Unexpected error occurred.");
      }
    };
    testConnection();
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-8">
      <div className="max-w-md w-full rounded-2xl bg-gray-800/50 backdrop-blur-xl p-8 border border-white/10 text-center shadow-2xl">
        <h1 className="mb-4 text-3xl font-bold bg-gradient-to-r from-[#3ECF8E] to-[#3ECF8E]/50 bg-clip-text text-transparent">
          Supabase Test
        </h1>
        <div className={`p-4 rounded-xl border ${status.includes('Connected') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-orange-500/10 border-orange-500/20 text-orange-400'}`}>
          <p className="font-mono text-sm">{status}</p>
        </div>
        <p className="mt-6 text-gray-400 text-sm">
          Open the browser console (F12 → Console) to see the full response object.
        </p>
        <div className="mt-8 pt-6 border-t border-white/5 text-left space-y-2">
          <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest">Required Environment Variables:</p>
          <code className="block text-[10px] bg-black/50 p-2 rounded text-emerald-500/80">NEXT_PUBLIC_SUPABASE_URL</code>
          <code className="block text-[10px] bg-black/50 p-2 rounded text-emerald-500/80">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
        </div>
      </div>
    </div>
  );
}