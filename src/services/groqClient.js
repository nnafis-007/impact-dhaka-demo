const injectedGroqApiKey =
  (typeof __GROQ_API_KEY__ !== "undefined" && __GROQ_API_KEY__) ||
  import.meta.env.VITE_GROQ_API_KEY ||
  import.meta.env.GROQ_API_KEY ||
  "";

const injectedOpenRouterApiKey =
  (typeof __OPENROUTER_API_KEY__ !== "undefined" && __OPENROUTER_API_KEY__) ||
  import.meta.env.VITE_OPENROUTER_API_KEY ||
  import.meta.env.OPENROUTER_API_KEY ||
  "";

const injectedAzureToken =
  (typeof __AZURE_GITHUB_TOKEN__ !== "undefined" && __AZURE_GITHUB_TOKEN__) ||
  import.meta.env.VITE_GITHUB_TOKEN ||
  import.meta.env.GITHUB_TOKEN ||
  "";

const injectedAzureEndpoint =
  (typeof __AZURE_INFERENCE_ENDPOINT__ !== "undefined" && __AZURE_INFERENCE_ENDPOINT__) ||
  import.meta.env.VITE_AZURE_INFERENCE_ENDPOINT ||
  import.meta.env.AZURE_INFERENCE_ENDPOINT ||
  "https://models.github.ai/inference";

const injectedAzureModel =
  (typeof __AZURE_MODEL_NAME__ !== "undefined" && __AZURE_MODEL_NAME__) ||
  import.meta.env.VITE_AZURE_MODEL_NAME ||
  import.meta.env.AZURE_MODEL_NAME ||
  "meta/Llama-3.3-70B-Instruct";

const injectedProvider =
  (typeof __LLM_PROVIDER__ !== "undefined" && __LLM_PROVIDER__) ||
  import.meta.env.LLM_PROVIDER ||
  (injectedOpenRouterApiKey ? "openrouter" : injectedAzureToken ? "azure" : "groq");

const injectedApiKeySource =
  (typeof __GROQ_API_KEY_SOURCE__ !== "undefined" && __GROQ_API_KEY_SOURCE__) || "unknown";

let cachedProvider = String(injectedProvider || "groq").toLowerCase();
let cachedApiKey =
  cachedProvider === "openrouter"
    ? injectedOpenRouterApiKey
    : cachedProvider === "azure"
      ? injectedAzureToken
      : injectedGroqApiKey;

function maskKey(key) {
  if (!key) {
    return "<empty>";
  }
  if (key.length <= 8) {
    return "****";
  }
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

export async function initializeGroqApiKey() {
  if (cachedProvider !== "openrouter" && cachedProvider !== "groq" && cachedProvider !== "azure") {
    cachedProvider = injectedOpenRouterApiKey ? "openrouter" : injectedAzureToken ? "azure" : "groq";
  }

  if (!cachedApiKey) {
    cachedApiKey =
      cachedProvider === "openrouter"
        ? injectedOpenRouterApiKey
        : cachedProvider === "azure"
          ? injectedAzureToken
          : injectedGroqApiKey;
  }

  if (cachedApiKey) {
    console.info(
      `[DMP] Key debug: provider=${cachedProvider}, source=${injectedApiKeySource}, key=${maskKey(cachedApiKey)}`
    );
    return cachedApiKey;
  }

  console.warn(
    "[DMP] Key debug: no API key injected by Vite for selected provider. Check .env placement and restart dev server."
  );
  return "";
}

export function getGroqApiKey() {
  return cachedApiKey;
}

export async function callGroq(messages, options = {}) {
  const resolvedKey = await initializeGroqApiKey();
  const apiKey = options.apiKey || resolvedKey;

  if (!apiKey) {
    throw new Error("Missing API key for configured provider. Add it to root .env or src/.env and reload.");
  }

  console.debug(
    `[DMP] ${cachedProvider} request using key ${maskKey(apiKey)} and ${messages.length} message(s)`
  );

  if (cachedProvider === "openrouter") {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        // model: "google/gemma-4-31b-it:free",
        model: "meta-llama/llama-3.3-70b-instruct:free",
        max_tokens: options.maxTokens || 1800,
        temperature: options.temperature ?? 0.1,
        top_p: 1,
        stream: true,
        messages
      })
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`OpenRouter API failed (${response.status}): ${detail}`);
    }

    const json = await response.json();
    const content = json?.choices?.[0]?.message?.content || "";

    if (!String(content).trim()) {
      throw new Error("Empty response from OpenRouter.");
    }

    return content;
  }

  if (cachedProvider === "azure") {
    const endpoint = String(options.azureEndpoint || injectedAzureEndpoint || "https://models.github.ai/inference").replace(/\/+$/, "");
    const response = await fetch(`${endpoint}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: options.model || injectedAzureModel || "meta/Llama-3.3-70B-Instruct",
        messages,
        temperature: options.temperature ?? 0.1,
        top_p: 1,
        max_tokens: options.maxTokens || 1800
      })
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Azure Inference API failed (${response.status}): ${detail}`);
    }

    const json = await response.json();
    const content = json?.choices?.[0]?.message?.content || "";

    if (!String(content).trim()) {
      throw new Error("Empty response from Azure Inference provider.");
    }

    return content;
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: options.model || "llama-3.3-70b-versatile",
    //   model: "qwen/qwen3-32b",
      max_completion_tokens: options.maxTokens || 1800,
      temperature: options.temperature ?? 0.1,
      top_p: 1,
      stream: false,
      messages
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Groq API failed (${response.status}): ${detail}`);
  }

  const json = await response.json();
  const content = json?.choices?.[0]?.message?.content || "";

  if (!String(content).trim()) {
    throw new Error("Empty response from Groq.");
  }

  return content;
}
