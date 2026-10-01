export const SALE_MODE_COLORS = Object.freeze({
  express: "#16845b",
  full: "#2454d6",
  on_board: "#b45309",
  web: "#0369a1",
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

  if (["express", "venta_express"].includes(normalized)) {
    return "express";
  }

  if (
    [
      "on_board",
      "onboard",
      "aboard",
      "a_bordo",
      "abordo",
      "venta_a_bordo",
      "venta_abordo",
      "venta_aboard",
    ].includes(normalized)
  ) {
    return "on_board";
  }

  if (["web", "venta_web"].includes(normalized)) {
    return "web";
  }

  return "normal";
}

export function getSaleModeLabel(value) {
  const labels = {
    normal: "Full",
    express: "Express",
    on_board: "A bordo",
    web: "Web",
  };

  return labels[normalizeSaleMode(value)] || labels.normal;
}

export function getSaleModeColor(value) {
  const colors = {
    normal: SALE_MODE_COLORS.full,
    express: SALE_MODE_COLORS.express,
    on_board: SALE_MODE_COLORS.on_board,
    web: SALE_MODE_COLORS.web,
  };

  return colors[normalizeSaleMode(value)] || SALE_MODE_COLORS.full;
}
