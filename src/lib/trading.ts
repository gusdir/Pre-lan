import type { Holding, Trade } from "../types";

// Motor de trading SIMULADO. No mueve dinero real.
// Mantiene saldo en EUR y posiciones; recalcula coste medio en compras.

export const START_CASH_EUR = 10000;

export function applyTrade(
  cashEur: number,
  holdings: Record<string, Holding>,
  trade: Omit<Trade, "id" | "created_at" | "user_id">
): { cashEur: number; holdings: Record<string, Holding> } {
  const nextCash = cashEur;
  const next = { ...holdings };

  if (trade.side === "buy") {
    const h: Holding = next[trade.coin_id] ?? {
      coin_id: trade.coin_id,
      symbol: trade.symbol,
      amount: 0,
      avg_cost_eur: 0,
    };
    const newAmount = h.amount + trade.amount;
    h.avg_cost_eur =
      newAmount > 0
        ? (h.avg_cost_eur * h.amount + trade.value_eur) / newAmount
        : 0;
    h.amount = newAmount;
    next[trade.coin_id] = h;
    return { cashEur: nextCash - trade.value_eur, holdings: next };
  }

  // sell
  const h = next[trade.coin_id];
  if (h) {
    h.amount = Math.max(0, h.amount - trade.amount);
    if (h.amount === 0) delete next[trade.coin_id];
    else next[trade.coin_id] = h;
  }
  return { cashEur: nextCash + trade.value_eur, holdings: next };
}

export function portfolioValueEur(
  holdings: Record<string, Holding>,
  priceOf: (coinId: string) => number
): number {
  return Object.values(holdings).reduce(
    (acc, h) => acc + h.amount * priceOf(h.coin_id),
    0
  );
}
