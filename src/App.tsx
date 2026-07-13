import { lazy, Suspense, useEffect, useState } from "react";
import { PortfolioProvider, usePortfolio } from "./context/PortfolioContext";
import { useMarketPrices } from "./hooks/useMarketPrices";
import type { Coin, Tab } from "./types";
import { Navbar } from "./components/Navbar";
import { Markets } from "./components/Markets";
import { TradePanel } from "./components/TradePanel";
import { Portfolio } from "./components/Portfolio";
import { Activity } from "./components/Activity";
import { AuthModal } from "./components/AuthModal";

// Carga diferida del gráfico (recharts) para reducir el bundle inicial.
const PriceChart = lazy(() =>
  import("./components/PriceChart").then((m) => ({ default: m.PriceChart }))
);

function Shell() {
  const { user, ready } = usePortfolio();
  const { coins, error, live } = useMarketPrices();
  const [tab, setTab] = useState<Tab>("mercados");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const selected: Coin | null = coins.find((c) => c.id === selectedId) ?? null;

  // Selección por defecto del primer activo (estable frente a updates en vivo).
  useEffect(() => {
    if (!selectedId && coins.length > 0) setSelectedId(coins[0].id);
  }, [coins, selectedId]);

  function guard(action: Tab) {
    if ((action === "operar" || action === "cartera") && !user) {
      setShowAuth(true);
      return;
    }
    setTab(action);
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="demo-banner px-4 py-1.5 text-center text-xs">
        DEMO · Entorno de prueba para España · No se mueve dinero real · Precios de
        Coinbase (EUR) en vivo
      </div>

      <Navbar tab={tab} onTab={guard} />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">Mercados</h1>
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <span
              className={`h-2 w-2 rounded-full ${
                live ? "animate-pulse bg-green-500" : "bg-gray-300"
              }`}
            />
            {live ? "En vivo" : error ? "Sin conexión" : "Conectando…"}
          </span>
        </div>

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
            <Markets coins={coins} onSelect={(c) => setSelectedId(c.id)} />
            <div className="space-y-4">
              <Suspense
                fallback={
                  <div className="rounded-2xl border border-gray-200 p-4 text-center text-sm text-gray-400">
                    Cargando gráfico…
                  </div>
                }
              >
                <PriceChart coin={selected} />
              </Suspense>
              <TradePanel coin={selected} />
            </div>
          </div>
        )}

        {tab === "operar" && (
          <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
            <Markets coins={coins} onSelect={(c) => setSelectedId(c.id)} />
            <div className="space-y-4">
              <Suspense
                fallback={
                  <div className="rounded-2xl border border-gray-200 p-4 text-center text-sm text-gray-400">
                    Cargando gráfico…
                  </div>
                }
              >
                <PriceChart coin={selected} />
              </Suspense>
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
