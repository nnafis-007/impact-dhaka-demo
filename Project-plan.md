## Project: DMP Shohayok — AI-Assisted GD Report Generator
**Tagline:** *From spoken incident to filed GD in under 3 minutes*

---

## Part 1 — Product Requirement Document (PRD)

### Problem Statement

In Dhaka's thana-level police stations, every incident — theft, road accident, missing person, harassment — requires a **General Diary (GD)** entry. Officers write these by hand or in basic forms, manually referencing the Bangladesh Penal Code (BPC) for applicable sections. A single GD takes 30–50 minutes. With Dhaka Metropolitan Police handling thousands of daily incidents, this is a massive bottleneck that delays public service and pulls officers off the street.

### Solution

A web app where an officer types (or pastes) a brief incident description in Bangla or English. The system uses the LLM API to extract structured entities, match BPC sections, and auto-generate a formatted GD draft — ready for review and export in under 3 minutes.

### Target Users (for the demo)

The primary persona is a duty officer at a Dhaka thana who needs to log incidents quickly and accurately.

### Core Features for the PoC

**Feature 1 — Incident Input Interface.** A clean text area accepting a free-form incident description in Bangla, English, or Banglish (mixed). No speech-to-text in v1 — keep it simple.

**Feature 2 — AI Entity Extraction.** The Claude API reads the description and returns a structured JSON with: complainant name, accused name(s), victim name(s), location (thana, road, area), incident date/time, incident type, and any mentioned evidence or vehicles.

**Feature 3 — BPC Section Matching.** Against a pre-built reference JSON of ~25 common BPC sections (covering theft, assault, fraud, road accidents, harassment, missing persons), Claude identifies applicable sections with a plain-language justification for each.

**Feature 4 — GD Draft Generation.** Claude assembles a properly formatted GD narrative using DMP-style official language, incorporating extracted entities and matched BPC codes.

**Feature 5 — Review & Edit Interface.** The officer sees three panels side-by-side: extracted entities (editable fields), matched BPC codes (toggleable), and the generated GD draft (editable rich text). Any field edit triggers a live re-generation.

**Feature 6 — PDF Export.** One-click export of the final GD as a printable PDF using browser print or a library like jsPDF.

### Out of Scope for PoC

No database, no authentication, no actual DMP system integration, no training of custom models, no voice input, no Bangla OCR.

### Success Metrics for the Judges

The demo should show a measurable reduction in GD creation time (target: under 3 minutes vs 40+ minutes manually), 100% BPC code coverage for the 3 demo scenarios, and a professional output format matching real DMP GD structure.

---

## Part 2 — 5-Hour Implementation Plan

Here is how to allocate every hour. Work in a team of 2–3 for maximum speed.

---


**Step 1 (15 min):** Create a single `index.html` file. Import React, ReactDOM, Tailwind CSS, and jsPDF from CDN. No build step — this keeps the PoC deployable instantly. Alternatively, if your team knows Next.js, `npx create-next-app` with the app router takes under 5 minutes.

**Step 2 (15 min):** Build the BPC reference JSON. Create a file called `bpc_data.js` with an array of objects. Each object should have: `section` (e.g. "Section 379"), `title` (e.g. "Theft"), `description` (one sentence), and `keywords` (array of trigger words). Include these 25 sections at minimum: 379 (theft), 380 (dwelling theft), 392 (robbery), 302 (murder), 304 (culpable homicide), 323 (voluntarily causing hurt), 354 (assault on woman), 506 (criminal intimidation), 420 (cheating), 406 (criminal breach of trust), 279 (rash driving), 304A (death by negligence), 365 (kidnapping), 366 (abduction of woman), 411 (receiving stolen property), 427 (mischief), 447 (criminal trespass), 448 (house trespass), 500 (defamation), 34 (common intention), 120B (criminal conspiracy). Add Dhaka-specific additions: Nari O Shishu Nirjatan Daman Ain sections for harassment/violence against women (this scores major points with judges for local relevance).

**Step 3 (30 min):** Build the three-panel layout in HTML/React. Left panel: incident input textarea + "Generate GD" button. Middle panel: extracted entities as labeled fields. Right panel: GD draft text area. Use a simple grid with `display: grid; grid-template-columns: 1fr 1fr 1fr`. Don't style it yet — function first.

---

This is the heart of the demo. Write two API calls.

