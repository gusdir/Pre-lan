import { useState } from "react";
import { usePortfolio } from "../context/PortfolioContext";

export function AuthModal({ onClose }: { onClose: () => void }) {
  const { signIn, signUp } = usePortfolio();
  const [mode, setMode] = useState<"login" | "registro">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setMsg(null);
    setBusy(true);
    try {
      if (mode === "login") await signIn(email, password);
      else await signUp(email, password);
      onClose();
    } catch (e: any) {
      setMsg(e?.message ?? "Error de autenticación.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex justify-between">
          <h3 className="text-lg font-semibold">
            {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="correo@ejemplo.es"
          className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
        {msg && <p className="mb-2 text-xs text-red-600">{msg}</p>}
        <button
          disabled={busy}
          onClick={submit}
          className="w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
        >
          {busy ? "…" : mode === "login" ? "Entrar" : "Registrarme"}
        </button>
        <button
          onClick={() => setMode(mode === "login" ? "registro" : "login")}
          className="mt-3 w-full text-center text-xs text-gray-500 hover:text-brand"
        >
          {mode === "login"
            ? "¿No tienes cuenta? Regístrate"
            : "¿Ya tienes cuenta? Inicia sesión"}
        </button>
      </div>
    </div>
  );
}
