import { usePortfolio } from "../context/PortfolioContext";
import { eur } from "../lib/format";

export function Activity() {
  const { trades, user } = usePortfolio();

  if (!user) {
    return (
      <div className="rounded-2xl border border-gray-200 p-6 text-center text-sm text-gray-400">
        Inicia sesión para ver tu historial.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 p-4">
      <h3 className="mb-3 text-sm font-semibold">Historial de operaciones</h3>
      {trades.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">Sin operaciones aún.</p>
      ) : (
        <div className="space-y-2">
          {trades.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between border-b border-gray-100 py-2 text-sm last:border-0"
            >
              <div>
                <span
                  className={`mr-2 font-medium uppercase ${
                    t.side === "buy" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {t.side === "buy" ? "Compra" : "Venta"}
                </span>
                <span className="uppercase text-gray-600">{t.symbol}</span>
              </div>
              <div className="text-right">
                <div className="font-medium">{eur(t.value_eur)}</div>
                <div className="text-xs text-gray-400">
                  {new Date(t.created_at).toLocaleString("es-ES")}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
