import { useState } from "react";
import { usePortfolio } from "../context/PortfolioContext";

const DOCS = ["DNI", "NIE", "Pasaporte"] as const;

export function KycModal({ onClose }: { onClose: () => void }) {
  const { submitKyc, kycStatus } = usePortfolio();
  const [fullName, setFullName] = useState("");
  const [docType, setDocType] = useState<(typeof DOCS)[number]>("DNI");
  const [docNumber, setDocNumber] = useState("");
  const [selfie, setSelfie] = useState(false);
  const [busy, setBusy] = useState(false);

  const pending = kycStatus === "pending";

  async function submit() {
    if (!fullName.trim() || !docNumber.trim() || !selfie) return;
    setBusy(true);
    try {
      await submitKyc({
        full_name: fullName.trim(),
        document_type: docType,
        document_number: docNumber.trim(),
        country: "ES",
      });
      // submitKyc deja kycStatus en "pending"; el contexto lo aprueba solo.
    } catch {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-1 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Verificación de identidad</h3>
            <p className="text-xs text-gray-500">KYC simulado · solo demo, no se envían datos reales</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        {pending ? (
          <div className="flex flex-col items-center gap-3 py-10">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-brand" />
            <p className="text-sm font-medium text-gray-600">Verificando identidad…</p>
            <p className="text-xs text-gray-400">Esto solo tardaría un momento.</p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Nombre completo
              </label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ana García López"
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  Documento
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as (typeof DOCS)[number])}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
                >
                  {DOCS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  Número
                </label>
                <input
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  placeholder="12345678A"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand"
                />
              </div>
            </div>
            <button
              onClick={() => setSelfie((s) => !s)}
              className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                selfie
                  ? "border-green-300 bg-green-50 text-green-700"
                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span>Selfie (simulada)</span>
              <span>{selfie ? "✓ Hecha" : "Hacer selfie"}</span>
            </button>
            <button
              disabled={busy || !fullName.trim() || !docNumber.trim() || !selfie}
              onClick={submit}
              className="mt-1 w-full rounded-xl bg-brand py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-dark disabled:opacity-50"
            >
              Enviar verificación
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
