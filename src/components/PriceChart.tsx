import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fetchHistory } from "../lib/market/prices";
import { eur } from "../lib/format";
import type { Coin } from "../types";

const RANGES: { label: string; days: number }[] = [
  { label: "7D", days: 7 },
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "1A", days: 365 },
];

function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload as { t: number; p: number };
  return (
    <div className="rounded-xl border border-gray-200 bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur">
      <div className="font-semibold text-gray-900">{eur(point.p)}</div>
      <div className="text-gray-400">{new Date(point.t).toLocaleDateString("es-ES")}</div>
    </div>
  );
}

export function PriceChart({ coin }: { coin: Coin | null }) {
  const [days, setDays] = useState(7);
  const [data, setData] = useState<{ t: number; p: number }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!coin) return;
    const ctrl = new AbortController();
    setLoading(true);
    fetchHistory(coin.id, days, ctrl.signal)
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [coin, days]);

  if (!coin) return null;

  const up = coin.price_change_percentage_24h >= 0;

  return (
    <div className="card p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <img src={coin.image} alt="" className="h-6 w-6 rounded-full" />
            <h3 className="text-base font-bold text-gray-900">{coin.name}</h3>
            <span className="text-xs uppercase text-gray-400">{coin.symbol}</span>
          </div>
          <p className="mt-1 text-2xl font-extrabold tabular text-gray-900">
            {eur(coin.current_price)}
          </p>
        </div>
        <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
          {RANGES.map((r) => (
            <button
              key={r.days}
              onClick={() => setDays(r.days)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                days === r.days
                  ? "bg-white text-brand shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 w-full">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-40 w-full animate-pulse rounded-xl bg-gray-100" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={up ? "#16a34a" : "#dc2626"} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={up ? "#16a34a" : "#dc2626"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#eef1f5" vertical={false} />
              <XAxis
                dataKey="t"
                tickFormatter={(t) => new Date(t).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                minTickGap={40}
              />
              <YAxis domain={["auto", "auto"]} hide />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#cbd5e1", strokeDasharray: 4 }} />
              <Area
                type="monotone"
                dataKey="p"
                stroke={up ? "#16a34a" : "#dc2626"}
                strokeWidth={2}
                fill="url(#g)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
