import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";

function readEnvConfigFromFile(filePath) {
  const result = {
    groqKey: "",
    openRouterKey: "",
    azureToken: "",
    azureEndpoint: "",
    azureModel: "",
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
        /^(GROQ_API_KEY|VITE_GROQ_API_KEY|OPENROUTER_API_KEY|VITE_OPENROUTER_API_KEY|GITHUB_TOKEN|VITE_GITHUB_TOKEN|AZURE_INFERENCE_ENDPOINT|VITE_AZURE_INFERENCE_ENDPOINT|AZURE_MODEL_NAME|VITE_AZURE_MODEL_NAME|LLM_PROVIDER)\s*=\s*(.*)$/
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

      if (name === "GITHUB_TOKEN" || name === "VITE_GITHUB_TOKEN") {
        result.azureToken = value;
      }

      if (name === "AZURE_INFERENCE_ENDPOINT" || name === "VITE_AZURE_INFERENCE_ENDPOINT") {
        result.azureEndpoint = value;
      }

      if (name === "AZURE_MODEL_NAME" || name === "VITE_AZURE_MODEL_NAME") {
        result.azureModel = value;
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

  const resolvedAzureToken =
    srcEnvConfig.azureToken ||
    rootEnvConfig.azureToken ||
    env.GITHUB_TOKEN ||
    env.VITE_GITHUB_TOKEN ||
    "";

  const resolvedAzureEndpoint =
    srcEnvConfig.azureEndpoint ||
    rootEnvConfig.azureEndpoint ||
    env.AZURE_INFERENCE_ENDPOINT ||
    env.VITE_AZURE_INFERENCE_ENDPOINT ||
    "https://models.github.ai/inference";

  const resolvedAzureModel =
    srcEnvConfig.azureModel ||
    rootEnvConfig.azureModel ||
    env.AZURE_MODEL_NAME ||
    env.VITE_AZURE_MODEL_NAME ||
    "meta/Llama-3.3-70B-Instruct";

  const explicitProvider =
    srcEnvConfig.provider || rootEnvConfig.provider || (env.LLM_PROVIDER || "").toLowerCase();

  const resolvedProvider =
    explicitProvider || (resolvedOpenRouterKey ? "openrouter" : resolvedAzureToken ? "azure" : "groq");

  const keySource = srcEnvConfig.groqKey || srcEnvConfig.openRouterKey || srcEnvConfig.azureToken
    ? "src/.env"
    : rootEnvConfig.groqKey || rootEnvConfig.openRouterKey || rootEnvConfig.azureToken
      ? ".env"
      :
          env.GROQ_API_KEY ||
          env.VITE_GROQ_API_KEY ||
          env.OPENROUTER_API_KEY ||
          env.VITE_OPENROUTER_API_KEY ||
          env.GITHUB_TOKEN ||
          env.VITE_GITHUB_TOKEN
        ? "vite-loadEnv"
        : "missing";

  return {
    plugins: [react()],
    define: {
      __GROQ_API_KEY__: JSON.stringify(resolvedGroqKey),
      __OPENROUTER_API_KEY__: JSON.stringify(resolvedOpenRouterKey),
      __AZURE_GITHUB_TOKEN__: JSON.stringify(resolvedAzureToken),
      __AZURE_INFERENCE_ENDPOINT__: JSON.stringify(resolvedAzureEndpoint),
      __AZURE_MODEL_NAME__: JSON.stringify(resolvedAzureModel),
      __LLM_PROVIDER__: JSON.stringify(resolvedProvider),
      __GROQ_API_KEY_SOURCE__: JSON.stringify(keySource)
    }
  };
});
