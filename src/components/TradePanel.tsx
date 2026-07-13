import { useMemo, useState } from "react";
import { usePortfolio } from "../context/PortfolioContext";
import { tradingProvider } from "../lib/trading";
import { eur } from "../lib/format";
import type { Coin } from "../types";

const QUICK = [0.25, 0.5, 0.75, 1];

export function TradePanel({
  coin,
  onRequireKyc,
}: {
  coin: Coin | null;
  onRequireKyc?: () => void;
}) {
  const { user, ready, cashEur, executeTrade, kycStatus } = usePortfolio();
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amountEur, setAmountEur] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!coin) {
    return (
      <div className="card p-6 text-center text-sm text-gray-400">
        Selecciona un activo en <b>Mercados</b> para operar.
      </div>
    );
  }

  const euros = parseFloat(amountEur) || 0;
  const quote = useMemo(
    () =>
      tradingProvider.quote({
        coinId: coin!.id,
        symbol: coin!.symbol,
        side,
        amountEur: euros,
        priceEur: coin!.current_price,
      }),
    [coin, side, euros]
  );

  async function submit() {
    setMsg(null);
    if (!user) return setMsg("Inicia sesión para operar.");
    if (euros <= 0) return setMsg("Introduce un importe mayor que 0.");
    if (side === "buy" && euros > cashEur) return setMsg("Saldo insuficiente (demo).");
    setBusy(true);
    try {
      await executeTrade({
        coinId: coin!.id,
        symbol: coin!.symbol,
        side,
        amountEur: euros,
        priceEur: coin!.current_price,
      });
      setMsg(`Orden ${side === "buy" ? "de compra" : "de venta"} simulada ejecutada.`);
      setAmountEur("");
    } catch (e: any) {
      const m = e?.message ?? "";
      if (m.startsWith("KYC_REQUIRED")) {
        setMsg("Debes verificar tu identidad (KYC) para operar.");
        onRequireKyc?.();
      } else {
        setMsg(m || "Error al operar.");
      }
    } finally {
      setBusy(false);
    }
  }

  const accent = side === "buy" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700";

  return (
    <div className="card p-5">
      {user && kycStatus !== "verified" && (
        <button
          onClick={onRequireKyc}
          className="mb-4 flex w-full items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-left text-sm transition-colors hover:bg-amber-100"
        >
          <span className="font-medium text-amber-800">
            {kycStatus === "pending" ? "Verificación en proceso…" : "Verifica tu identidad (KYC)"}
          </span>
          <span className="text-amber-600">{kycStatus === "pending" ? "…" : "→"}</span>
        </button>
      )}

      <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-gray-100 p-1 text-sm font-semibold">
        {(["buy", "sell"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSide(s)}
            className={`rounded-lg py-2 transition-colors ${
              side === s
                ? s === "buy"
                  ? "bg-green-600 text-white shadow-sm"
                  : "bg-red-600 text-white shadow-sm"
                : "text-gray-500"
            }`}
          >
            {s === "buy" ? "Comprar" : "Vender"}
          </button>
        ))}
      </div>

      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-gray-900">{coin.name}</span>
        <span className="tabular text-gray-500">{eur(coin.current_price)}</span>
      </div>

      <label className="mb-1 block text-xs font-medium text-gray-500">
        Importe (EUR)
      </label>
      <div className="flex items-center rounded-xl border border-gray-300 bg-white px-3 transition-colors focus-within:border-brand">
        <span className="text-gray-400">€</span>
        <input
          type="number"
          inputMode="decimal"
          value={amountEur}
          onChange={(e) => setAmountEur(e.target.value)}
          placeholder="0.00"
          className="tabular w-full bg-transparent px-2 py-2.5 text-sm font-medium outline-none"
        />
      </div>

      {side === "buy" && (
        <div className="mt-2 grid grid-cols-4 gap-1">
          {QUICK.map((q) => (
            <button
              key={q}
              onClick={() => setAmountEur((cashEur * q).toFixed(2))}
              className="rounded-lg bg-gray-50 py-1 text-xs font-semibold text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
            >
              {q * 100}%
            </button>
          ))}
        </div>
      )}

      <div className="mt-3 space-y-1 rounded-xl bg-gray-50 p-3 text-xs">
        <div className="flex justify-between text-gray-500">
          <span>Recibirás (est.)</span>
          <span className="tabular font-medium text-gray-800">
            {quote.units.toFixed(6)} {coin.symbol.toUpperCase()}
          </span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>Comisión ({(quote.feePct * 100).toFixed(2)}%)</span>
          <span className="tabular font-medium text-gray-800">{eur(quote.feeEur)}</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>Saldo demo</span>
          <span className="tabular font-medium text-gray-800">{eur(cashEur)}</span>
        </div>
      </div>

      <button
        disabled={busy || !ready}
        onClick={submit}
        className={`mt-4 w-full rounded-xl py-3 text-sm font-bold text-white shadow-sm transition-colors disabled:opacity-50 ${accent}`}
      >
        {busy ? "Procesando…" : side === "buy" ? "Comprar (demo)" : "Vender (demo)"}
      </button>

      {msg && <p className="mt-2 text-center text-xs text-gray-600">{msg}</p>}
    </div>
  );
}
