import { BPC_DATA } from "../data/bpcData";
import { parseJsonResponse } from "../utils/json";
import { isMostlyBengali, toArrayValue } from "../utils/text";
import { callGroq } from "./groqClient";

export const DEFAULT_ENTITIES = {
  complainant_name: null,
  accused_names: [],
  victim_names: [],
  location_area: null,
  location_thana: null,
  incident_date: null,
  incident_time: null,
  incident_type: null,
  evidence_mentioned: [],
  vehicles_mentioned: []
};

export const DEMO_SCENARIOS = [
  {
    id: "A",
    label: "Scenario A: Motorbike Theft",
    text: "আমি রাকিবুল হাসান। ২০২৬ সালের ১০ এপ্রিল রাত ১০টার দিকে ধানমন্ডি ২৭ নম্বর রোড, ধানমন্ডি থানার সামনে আমার Honda CB Twister (Dhaka Metro Ga 11-1234) চুরি হয়ে যায়। অজ্ঞাত একজন ব্যক্তি পার্কিং অবস্থায় মোটরসাইকেল নিয়ে পালিয়ে যায়।"
  },
  {
    id: "B",
    label: "Scenario B: Road Accident",
    text: "I am Karim Mia, 45, a rickshaw driver. On 10 April 2026 at 7:30 AM near Mirpur 10 roundabout under Mirpur Thana, a bus (Dhaka Metro B 15-5678) hit my rickshaw. I sustained serious head injuries and was taken to DMCH. The driver was speeding and fled immediately after the collision."
  },
  {
    id: "C",
    label: "Scenario C: Phone Snatching",
    text: "I am Nusrat Jahan. On 9 April 2026 at around 6:00 PM at Gulshan 1 Circle, Gulshan Thana, two men on a motorcycle snatched my Samsung A54 phone. They threatened me with a knife and escaped toward Badda to steal the phone quickly before police arrived."
  },
  {
    id: "D",
    label: "Scenario D: Incomplete Input (Validation Demo)",
    text: "একটা সমস্যা হয়েছে। আমার জিনিস হারিয়ে গেছে। দ্রুত ব্যবস্থা নিন।"
  }
];

function normalizeEntities(input = {}) {
  const output = { ...DEFAULT_ENTITIES, ...input };
  output.accused_names = toArrayValue(output.accused_names);
  output.victim_names = toArrayValue(output.victim_names);
  output.evidence_mentioned = toArrayValue(output.evidence_mentioned);
  output.vehicles_mentioned = toArrayValue(output.vehicles_mentioned);
  return output;
}

export async function validateIncidentInput(incidentText) {
  const systemPrompt = [
    "You are a duty officer assistant for Dhaka Metropolitan Police.",
    "Validate whether the incident description has enough minimum information to draft a legally meaningful police report.",
    "Required minimum data points:",
    "1) complainant identity",
    "2) incident location (area or thana)",
    "3) incident date/time or a clear time reference",
    "4) incident narrative that clearly states what happened",
    "Return ONLY valid JSON with this shape:",
    "{",
    "  \"is_valid\": true/false,",
    "  \"missing_fields\": [\"...\"],",
    "  \"clarification_questions\": [\"...\"],",
    "  \"notes\": \"short reason\"",
    "}",
    "No markdown, no extra text."
  ].join("\n");

  const raw = await callGroq([
    { role: "system", content: systemPrompt },
    { role: "user", content: incidentText }
  ]);

  const parsed = parseJsonResponse(raw);
  return {
    is_valid: !!parsed.is_valid,
    missing_fields: Array.isArray(parsed.missing_fields) ? parsed.missing_fields : [],
    clarification_questions: Array.isArray(parsed.clarification_questions)
      ? parsed.clarification_questions
      : [],
    notes: parsed.notes || ""
  };
}

export async function extractEntities(incidentText) {
  const systemPrompt = [
    "You are an AI assistant for Dhaka Metropolitan Police.",
    "Extract structured information from the incident description.",
    "Return ONLY valid JSON with these fields:",
    "complainant_name, accused_names (array), victim_names (array), location_area, location_thana, incident_date, incident_time, incident_type, evidence_mentioned (array), vehicles_mentioned (array).",
    "If a field is not mentioned, use null for scalar fields and [] for array fields.",
    "No markdown, no explanations."
  ].join("\n");

  const raw = await callGroq([
    { role: "system", content: systemPrompt },
    { role: "user", content: incidentText }
  ]);

  return normalizeEntities(parseJsonResponse(raw));
}

export async function generatePoliceReport(incidentText, entities) {
  const strictBengaliRule = [
    "The report_draft MUST be written in Bangla (Bengali script) only.",
    "Do not write English sentences in report_draft.",
    "Only legal section labels/codes may contain English numerals/roman text (e.g., Section 379)."
  ].join(" ");

  const fiveWRule = [
    "The report_draft must explicitly follow 5W structure in this exact order with clear Bengali labels:",
    "1) কে (Who), 2) কী (What), 3) কখন (When), 4) কোথায় (Where), 5) কেন/কিভাবে (Why/How).",
    "Each section must contain concrete incident-specific content, not generic placeholder text.",
    "Do not output only a '5W' title; populate all five subsections clearly."
  ].join(" ");

  const systemPrompt = [
    "You are a legal drafting assistant for Dhaka Metropolitan Police.",
    strictBengaliRule,
    fiveWRule,
    "Given an incident description and extracted entities, do two things:",
    "(1) Match relevant Bangladesh Penal Code/Nari Shishu sections from the provided reference.",
    "(2) Draft a formal police report in DMP style.",
    "Mandatory report sections: Report number placeholder, date/time, complainant details, incident narrative, accused details, applicable legal sections, officer remarks and signature placeholders.",
    "Return ONLY valid JSON in this schema:",
    "{\"bpc_matches\":[{\"section\":\"...\",\"title\":\"...\",\"justification\":\"...\",\"confidence\":0.0}],\"report_draft\":\"...\"}",
    "Reference Legal List:",
    JSON.stringify(BPC_DATA)
  ].join("\n");

  const raw = await callGroq([
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: `Incident:\n${incidentText}\n\nEntities:\n${JSON.stringify(entities)}`
    }
  ]);

  const parsed = parseJsonResponse(raw);
  const report = {
    bpc_matches: Array.isArray(parsed.bpc_matches) ? parsed.bpc_matches : [],
    report_draft: parsed.report_draft || ""
  };

  if (!isMostlyBengali(report.report_draft)) {
    throw new Error("Generated report is not sufficiently Bengali. Please refine incident details and retry.");
  }

  return report;
}
