import { usePortfolio } from "../context/PortfolioContext";
import { eur } from "../lib/format";
import type { Coin } from "../types";

export function Portfolio({ coins }: { coins: Coin[] }) {
  const { cashEur, holdings } = usePortfolio();
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
      <div className="rounded-2xl border border-gray-200 p-5">
        <p className="text-sm text-gray-500">Valor total (demo)</p>
        <p className="text-3xl font-bold">{eur(total)}</p>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-500">Efectivo</p>
            <p className="font-medium">{eur(cashEur)}</p>
          </div>
          <div>
            <p className="text-gray-500">En cripto</p>
            <p className="font-medium">{eur(invested)}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 p-4">
        <h3 className="mb-2 text-sm font-semibold">Posiciones</h3>
        {positions.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">
            Sin posiciones abiertas.
          </p>
        ) : (
          <div className="space-y-2">
            {positions.map((p) => (
              <div
                key={p.coin_id}
                className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm"
              >
                <div>
                  <div className="font-medium uppercase">{p.symbol}</div>
                  <div className="text-xs text-gray-400">{p.amount.toFixed(6)}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{eur(p.value)}</div>
                  <div
                    className={`text-xs ${
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
    </div>
  );
}
