function normalizeItem(item) {
  if (item === null || item === undefined) {
    return "";
  }

  if (typeof item === "string" || typeof item === "number" || typeof item === "boolean") {
    return String(item).trim();
  }

  if (Array.isArray(item)) {
    return item.map((value) => normalizeItem(value)).filter(Boolean).join(" ").trim();
  }

  if (typeof item === "object") {
    const candidate =
      item.type ||
      item.vehicle_type ||
      item.vehicle ||
      item.name ||
      item.title ||
      item.model ||
      item.value ||
      "";

    if (candidate) {
      return String(candidate).trim();
    }

    return Object.values(item)
      .map((value) => normalizeItem(value))
      .filter(Boolean)
      .join(" ")
      .trim();
  }

  return "";
}

export function toArrayValue(value) {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeItem(item)).filter(Boolean);
  }
  if (!value) {
    return [];
  }
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function isMostlyBengali(text) {
  const value = String(text || "");
  const letters = value.match(/[\u0980-\u09FFA-Za-z]/g) || [];
  if (letters.length === 0) {
    return false;
  }

  const bengaliLetters = value.match(/[\u0980-\u09FF]/g) || [];
  return bengaliLetters.length / letters.length >= 0.6;
}
