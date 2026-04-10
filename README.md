# DMP Shohayok

AI-assisted police reporting and hotspot intelligence demo for Dhaka Metropolitan Police workflow.

## Demo & Deployment

- 3-minute demo video (YouTube): https://youtu.be/2lWN2BqfnRU
- Deployed app link: https://impact-dhaka.netlify.app/

## Problem

Manual police reporting creates three major operational bottlenecks:

- Time drain on officers: incident documentation, legal code lookup, formatting, and review can take 30-60 minutes per report, reducing field availability.
- Legal complexity: officers must identify applicable laws from large legal references, and missing or incorrect code mapping can hurt case quality.
- Consistency and quality gaps: manual drafting can lead to format variability, omitted details, and transcription mistakes in names, dates, locations, or evidence.

At scale, these issues increase administrative burden, reduce response capacity, and weaken downstream investigation and prosecution workflows.

## Solution

DMP Shohayok follows an intelligent end-to-end automation approach inspired by modern NLP/ML police reporting systems:

- Incident-to-structure pipeline: converts free-text incident narratives into structured entities (people, location, date/time, vehicles, evidence).
- Automated legal mapping: suggests likely applicable legal sections and presents them in Bangla legal style (e.g., ধারা ৩৭৯).
- Standardized report generation: produces consistent, department-style narrative reports with integrated investigative essentials.
- Operational interface: supports record tracking, hotspot visualization, and conversational querying for quick analysis and decision support.

The goal is to reduce report preparation time, improve report consistency, and help officers focus more on policing and investigation rather than repetitive documentation work.

## Key Features

- Dummy login with role-based page access:
  - `admin` or `police`: full app access
  - usernames starting with `user` (and other non-privileged usernames): hotspot page + chatbot only
- Incident validation before report generation
- Structured entity extraction (complainant, location, date/time, incident type, vehicles, evidence)
- Bengali report generation with integrated 5W information in narrative form
- Legal section matching and Bangla section rendering (`Section 329` -> `ধারা ৩২৯`)
- Export report to PDF
- Report records table with investigation status (`Pending`, `In progress`, `Done`)
- Crime hotspot map (OpenStreetMap + Leaflet) with right-side incident summary
- Floating chatbot on hotspot page using report-store context
- Multi-provider LLM support:
  - Groq
  - OpenRouter
  - Azure Inference (GitHub Models endpoint)

## Target Users

- Duty officers at police stations
- Investigation officers
- General People for information transparency
- Supervisors who monitor incident trends and report quality

## Setup Instructions

### 1. Clone and install

```bash
git clone <your-repo-url>
cd DMP-shohayok
npm install
```

### 2. Configure environment

Create a `.env` file in project root and choose one provider:

```text
# Provider selection: groq | openrouter | azure
LLM_PROVIDER=groq

# GROQ
GROQ_API_KEY=your_groq_api_key_here

# OR OpenRouter
# LLM_PROVIDER=openrouter
# OPENROUTER_API_KEY=your_openrouter_api_key_here

# OR Azure Inference (GitHub Models)
# LLM_PROVIDER=azure
# GITHUB_TOKEN=your_github_token_here
# AZURE_INFERENCE_ENDPOINT=https://models.github.ai/inference
# AZURE_MODEL_NAME=meta/Llama-3.3-70B-Instruct
```

### 3. Run in development

```bash
npm run dev
```

Open the Vite URL shown in terminal (usually `http://localhost:5173`).

### 4. Production build

```bash
npm run build
npm run preview
```

## Notes

- This is a frontend-first demo for rapid validation.
- API keys are used client-side in demo mode; for production, move provider calls to a secure backend.
