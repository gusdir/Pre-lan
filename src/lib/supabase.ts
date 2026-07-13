import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anonKey) {
  // En Lovable esto se inyecta automáticamente; el fallback evita crashear en local.
  console.warn("Faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY");
}

export const supabase = createClient(
  url ?? "https://placeholder.supabase.co",
  anonKey ?? "placeholder"
);
