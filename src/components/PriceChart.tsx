import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fetchHistory } from "../lib/market";
import { eur } from "../lib/format";
import type { Coin } from "../types";

export function PriceChart({ coin }: { coin: Coin | null }) {
  const [data, setData] = useState<{ t: number; p: number }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!coin) return;
    const ctrl = new AbortController();
    setLoading(true);
    fetchHistory(coin.id, ctrl.signal)
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [coin]);

  if (!coin) return null;

  return (
    <div className="rounded-2xl border border-gray-200 p-4">
      <div className="mb-2 flex items-baseline justify-between">
        <div>
          <h3 className="text-base font-semibold">{coin.name}</h3>
          <p className="text-xs uppercase text-gray-400">{coin.symbol}</p>
        </div>
        <span className="text-xl font-bold">{eur(coin.current_price)}</span>
      </div>
      <div className="h-64 w-full">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            Cargando gráfico…
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0052FF" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#0052FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="t" hide />
              <YAxis domain={["auto", "auto"]} hide />
              <Tooltip
                formatter={(v: any) => eur(Number(v))}
                labelFormatter={(l: any) => new Date(Number(l)).toLocaleDateString("es-ES")}
              />
              <Area type="monotone" dataKey="p" stroke="#0052FF" fill="url(#g)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
