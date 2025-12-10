export function formatCurrency(value: number | string | bigint): string {
  const num = typeof value === "string" ? parseFloat(value) : typeof value === "bigint" ? Number(value) : value || 0;
  try {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);
  } catch (e) {
    return `Rp ${num.toLocaleString("id-ID")}`;
  }
}

export function formatDate(value?: string | Date | null): string {
  if (!value) return "-";
  const d = value instanceof Date ? value : new Date(value);
  return d.toLocaleString("id-ID");
}
