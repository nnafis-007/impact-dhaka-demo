export function toArrayValue(value) {
  if (Array.isArray(value)) {
    return value;
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
