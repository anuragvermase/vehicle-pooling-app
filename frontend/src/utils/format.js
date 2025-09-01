export const formatCurrency = (amount = 0, currency = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(amount);

export const formatKm = (km = 0) => `${Number(km).toLocaleString("en-IN")} km`;

export const formatDateTime = (iso) =>
  new Date(iso).toLocaleString("en-IN", { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });