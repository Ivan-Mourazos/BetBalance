import { createClient } from "@supabase/supabase-js";
import type { Database } from "./supabaseTypes"; // Crearemos este archivo a continuación

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase URL or Anon Key is missing from environment variables."
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
