import { useState } from "react";
import { usePortfolio } from "../context/PortfolioContext";
import { eur } from "../lib/format";
import type { Coin } from "../types";

export function TradePanel({ coin }: { coin: Coin | null }) {
  const { user, ready, cashEur, executeTrade } = usePortfolio();
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amountEur, setAmountEur] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!coin) {
    return (
      <div className="rounded-2xl border border-gray-200 p-6 text-center text-sm text-gray-400">
        Selecciona un activo en <b>Mercados</b> para operar.
      </div>
    );
  }

  const euros = parseFloat(amountEur) || 0;
  const units = coin.current_price > 0 ? euros / coin.current_price : 0;

  async function submit() {
    setMsg(null);
    if (!user) return setMsg("Inicia sesión para operar.");
    if (euros <= 0) return setMsg("Introduce un importe mayor que 0.");
    if (side === "buy" && euros > cashEur)
      return setMsg("Saldo insuficiente (demo).");
    setBusy(true);
    try {
      // DEMO: no se mueve dinero real. Simula la ejecución a precio de mercado.
      await executeTrade({
        coin_id: coin!.id,
        symbol: coin!.symbol,
        side,
        amount: units,
        price_eur: coin!.current_price,
        value_eur: euros,
      });
      setMsg(`Orden ${side === "buy" ? "de compra" : "de venta"} simulada ejecutada.`);
      setAmountEur("");
    } catch (e: any) {
      setMsg(e?.message ?? "Error al operar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 p-4">
      <div className="mb-3 grid grid-cols-2 gap-1 rounded-xl bg-gray-100 p-1 text-sm font-medium">
        {(["buy", "sell"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSide(s)}
            className={`rounded-lg py-2 ${
              side === s
                ? s === "buy"
                  ? "bg-green-600 text-white"
                  : "bg-red-600 text-white"
                : "text-gray-600"
            }`}
          >
            {s === "buy" ? "Comprar" : "Vender"}
          </button>
        ))}
      </div>

      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-gray-500">{coin.name}</span>
        <span className="font-medium">{eur(coin.current_price)}</span>
      </div>

      <label className="mb-1 block text-xs text-gray-500">Importe (EUR)</label>
      <input
        type="number"
        inputMode="decimal"
        value={amountEur}
        onChange={(e) => setAmountEur(e.target.value)}
        placeholder="0.00"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
      />

      <div className="mt-2 flex justify-between text-xs text-gray-500">
        <span>Recibirás (est.)</span>
        <span>
          {units.toFixed(6)} {coin.symbol.toUpperCase()}
        </span>
      </div>
      <div className="mt-1 flex justify-between text-xs text-gray-500">
        <span>Saldo demo</span>
        <span>{eur(cashEur)}</span>
      </div>

      <button
        disabled={busy || !ready}
        onClick={submit}
        className="mt-4 w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
      >
        {busy ? "Procesando…" : side === "buy" ? "Comprar (demo)" : "Vender (demo)"}
      </button>

      {msg && <p className="mt-2 text-center text-xs text-gray-600">{msg}</p>}
    </div>
  );
}
