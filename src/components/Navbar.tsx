import { useState } from "react";
import { usePortfolio } from "../context/PortfolioContext";

type TabKey = "mercados" | "operar" | "cartera" | "actividad";

export function Navbar({ tab, onTab }: { tab: TabKey; onTab: (t: TabKey) => void }) {
  const { user, signOut } = usePortfolio();
  const [menu, setMenu] = useState(false);
  const tabs: [TabKey, string][] = [
    ["mercados", "Mercados"],
    ["operar", "Operar"],
    ["cartera", "Cartera"],
    ["actividad", "Actividad"],
  ];

  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <span className="text-lg font-bold text-brand">Pre-lan</span>
          <nav className="hidden gap-1 sm:flex">
            {tabs.map(([k, label]) => (
              <button
                key={k}
                onClick={() => onTab(k)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                  tab === k ? "bg-brand/10 text-brand" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
        <div className="relative">
          {user ? (
            <button
              onClick={() => setMenu((m) => !m)}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium"
            >
              {user.email?.slice(0, 10)}…
            </button>
          ) : (
            <span className="text-sm text-gray-500">Invitado</span>
          )}
          {menu && user && (
            <div className="absolute right-0 mt-2 w-40 rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
              <button
                onClick={signOut}
                className="w-full rounded px-3 py-1.5 text-left text-sm hover:bg-gray-100"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
