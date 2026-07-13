import { useState } from "react";
import { usePortfolio } from "../context/PortfolioContext";
import { eur } from "../lib/format";
import { FundsModal } from "./FundsModal";
import type { Coin } from "../types";

export function Portfolio({ coins }: { coins: Coin[] }) {
  const { cashEur, holdings } = usePortfolio();
  const [funds, setFunds] = useState<"deposit" | "withdraw" | null>(null);

  const priceOf = (id: string) => coins.find((c) => c.id === id)?.current_price ?? 0;

  const positions = Object.values(holdings).map((h) => {
    const value = h.amount * priceOf(h.coin_id);
    const cost = h.amount * h.avg_cost_eur;
    return { ...h, value, pnl: value - cost };
  });
  const invested = positions.reduce((a, p) => a + p.value, 0);
  const total = cashEur + invested;

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-gray-500">Valor total (demo)</p>
            <p className="tabular mt-1 text-3xl font-extrabold text-gray-900">{eur(total)}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFunds("deposit")}
              className="rounded-xl bg-brand px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-dark"
            >
              Ingresar
            </button>
            <button
              onClick={() => setFunds("withdraw")}
              className="rounded-xl border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              Retirar
            </button>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-xs font-medium text-gray-500">Efectivo</p>
            <p className="tabular mt-0.5 font-semibold text-gray-900">{eur(cashEur)}</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-xs font-medium text-gray-500">En cripto</p>
            <p className="tabular mt-0.5 font-semibold text-gray-900">{eur(invested)}</p>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Posiciones</h3>
        {positions.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">Sin posiciones abiertas.</p>
        ) : (
          <div className="space-y-2">
            {positions.map((p) => (
              <div
                key={p.coin_id}
                className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-xs font-bold uppercase text-gray-500 ring-1 ring-gray-100">
                    {p.symbol.slice(0, 2)}
                  </span>
                  <div>
                    <div className="text-sm font-semibold uppercase text-gray-900">
                      {p.symbol}
                    </div>
                    <div className="tabular text-xs text-gray-400">
                      {p.amount.toFixed(6)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="tabular text-sm font-semibold text-gray-900">
                    {eur(p.value)}
                  </div>
                  <div
                    className={`tabular text-xs font-medium ${
                      p.pnl >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {p.pnl >= 0 ? "+" : ""}
                    {eur(p.pnl)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {funds && <FundsModal mode={funds} onClose={() => setFunds(null)} />}
    </div>
  );
}
