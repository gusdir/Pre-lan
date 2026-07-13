import type { Holding, Trade } from "../../types";

// Parámetros de una orden (lo que introduce el usuario en el panel).
export interface OrderInput {
  coinId: string;
  symbol: string;
  side: "buy" | "sell";
  amountEur: number; // importe en EUR que el usuario quiere operar
  priceEur: number; // precio de mercado actual
}

// Previsualización antes de ejecutar (comisión, unidades estimadas, impacto en cash).
export interface Quote {
  side: "buy" | "sell";
  feePct: number;
  feeEur: number;
  units: number; // cripto que se recibe / entrega
  priceEur: number;
  cashDelta: number; // variación del efectivo (negativo en compra)
  valueEur: number; // importe contable de la orden (lo que aplica applyTrade)
}

export interface OrderResult {
  trade: Omit<Trade, "id" | "created_at" | "user_id">;
  cashEur: number;
  holdings: Record<string, Holding>;
}

// Contrato común a cualquier backend (simulado o real).
// Para pasar a real solo hay que implementar esta interfaz (ver cdpProvider.ts).
export interface TradingProvider {
  readonly name: string;
  quote(input: OrderInput): Quote;
  placeOrder(
    state: { cashEur: number; holdings: Record<string, Holding> },
    input: OrderInput
  ): OrderResult;
}
