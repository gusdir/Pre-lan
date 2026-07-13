import { useEffect, useRef, useState } from "react";
import { PortfolioProvider, usePortfolio } from "./context/PortfolioContext";
import { fetchMarkets } from "./lib/market";
import type { Coin, Tab } from "./types";
import { Navbar } from "./components/Navbar";
import { Markets } from "./components/Markets";
import { PriceChart } from "./components/PriceChart";
import { TradePanel } from "./components/TradePanel";
import { Portfolio } from "./components/Portfolio";
import { Activity } from "./components/Activity";
import { AuthModal } from "./components/AuthModal";

function Shell() {
  const { user, ready } = usePortfolio();
  const [tab, setTab] = useState<Tab>("mercados");
  const [coins, setCoins] = useState<Coin[]>([]);
  const [selected, setSelected] = useState<Coin | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const refreshTimer = useRef<number | null>(null);

  // Precios en vivo (CoinGecko, EUR). Demo: sin clave, rate-limited.
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchMarkets();
        setCoins(data);
        setSelected((prev) => prev ?? data[0] ?? null);
        setError(null);
      } catch {
        setError("No se pudieron cargar los precios (límite de API o sin red).");
      }
    };
    load();
    refreshTimer.current = window.setInterval(load, 60_000); // cada 60s
    return () => {
      if (refreshTimer.current) window.clearInterval(refreshTimer.current);
    };
  }, []);

  function guard(action: Tab) {
    if ((action === "operar" || action === "cartera") && !user) {
      setShowAuth(true);
      return;
    }
    setTab(action);
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="demo-banner px-4 py-1.5 text-center text-xs">
        DEMO · Entorno de prueba para España · No se mueve dinero real · Precios de
        CoinGecko (EUR)
      </div>

      <Navbar tab={tab} onTab={guard} />

      <main className="mx-auto max-w-6xl px-4 py-6">
        {error && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
            {error}
          </div>
        )}

        {!ready && user && (
          <p className="py-10 text-center text-sm text-gray-400">Cargando cartera…</p>
        )}

        {tab === "mercados" && (
          <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
            <Markets coins={coins} onSelect={setSelected} />
            <div className="space-y-4">
              <PriceChart coin={selected} />
              <TradePanel coin={selected} />
            </div>
          </div>
        )}

        {tab === "operar" && (
          <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
            <Markets coins={coins} onSelect={setSelected} />
            <div className="space-y-4">
              <PriceChart coin={selected} />
              <TradePanel coin={selected} />
            </div>
          </div>
        )}

        {tab === "cartera" && <Portfolio coins={coins} />}

        {tab === "actividad" && <Activity />}
      </main>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <PortfolioProvider>
      <Shell />
    </PortfolioProvider>
  );
}
