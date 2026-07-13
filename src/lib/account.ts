// Operaciones fiat simuladas (EUR). No mueven dinero real.
// Modela la comisión típica de un on-ramp (ingreso con tarjeta ~1.5%).

export const DEPOSIT_FEE_PCT = 0.015;
export const WITHDRAW_FEE_PCT = 0.0; // retiro simulado sin comisión
export const MIN_DEPOSIT_EUR = 10;

export interface FiatOp {
  feeEur: number;
  netEur: number; // lo que entra/sale de la cartera (tras comisión)
  grossEur: number; // importe bruto operado
}

export function depositQuote(amountEur: number): FiatOp {
  const feeEur = amountEur * DEPOSIT_FEE_PCT;
  return { feeEur, netEur: amountEur - feeEur, grossEur: amountEur };
}

export function withdrawQuote(amountEur: number): FiatOp {
  const feeEur = amountEur * WITHDRAW_FEE_PCT;
  return { feeEur, netEur: amountEur, grossEur: amountEur + feeEur };
}
