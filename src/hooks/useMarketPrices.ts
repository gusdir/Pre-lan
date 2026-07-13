import { useEffect, useState } from "react";
import { fetchMarkets } from "../lib/market/prices";
import { startLivePrices, type LivePricesHandle } from "../lib/market/livePrices";
import type { Coin } from "../types";

export function useMarketPrices() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let handle: LivePricesHandle | null = null;
    let active = true;

    fetchMarkets()
      .then((initial) => {
        if (!active) return;
        setCoins(initial);
        handle = startLivePrices(initial, {
          onUpdate: (id, price, changePct) =>
            setCoins((prev) =>
              prev.map((c) =>
                c.id === id
                  ? {
                      ...c,
                      current_price: price,
                      price_change_percentage_24h:
                        changePct ?? c.price_change_percentage_24h,
                    }
                  : c
              )
            ),
          onError: () => setLive(false),
        });
        setLive(true);
      })
      .catch(() => {
        if (active) setError("No se pudieron cargar los precios (límite de API o sin red).");
      });

    return () => {
      active = false;
      handle?.stop();
    };
  }, []);

  return { coins, error, live };
}
