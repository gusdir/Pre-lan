import { fetchMarkets } from "./prices";
import { PRODUCT_BY_COIN } from "./config";
import { getEurUsd, startEurUsdSync } from "./fx";
import type { Coin } from "../../types";

// WebSocket público de Coinbase (sin auth). Documentado en docs/coinbase-exchange.
const WS_URL = "wss://ws-feed.exchange.coinbase.com";

export interface LivePricesHandle {
  stop: () => void;
}

interface LiveCallbacks {
  onUpdate: (coinId: string, priceEur: number, changePct?: number) => void;
  onError?: () => void;
}

// Arranca precios en tiempo real. Si el WS falla, cae a polling por HTTP.
export function startLivePrices(initial: Coin[], cb: LiveCallbacks): LivePricesHandle {
  const stoppers: Array<() => void> = [];
  let stopped = false;

  const stopAll = () => {
    stopped = true;
    stoppers.forEach((s) => s());
  };

  // Tipo de cambio EUR/USD.
  stoppers.push(startEurUsdSync());

  const subs = initial
    .map((c) => ({ id: c.id, product: PRODUCT_BY_COIN[c.id] }))
    .filter((s): s is { id: string; product: string } => Boolean(s.product));

  const productToCoin = new Map(subs.map((s) => [s.product, s.id]));
  const productIds = subs.map((s) => s.product);

  let pollTimer: ReturnType<typeof setInterval> | null = null;

  const startPolling = () => {
    if (pollTimer != null || stopped) return;
    pollTimer = setInterval(async () => {
      try {
        const data = await fetchMarkets();
        data.forEach((c) => cb.onUpdate(c.id, c.current_price, c.price_change_percentage_24h));
      } catch {
        /* ignora */
      }
    }, 30_000);
    stoppers.push(() => {
      if (pollTimer != null) clearInterval(pollTimer);
      pollTimer = null;
    });
  };

  try {
    const ws = new WebSocket(WS_URL);
    ws.onopen = () => {
      if (stopped) return;
      ws.send(
        JSON.stringify({ type: "subscribe", product_ids: productIds, channels: ["ticker"] })
      );
    };
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.type !== "ticker" || !productToCoin.has(msg.product_id)) return;
        const usd = parseFloat(msg.price);
        if (isNaN(usd)) return;
        const eur = usd * getEurUsd();
        let changePct: number | undefined;
        if (msg.open_24h) {
          const open = parseFloat(msg.open_24h);
          if (!isNaN(open) && open > 0) changePct = ((usd - open) / open) * 100;
        }
        cb.onUpdate(productToCoin.get(msg.product_id)!, eur, changePct);
      } catch {
        /* ignora mensajes malformados */
      }
    };
    ws.onerror = () => {
      cb.onError?.();
      startPolling();
    };
    ws.onclose = () => {
      if (!stopped) startPolling();
    };
    stoppers.push(() => {
      stopped = true;
      ws.close();
    });
  } catch {
    cb.onError?.();
    startPolling();
  }

  return { stop: stopAll };
}