**Step 4 (30 min): Entity extraction call.** Write a function `extractEntities(incidentText)` that calls the LLM API with this system prompt:

> "You are an AI assistant for Dhaka Metropolitan Police. Extract structured information from the incident description. Return ONLY valid JSON with these fields: complainant_name, accused_names (array), victim_names (array), location_area, location_thana, incident_date, incident_time, incident_type, evidence_mentioned (array), vehicles_mentioned (array). If a field is not mentioned, use null. Do not include any text outside the JSON object."

Pass the officer's input as the user message. Parse the JSON response and populate the entity fields in the UI.

**Step 5 (30 min): BPC matching + GD generation call.** Write a second function `generateGDReport(incidentText, entities)` using this system prompt:

> "You are a legal assistant for Dhaka Metropolitan Police helping draft General Diary (GD) entries. Given an incident description and extracted entities, do two things: (1) Identify applicable Bangladesh Penal Code sections from this reference list: [INJECT bpc_data JSON HERE]. Return each match with a one-sentence justification. (2) Draft a formal GD entry in DMP format using official Bengali legal language conventions. The GD should include: GD number placeholder, date/time, complainant info, incident narrative, accused info, applicable BPC sections, and officer remarks section. Return as JSON: { bpc_matches: [{section, title, justification, confidence}], gd_draft: 'full GD text here' }"

Inject your entire `bpc_data` JSON into the system prompt. This is the key trick — you're using prompt-based retrieval instead of a trained retrieval model. It works perfectly for 25 sections.

---


**Step 6 (20 min):** Polish the UI. Use Tailwind classes for a clean government-portal aesthetic — white background, dark blue header bar with "DMP Shohayok" logo, a Bangladesh flag color accent (red/green). Add a loading spinner while API calls run. Add green checkmark badges next to each matched BPC section.

**Step 7 (40 min):** Build 3 hardcoded demo scenarios as buttons — this is critical for a smooth hackathon demo. Never rely on live typing during a presentation.

Scenario A — **Motorbike theft at Dhanmondi**: "আজ রাত ১০টার দিকে ধানমন্ডি ২৭ নম্বর রোডে আমার Honda CB Twister (Dhaka Metro Ga 11-1234) চুরি হয়ে গেছে। আমি রাকিবুল হাসান। চোরের চেহারা দেখা যায়নি।" (This in Bangla is deliberate — shows bilingual capability.)

Scenario B — **Road accident at Mirpur**: "On 10 April 2026 at approximately 7:30 AM near Mirpur 10 roundabout, a bus (Dhaka Metro B 15-5678) hit a rickshaw driver named Karim Mia, 45 years old. Karim sustained serious head injuries and was taken to DMCH. The bus driver fled the scene."

Scenario C — **Mobile phone snatching at Gulshan**: "Yesterday evening around 6 PM at Gulshan 1 circle, two men on a motorcycle snatched the mobile phone (Samsung A54) of complainant Nusrat Jahan. The accused threatened her with a knife before fleeing towards Badda."

Each scenario button pre-fills the input and auto-triggers the API calls. This makes the demo completely reproducible under pressure.

---

### Hour 4 (3:00–4:00) — PDF Export + Final Integration

**Step 8 (30 min):** Implement PDF export. Use jsPDF from CDN. Create a function `exportGD()` that formats the GD draft text with DMP letterhead elements (logo placeholder, station name, GD number, date). Add a footer with officer signature line and stamp placeholder. The output should look close enough to a real GD that judges can recognize the format.

**Step 9 (15 min):** Add an "impact metrics" section below the form that updates dynamically after each generation — showing "Estimated manual time: 40 min" vs "Time with DMP Shohayok: 3 min" and "Time saved: 37 minutes." Hardcode these numbers. They're realistic based on the original paper and make a strong impression.

**Step 10 (15 min):** End-to-end test all three demo scenarios. Fix any JSON parsing errors (wrap LLM API calls in try/catch and display a user-friendly error if the API returns malformed JSON). Make sure the PDF export works for each scenario.

---

## Quick Reference: Tech Stack Summary

The entire PoC runs as a single HTML file or minimal React app. LLM API handles all NLP — no model training, no GPU, no vector database. The BPC reference is a 25-entry JSON object injected into the system prompt. jsPDF handles export. Total external dependencies: LLM API key only.