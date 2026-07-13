import { applyTrade } from "./engine";
import type { Holding, Trade } from "../../types";
import type { OrderInput, OrderResult, Quote, TradingProvider } from "./provider";

// Comisión simulada (tipo "spread/fee" de un exchange). Ajustable.
const FEE_PCT = 0.01;

// Backend SIMULADO: no mueve dinero real. Reutiliza el reductor de cartera.
export class MockProvider implements TradingProvider {
  readonly name = "mock";

  quote(input: OrderInput): Quote {
    const feeEur = input.amountEur * FEE_PCT;
    if (input.side === "buy") {
      const units =
        input.priceEur > 0 ? (input.amountEur - feeEur) / input.priceEur : 0;
      return {
        side: "buy",
        feePct: FEE_PCT,
        feeEur,
        units,
        priceEur: input.priceEur,
        cashDelta: -input.amountEur,
        valueEur: input.amountEur,
      };
    }
    const units = input.priceEur > 0 ? input.amountEur / input.priceEur : 0;
    return {
      side: "sell",
      feePct: FEE_PCT,
      feeEur,
      units,
      priceEur: input.priceEur,
      cashDelta: input.amountEur - feeEur,
      valueEur: input.amountEur - feeEur,
    };
  }

  placeOrder(
    state: { cashEur: number; holdings: Record<string, Holding> },
    input: OrderInput
  ): OrderResult {
    const q = this.quote(input);
    const trade: Omit<Trade, "id" | "created_at" | "user_id"> = {
      coin_id: input.coinId,
      symbol: input.symbol,
      side: input.side,
      amount: q.units,
      price_eur: input.priceEur,
      value_eur: q.valueEur,
    };
    const res = applyTrade(state.cashEur, state.holdings, trade);
    return { trade, cashEur: res.cashEur, holdings: res.holdings };
  }
}
