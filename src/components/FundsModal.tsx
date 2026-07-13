import { useState } from "react";
import { usePortfolio } from "../context/PortfolioContext";
import { depositQuote, withdrawQuote } from "../lib/account";
import { eur } from "../lib/format";

export function FundsModal({
  mode,
  onClose,
}: {
  mode: "deposit" | "withdraw";
  onClose: () => void;
}) {
  const { deposit, withdraw, cashEur } = usePortfolio();
  const [amount, setAmount] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const euros = parseFloat(amount) || 0;
  const quote =
    mode === "deposit" ? depositQuote(euros) : withdrawQuote(euros);

  async function submit() {
    setMsg(null);
    if (euros <= 0) return setMsg("Introduce un importe mayor que 0.");
    setBusy(true);
    try {
      if (mode === "deposit") await deposit(euros);
      else await withdraw(euros);
      onClose();
    } catch (e: any) {
      setMsg(e?.message ?? "Error en la operación.");
    } finally {
      setBusy(false);
    }
  }

  const title = mode === "deposit" ? "Ingresar fondos" : "Retirar fondos";
  const btn = mode === "deposit" ? "Ingresar (demo)" : "Retirar (demo)";

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>
        <label className="mb-1 block text-xs text-gray-500">Importe (EUR)</label>
        <input
          type="number"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
        <div className="mt-2 flex justify-between text-xs text-gray-500">
          <span>Comisión ({(mode === "deposit" ? 1.5 : 0).toFixed(1)}%)</span>
          <span>{eur(quote.feeEur)}</span>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>{mode === "deposit" ? "Entra a cartera" : "Sale de cartera"}</span>
          <span>{eur(quote.grossEur)}</span>
        </div>
        {mode === "withdraw" && (
          <p className="mt-1 text-xs text-gray-400">Saldo disponible: {eur(cashEur)}</p>
        )}
        {msg && <p className="mb-2 mt-2 text-xs text-red-600">{msg}</p>}
        <button
          disabled={busy}
          onClick={submit}
          className="mt-4 w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
        >
          {busy ? "Procesando…" : btn}
        </button>
      </div>
    </div>
  );
}
