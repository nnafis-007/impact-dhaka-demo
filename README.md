POC for Impact Dhaka hackathon

## DMP Shohayok PoC (No Build Step)

This repository now includes a full single-page implementation based on the project plan.

## Files

- `index.html`: Main app (React + Tailwind + jsPDF from CDN)
- `bpc_data.js`: Penal code reference list used for prompt-based matching
- `Project-plan.md`: Source PRD and implementation plan

## Run Locally

1. From the project root, start a simple static server:

```bash
python3 -m http.server 5500
```

2. Open:

```text
http://localhost:5500/index.html
```

3. Create `.env` in project root with:

```text
GROQ_API_KEY=your_groq_api_key_here
```

The frontend PoC auto-loads `GROQ_API_KEY` from `.env`.

## Demo Flow

1. Ensure `.env` has `GROQ_API_KEY`.
2. Click any demo scenario button (A/B/C), or type incident text.
3. Click `Generate GD`.
4. Review entities, BPC matches, and GD draft.
5. Edit entities to trigger live re-generation.
6. Click `Export PDF` for printable output.

## Implemented Plan Coverage

- Step 1: Single `index.html` with CDN dependencies
- Step 2: `bpc_data.js` with 25+ sections including Nari O Shishu sections
- Step 3: 3-panel UI (Input / Entities / Draft)
- Step 4: `extractEntities(incidentText)` API flow with strict JSON parse (Groq)
- Step 5: `generateGDReport(incidentText, entities)` with embedded BPC reference JSON (Groq)
- Step 6: Tailwind polish, loading spinner, green match badges
- Step 7: 3 hardcoded reproducible demo scenarios
- Step 8: jsPDF export with letterhead, placeholders, signature/stamp lines
- Step 9: Impact metrics section
- Step 10: try/catch and user-facing error handling for malformed responses

## Important Note

For PoC speed, the frontend calls Groq API directly from browser JavaScript. This exposes the API key in client requests and should not be used in production.
