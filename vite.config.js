import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";

function readEnvConfigFromFile(filePath) {
  const result = {
    groqKey: "",
    openRouterKey: "",
    provider: ""
  };

  try {
    if (!fs.existsSync(filePath)) {
      return result;
    }

    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split(/\r?\n/);

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const match = trimmed.match(
        /^(GROQ_API_KEY|VITE_GROQ_API_KEY|OPENROUTER_API_KEY|VITE_OPENROUTER_API_KEY|LLM_PROVIDER)\s*=\s*(.*)$/
      );
      if (!match) {
        continue;
      }

      const name = match[1];
      const value = match[2].trim().replace(/^['\"]|['\"]$/g, "");
      if (!value) {
        continue;
      }

      if (name === "GROQ_API_KEY" || name === "VITE_GROQ_API_KEY") {
        result.groqKey = value;
      }

      if (name === "OPENROUTER_API_KEY" || name === "VITE_OPENROUTER_API_KEY") {
        result.openRouterKey = value;
      }

      if (name === "LLM_PROVIDER") {
        result.provider = value.toLowerCase();
      }
    }
  } catch {
    return result;
  }

  return result;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const rootEnvPath = path.resolve(process.cwd(), ".env");
  const srcEnvPath = path.resolve(process.cwd(), "src", ".env");

  const srcEnvConfig = readEnvConfigFromFile(srcEnvPath);
  const rootEnvConfig = readEnvConfigFromFile(rootEnvPath);

  const resolvedGroqKey =
    srcEnvConfig.groqKey || rootEnvConfig.groqKey || env.GROQ_API_KEY || env.VITE_GROQ_API_KEY || "";

  const resolvedOpenRouterKey =
    srcEnvConfig.openRouterKey ||
    rootEnvConfig.openRouterKey ||
    env.OPENROUTER_API_KEY ||
    env.VITE_OPENROUTER_API_KEY ||
    "";

  const explicitProvider =
    srcEnvConfig.provider || rootEnvConfig.provider || (env.LLM_PROVIDER || "").toLowerCase();

  const resolvedProvider = explicitProvider || (resolvedOpenRouterKey ? "openrouter" : "groq");

  const keySource = srcEnvConfig.groqKey || srcEnvConfig.openRouterKey
    ? "src/.env"
    : rootEnvConfig.groqKey || rootEnvConfig.openRouterKey
      ? ".env"
      :
          env.GROQ_API_KEY ||
          env.VITE_GROQ_API_KEY ||
          env.OPENROUTER_API_KEY ||
          env.VITE_OPENROUTER_API_KEY
        ? "vite-loadEnv"
        : "missing";

  return {
    plugins: [react()],
    define: {
      __GROQ_API_KEY__: JSON.stringify(resolvedGroqKey),
      __OPENROUTER_API_KEY__: JSON.stringify(resolvedOpenRouterKey),
      __LLM_PROVIDER__: JSON.stringify(resolvedProvider),
      __GROQ_API_KEY_SOURCE__: JSON.stringify(keySource)
    }
  };
});
