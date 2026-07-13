export const eur = (n: number) =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(n);

export const pct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;

export const num = (n: number, d = 6) =>
  new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 0,
    maximumFractionDigits: d,
  }).format(n);
