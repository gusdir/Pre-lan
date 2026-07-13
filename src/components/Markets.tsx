import type { Coin } from "../types";
import { eur, pct } from "../lib/format";

export function Markets({ coins, onSelect }: { coins: Coin[]; onSelect: (c: Coin) => void }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-white/80 text-left text-xs uppercase tracking-wide text-gray-400 backdrop-blur">
            <tr>
              <th className="px-4 py-3 font-semibold">Activo</th>
              <th className="px-4 py-3 text-right font-semibold">Precio</th>
              <th className="px-4 py-3 text-right font-semibold">24h</th>
              <th className="hidden px-4 py-3 text-right font-semibold sm:table-cell">
                Cap. mercado
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {coins.map((c) => {
              const up = c.price_change_percentage_24h >= 0;
              return (
                <tr
                  key={c.id}
                  onClick={() => onSelect(c)}
                  className="cursor-pointer transition-colors hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={c.image}
                        alt=""
                        className="h-8 w-8 rounded-full ring-1 ring-gray-100"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">{c.name}</div>
                        <div className="text-xs uppercase text-gray-400">{c.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td className="tabular px-4 py-3 text-right font-semibold text-gray-900">
                    {eur(c.current_price)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`tabular inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                        up ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                      }`}
                    >
                      {pct(c.price_change_percentage_24h)}
                    </span>
                  </td>
                  <td className="tabular hidden px-4 py-3 text-right text-gray-500 sm:table-cell">
                    {eur(c.market_cap).replace(/\.\d+$/, "")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
