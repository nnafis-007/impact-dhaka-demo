import { jsonrepair } from "jsonrepair";

function escapeControlCharsInQuotedStrings(input) {
  let result = "";
  let inString = false;
  let escaped = false;

  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];

    if (!inString) {
      if (ch === '"') {
        inString = true;
      }
      result += ch;
      continue;
    }

    if (escaped) {
      result += ch;
      escaped = false;
      continue;
    }

    if (ch === "\\") {
      result += ch;
      escaped = true;
      continue;
    }

    if (ch === '"') {
      inString = false;
      result += ch;
      continue;
    }

    // Repair invalid raw control characters inside string literals.
    if (ch === "\n") {
      result += "\\n";
      continue;
    }
    if (ch === "\r") {
      result += "\\r";
      continue;
    }
    if (ch === "\t") {
      result += "\\t";
      continue;
    }

    result += ch;
  }

  return result;
}

export function parseJsonResponse(rawText) {
  const trimmed = String(rawText || "").trim();

  try {
    return JSON.parse(trimmed);
  } catch (_) {
    const blockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (blockMatch && blockMatch[1]) {
      const blockText = blockMatch[1].trim();
      try {
        return JSON.parse(blockText);
      } catch {
        return JSON.parse(escapeControlCharsInQuotedStrings(blockText));
      }
    }

    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const jsonSlice = trimmed.slice(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(jsonSlice);
      } catch {
        const escaped = escapeControlCharsInQuotedStrings(jsonSlice);
        try {
          return JSON.parse(escaped);
        } catch {
          return JSON.parse(jsonrepair(escaped));
        }
      }
    }

    // Last-resort repair attempt for outputs that contain malformed arrays/objects.
    try {
      return JSON.parse(jsonrepair(trimmed));
    } catch {
      // keep behavior below
    }

    throw new Error("The API did not return valid JSON.");
  }
}
