import { callGroq } from "./groqClient";

function isBengaliQuery(text) {
  return /[\u0980-\u09FF]/.test(String(text || ""));
}

function buildReportContext(records) {
  const items = Array.isArray(records) ? records.slice(0, 8) : [];
  if (items.length === 0) {
    return "No report records available.";
  }

  return items
    .map((record, index) => {
      const location = [record.location_area, record.location_thana].filter(Boolean).join(", ");
      const sections = Array.isArray(record.applicable_sections)
        ? record.applicable_sections.join(", ")
        : "";

      return [
        `${index + 1}. Report ID: ${record.id || "N/A"}`,
        `Complainant: ${record.complainant_name || "N/A"}`,
        `Incident Type: ${record.incident_type || "N/A"}`,
        `Location: ${location || "N/A"}`,
        `Status: ${record.investigation_status || "Pending"}`,
        `Sections: ${sections || "N/A"}`
      ].join(" | ");
    })
    .join("\n");
}

export async function askPoliceReportChatbot({ userMessage, records, history = [] }) {
  const replyLanguage = isBengaliQuery(userMessage) ? "bengali" : "english";
  const contextSummary = buildReportContext(records);

  const systemPrompt = [
    "You are DMP Shohayok Assistant, a police-report support chatbot.",
    "Use the provided report record summary as context when relevant.",
    "If the user query is Bengali, answer fully in Bengali.",
    "If the user query is not Bengali, answer in English.",
    "Keep responses concise, practical, and relevant to police reporting/investigation workflow.",
    "If context is insufficient, say what additional detail is needed."
  ].join(" ");

  const historyMessages = history.slice(-8).map((message) => ({
    role: message.role === "assistant" ? "assistant" : "user",
    content: message.content
  }));

  const messages = [
    {
      role: "system",
      content: systemPrompt
    },
    ...historyMessages,
    {
      role: "user",
      content: [
        `Reply language: ${replyLanguage}.`,
        "Report store context summary:",
        contextSummary,
        "User query:",
        userMessage
      ].join("\n\n")
    }
  ];

  return callGroq(messages, { temperature: 0.2, maxTokens: 900 });
}
