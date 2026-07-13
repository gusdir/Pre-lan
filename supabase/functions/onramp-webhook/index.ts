// Supabase Edge Function: webhook de on-ramp real (MoonPay).
// Verifica la firma HMAC del webhook y acredita el saldo real del usuario
// llamando a la funcion SQL `credit_deposit` (nunca se fia del cliente).
//
// Despliegue:
//   supabase functions deploy onramp-webhook
//   supabase secrets set MOONPAY_SECRET=...   # clave de firma (server-only)
// SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY las inyecta Supabase automaticamente.
//
// IMPORTANTE: el cliente debe registrar la wallet del usuario en la tabla
// `wallets` (wallet_address -> user_id) y pasar esa misma direccion como
// `externalCustomerId` al abrir el widget, para que el webhook sepa a quien
// acreditar. En produccion cada usuario debe tener su propia wallet real
// (p.ej. CDP Server Wallet), no una direccion comun.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MOONPAY_SECRET = Deno.env.get("MOONPAY_SECRET") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

// Comparacion HMAC-SHA256 (hex) resistente a timing.
async function verify(rawBody: string, signature: string | null): Promise<boolean> {
  if (!signature || !MOONPAY_SECRET) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(MOONPAY_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody));
  const hex = [...new Uint8Array(sig)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  if (hex.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < hex.length; i++) {
    diff |= hex.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Método no permitido", { status: 405 });
  }

  const raw = await req.text();
  const signature = req.headers.get("Moonpay-Signature");
  if (!(await verify(raw, signature))) {
    return new Response("Firma inválida", { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(raw);
  } catch {
    return new Response("JSON inválido", { status: 400 });
  }

  const data = event?.data ?? {};
  const status = data.status;
  // Solo acreditamos cuando la compra esta completada/confirmada.
  if (status !== "completed" && status !== "confirmed") {
    return new Response("OK (sin acción)", { status: 200 });
  }

  const wallet = (data.externalCustomerId ?? data.walletAddress ?? "").toString().toLowerCase();
  const coinId = (data.quoteCurrency ?? "").toString().toLowerCase();
  const symbol = (data.currency ?? coinId).toString().toUpperCase();
  const cryptoAmount = Number(data.quoteCurrencyAmount ?? 0);
  const fiatAmount = Number(data.baseCurrencyAmount ?? 0); // EUR

  if (!wallet || !coinId || cryptoAmount <= 0) {
    return new Response("Datos incompletos", { status: 400 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
    auth: { persistSession: false },
  });

  const { data: w } = await supabase
    .from("wallets")
    .select("user_id")
    .eq("wallet_address", wallet)
    .single();
  if (!w) {
    return new Response("Wallet no vinculada a ningún usuario", { status: 404 });
  }

  const avgCost = fiatAmount > 0 && cryptoAmount > 0 ? fiatAmount / cryptoAmount : 0;
  const { error } = await supabase.rpc("credit_deposit", {
    p_user_id: w.user_id,
    p_coin_id: coinId,
    p_symbol: symbol,
    p_amount: cryptoAmount,
    p_avg_cost_eur: avgCost,
  });
  if (error) {
    return new Response("Error al acreditar: " + error.message, { status: 500 });
  }

  return new Response("OK", { status: 200 });
});
