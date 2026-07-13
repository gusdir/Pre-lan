// Punto único de acceso al backend de trading.
// Hoy: MockProvider (demo, sin dinero real).
// Futuro: cambiar esta línea por `new CdpProvider(API_KEY, API_SECRET)`.
import { MockProvider } from "./mockProvider";
import type { TradingProvider } from "./provider";

export const tradingProvider: TradingProvider = new MockProvider();

export * from "./provider";
export * from "./engine";
