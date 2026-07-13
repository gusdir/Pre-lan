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
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-brand text-sm font-extrabold text-white shadow-sm">
              P
            </div>
            <span className="text-lg font-extrabold tracking-tight text-gray-900">
              Pre<span className="text-brand">-lan</span>
            </span>
          </div>
          <nav className="hidden gap-1 sm:flex">
            {tabs.map(([k, label]) => (
              <button
                key={k}
                onClick={() => onTab(k)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  tab === k
                    ? "bg-brand/10 text-brand"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
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
              className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-gray-50"
            >
              <span className="grid h-6 w-6 place-items-center rounded-full bg-gray-100 text-xs font-semibold uppercase text-gray-600">
                {user.email?.[0] ?? "?"}
              </span>
              <span className="hidden max-w-[8rem] truncate sm:block">
                {user.email?.split("@")[0]}
              </span>
            </button>
          ) : (
            <span className="rounded-xl bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-500">
              Invitado
            </span>
          )}
          {menu && user && (
            <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white p-1 shadow-lg">
              <button
                onClick={signOut}
                className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
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
