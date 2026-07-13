// Tipo de cambio EUR/USD para convertir los precios USD de Coinbase a EUR.
// Fuente: CoinGecko exchange_rates (gratis, sin clave). Se sincroniza cada 60s.

const FX_URL = "https://api.coingecko.com/api/v3/exchange_rates";

// Valor de respaldo por si la API falla (aprox. 2026).
let rate = 0.92;
let timer: ReturnType<typeof setInterval> | null = null;

export function getEurUsd(): number {
  return rate;
}

export function startEurUsdSync(onRate?: (r: number) => void): () => void {
  const load = async () => {
    try {
      const res = await fetch(FX_URL);
      if (!res.ok) return;
      const data = await res.json();
      const eur = data?.rates?.eur?.value;
      const usd = data?.rates?.usd?.value;
      if (eur && usd) {
        rate = eur / usd;
        onRate?.(rate);
      }
    } catch {
      /* mantiene el último valor conocido */
    }
  };
  load();
  timer = setInterval(load, 60_000);
  return () => {
    if (timer) clearInterval(timer);
  };
}
