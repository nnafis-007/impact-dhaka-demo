POC for Impact Dhaka hackathon

## DMP Shohayok (Modular React PoC)

This project is now a modular React + Vite app with routing and separated services for easier navigation and debugging.

## Features Added

- Multi-page flow with dummy login page (`/login`) and GD generator page (`/app`)
- Multi-page flow with dummy login page (`/login`) and report generator page (`/app`)
- Modular structure (`pages`, `services`, `data`, `components`, `utils`)
- LLM input validation step before generation
- Strong Bengali-only report drafting constraints in prompt
- Groq integration using `GROQ_API_KEY` from `.env`

## Setup

1. Create `.env` in project root:

```text
GROQ_API_KEY=your_groq_api_key_here
```

2. Install dependencies:

```bash
npm install
```

3. Run development server:

```bash
npm run dev
```

4. Open the Vite URL (typically `http://localhost:5173`).

## Routes

- `/login`: dummy login form (no validation; login button navigates to app)
- `/app`: police report generation workspace
- `/reports`: generated report records in tabular format with investigation status

## Generation Workflow

1. Officer submits incident text.
2. LLM validation checks minimum required report information.
3. If valid, entities are extracted.
4. BPC sections are matched and Bengali report draft is generated.
5. PDF export is available from the app page.

## Important Note

This remains frontend-only for proof-of-concept speed. API usage is still client-side and not suitable for production security.
