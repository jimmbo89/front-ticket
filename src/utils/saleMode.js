export const SALE_MODE_COLORS = Object.freeze({
  express: "#16845b",
  full: "#2454d6",
});

function getRawSaleMode(value) {
  if (value && typeof value === "object") {
    return (
      value.sale_mode ??
      value.saleMode ??
      value.sale_mode_label ??
      value.saleModeLabel
    );
  }

  return value;
}

export function normalizeSaleMode(value) {
  const normalized = String(getRawSaleMode(value) ?? "normal")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[-\s]+/g, "_");

  return ["express", "venta_express"].includes(normalized)
    ? "express"
    : "normal";
}

export function getSaleModeLabel(value) {
  return normalizeSaleMode(value) === "express" ? "Express" : "Full";
}

export function getSaleModeColor(value) {
  return normalizeSaleMode(value) === "express"
    ? SALE_MODE_COLORS.express
    : SALE_MODE_COLORS.full;
}
