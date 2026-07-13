import { supabase } from "../supabase";

// Registra el mapeo wallet_address -> user_id para que el webhook sepa a quien
// acreditar. En produccion, `address` debe ser la wallet real del usuario
// (p.ej. CDP Server Wallet), no una direccion comun del entorno.
export async function ensureWallet(userId: string, address: string) {
  await supabase
    .from("wallets")
    .upsert(
      { wallet_address: address.toLowerCase(), user_id: userId },
      { onConflict: "wallet_address" }
    );
}
