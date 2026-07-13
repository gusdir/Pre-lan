import type { Coin } from "../../types";

// CoinGecko API pública (gratis, sin clave). España => precios en EUR.
// NOTA demo: sin clave está rate-limited (~10-30 req/min). Suficiente para prototipo.
const BASE = "https://api.coingecko.com/api/v3";

// Activos destacados (equivalente a "Top gainers / New on Coinbase").
const COIN_IDS = [
  "bitcoin",
  "ethereum",
  "tether",
  "binancecoin",
  "usd-coin",
  "ripple",
  "solana",
  "cardano",
].join(",");

export async function fetchMarkets(signal?: AbortSignal): Promise<Coin[]> {
  const url =
    `${BASE}/coins/markets?vs_currency=eur&ids=${COIN_IDS}` +
    `&order=market_cap_desc&sparkline=false&locale=es`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error("No se pudo obtener el mercado");
  return (await res.json()) as Coin[];
}

export async function fetchHistory(
  coinId: string,
  days = 7,
  signal?: AbortSignal
): Promise<{ t: number; p: number }[]> {
  const url = `${BASE}/coins/${coinId}/market_chart?vs_currency=eur&days=${days}`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error("No se pudo obtener el histórico");
  const data = await res.json();
  return (data.prices as [number, number][]).map(([t, p]) => ({ t, p }));
}
