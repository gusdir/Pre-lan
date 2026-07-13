import type { Coin } from "../types";
import { eur, pct } from "../lib/format";

export function Markets({ coins, onSelect }: { coins: Coin[]; onSelect: (c: Coin) => void }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left text-gray-500">
          <tr>
            <th className="px-4 py-3 font-medium">Activo</th>
            <th className="px-4 py-3 text-right font-medium">Precio</th>
            <th className="px-4 py-3 text-right font-medium">24h</th>
            <th className="px-4 py-3 text-right font-medium">Cap. mercado</th>
          </tr>
        </thead>
        <tbody>
          {coins.map((c) => (
            <tr
              key={c.id}
              onClick={() => onSelect(c)}
              className="cursor-pointer border-t border-gray-100 hover:bg-gray-50"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <img src={c.image} alt="" className="h-7 w-7 rounded-full" />
                  <div>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs uppercase text-gray-400">{c.symbol}</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-right font-medium">{eur(c.current_price)}</td>
              <td
                className={`px-4 py-3 text-right font-medium ${
                  c.price_change_percentage_24h >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {pct(c.price_change_percentage_24h)}
              </td>
              <td className="px-4 py-3 text-right text-gray-500">
                {eur(c.market_cap).replace(/\.\d+$/, "")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
