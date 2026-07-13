// On-ramp real (Fase 1): integración con el widget de MoonPay.
// Convierte EUR -> cripto. El KYC lo hace MoonPay dentro del widget.
// La acreditacion real de la cripto la hace un webhook server-side (fase posterior),
// nunca el cliente. Aqui solo construimos y abrimos la URL del widget.

const BASE = (test?: boolean) =>
  test ? "https://buy-test.moonpay.com" : "https://buy.moonpay.com";

export function isRealOnramp(): boolean {
  return import.meta.env.VITE_REAL_ONRAMP === "true";
}

export interface MoonpayDepositParams {
  fiatAmount: number;
  crypto?: string; // ej. usdc, eth, btc
  wallet: string; // direccion de destino que acreditara el webhook
  fiatCurrency?: string; // EUR por defecto
}

export function buildWidgetUrl(p: MoonpayDepositParams): string {
  const apiKey = import.meta.env.VITE_MOONPAY_API_KEY;
  if (!apiKey) throw new Error("Falta VITE_MOONPAY_API_KEY");
  const test = import.meta.env.VITE_MOONPAY_TEST === "true";
  const q = new URLSearchParams({
    apiKey,
    cryptoCurrencyCode: p.crypto ?? "usdc",
    fiatCurrencyCode: p.fiatCurrency ?? "EUR",
    fiatAmount: String(p.fiatAmount),
    walletAddress: p.wallet,
    // Vincula el KYC de MoonPay con el usuario para no pedirlo dos veces.
    externalCustomerId: p.wallet,
  });
  return `${BASE(test)}?${q.toString()}`;
}

export function openDeposit(p: MoonpayDepositParams): void {
  const url = buildWidgetUrl(p);
  window.open(url, "_blank", "width=420,height=760");
}
