import type { Holding } from "../../types";
import type { OrderInput, OrderResult, Quote, TradingProvider } from "./provider";

// HUECO TIPADO para el backend REAL (paso futuro, fuera de la demo).
// Implementa TradingProvider usando Coinbase Developer Platform:
//   - Onramp / Wallets / Advanced Trade API (https://docs.cdp.coinbase.com)
//   - Autenticación con CDP API key + JWT (ED25519)
//   - POST /api/v3/brokerage/orders para ejecutar la orden real
//   - Las "cuentas" y balances se leen de Coinbase, no de Supabase.
//
// Cuando esté listo, cámbialo en index.ts: `export const tradingProvider = new CdpProvider(...)`.
export class CdpProvider implements TradingProvider {
  readonly name = "coinbase-cdp";

  constructor(private readonly apiKey: string, private readonly apiSecret: string) {}

  quote(_input: OrderInput): Quote {
    throw new Error("CdpProvider.quote: no implementado (pendiente de backend real)");
  }

  placeOrder(
    _state: { cashEur: number; holdings: Record<string, Holding> },
    _input: OrderInput
  ): OrderResult {
    throw new Error("CdpProvider.placeOrder: no implementado (pendiente de backend real)");
  }
}
