const EN_TO_BN_DIGITS = {
  "0": "০",
  "1": "১",
  "2": "২",
  "3": "৩",
  "4": "৪",
  "5": "৫",
  "6": "৬",
  "7": "৭",
  "8": "৮",
  "9": "৯"
};

export function toBanglaDigits(value) {
  return String(value || "").replace(/[0-9]/g, (digit) => EN_TO_BN_DIGITS[digit] || digit);
}

export function formatLegalSection(section) {
  const text = String(section || "").trim();
  if (!text) {
    return "";
  }

  const normalized = text.replace(/\bsection\b/gi, "ধারা");
  return toBanglaDigits(normalized);
}

export function formatLegalSections(sections) {
  if (!Array.isArray(sections)) {
    return [];
  }

  return sections.map((item) => formatLegalSection(item)).filter(Boolean);
}
