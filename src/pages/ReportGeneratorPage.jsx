import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ValidationAlert from "../components/ValidationAlert";
import {
  DEFAULT_ENTITIES,
  DEMO_SCENARIOS,
  extractEntities,
  generatePoliceReport,
  validateIncidentInput
} from "../services/reportService";
import { getGroqApiKey, initializeGroqApiKey } from "../services/groqClient";
import { exportReportToPdf } from "../services/pdfService";
import { saveGeneratedReportRecord } from "../services/reportStore";
import { formatLegalSection } from "../utils/legal";
import { toArrayValue } from "../utils/text";

const ENTITY_FIELDS = [
  ["complainant_name", "Complainant Name", false],
  ["accused_names", "Accused Names (comma separated)", true],
  ["victim_names", "Victim Names (comma separated)", true],
  ["location_area", "Location Area", false],
  ["location_thana", "Location Thana", false],
  ["incident_date", "Incident Date", false],
  ["incident_time", "Incident Time", false],
  ["incident_type", "Incident Type", false],
  ["evidence_mentioned", "Evidence Mentioned (comma separated)", true],
  ["vehicles_mentioned", "Vehicles Mentioned (comma separated)", true]
];

export default function ReportGeneratorPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [incidentText, setIncidentText] = useState("");
  const [entities, setEntities] = useState({ ...DEFAULT_ENTITIES });
  const [validation, setValidation] = useState(null);
  const [bpcMatches, setBpcMatches] = useState([]);
  const [selectedSections, setSelectedSections] = useState({});
  const [reportDraft, setReportDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastDurationSec, setLastDurationSec] = useState(null);
  const [generationCount, setGenerationCount] = useState(0);
  const [autoRegenerate, setAutoRegenerate] = useState(false);
  const [keyStatus, setKeyStatus] = useState("loading");
  const [lastSavedSignature, setLastSavedSignature] = useState("");
  const regenTimerRef = useRef(null);

  const username = location.state?.username || "Duty Officer";

  const selectedBpcSummary = useMemo(() => {
    const active = bpcMatches.filter((item) => selectedSections[item.section]);
    return active.map((item) => `${formatLegalSection(item.section)} (${item.title})`).join(", ");
  }, [bpcMatches, selectedSections]);

  async function runGeneration(text, providedEntities = null, source = "manual") {
    if (!getGroqApiKey()) {
      const loaded = await initializeGroqApiKey();
      if (!loaded) {
        setKeyStatus("missing");
      }
    }

    if (!getGroqApiKey()) {
      console.error("Missing GROQ_API_KEY in .env. Add it and restart the dev server.");
      return;
    }

    if (!text.trim()) {
      console.error("Please enter an incident description.");
      return;
    }

    setIsLoading(true);
    const startedAt = Date.now();

    try {
      const inputValidation = await validateIncidentInput(text);
      setValidation(inputValidation);

      if (!inputValidation.is_valid) {
        setReportDraft("");
        setBpcMatches([]);
        setSelectedSections({});
        return;
      }

      const extracted = providedEntities || (await extractEntities(text));
      setEntities(extracted);

      const reportResult = await generatePoliceReport(text, extracted);
      setBpcMatches(reportResult.bpc_matches || []);
      setReportDraft(reportResult.report_draft || "");

      const nextSelected = {};
      (reportResult.bpc_matches || []).forEach((item) => {
        nextSelected[item.section] = true;
      });
      setSelectedSections(nextSelected);
      setLastSavedSignature("");

      setLastDurationSec(Math.max(1, Math.round((Date.now() - startedAt) / 1000)));
      if (source !== "regenerate") {
        setGenerationCount((count) => count + 1);
      }
      setAutoRegenerate(true);
    } catch (error) {
      console.error(error.message || "Failed to generate report.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function setupApiKey() {
      const loaded = await initializeGroqApiKey();
      if (cancelled) {
        return;
      }
      setKeyStatus(loaded ? "ready" : "missing");
    }

    setupApiKey();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!autoRegenerate || !incidentText.trim()) {
      return undefined;
    }

    if (regenTimerRef.current) {
      clearTimeout(regenTimerRef.current);
    }

    regenTimerRef.current = setTimeout(() => {
      runGeneration(incidentText, entities, "regenerate");
    }, 1100);

    return () => {
      if (regenTimerRef.current) {
        clearTimeout(regenTimerRef.current);
      }
    };
  }, [
    autoRegenerate,
    incidentText,
    entities.complainant_name,
    entities.accused_names,
    entities.victim_names,
    entities.location_area,
    entities.location_thana,
    entities.incident_date,
    entities.incident_time,
    entities.incident_type,
    entities.evidence_mentioned,
    entities.vehicles_mentioned
  ]);

  function updateEntityField(key, value, isArray = false) {
    setEntities((current) => ({
      ...current,
      [key]: isArray ? toArrayValue(value) : value || null
    }));
  }

  function applyScenario(text) {
    setIncidentText(text);
    runGeneration(text, null, "manual");
  }

  async function handleExport() {
    try {
      await exportReportToPdf({ reportDraft, entities, selectedBpcSummary });

      const currentSignature = `${incidentText}::${reportDraft}`;
      if (currentSignature && currentSignature !== lastSavedSignature) {
        saveGeneratedReportRecord({
          incidentText,
          entities,
          matches: bpcMatches,
          reportDraft
        });
        setLastSavedSignature(currentSignature);
      }
    } catch (error) {
      console.error(error.message);
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <h1>DMP Shohayok</h1>
          <p>AI-Assisted Police Report Generator</p>
        </div>
        <div className="topbar-actions">
          <span className="status-pill">Signed in: {username}</span>
          <button onClick={() => navigate("/reports")}>Report Records</button>
          <button onClick={() => navigate("/hotspots")}>Hotspots</button>
          <button onClick={() => navigate("/login")}>Logout</button>
        </div>
      </header>

      <main className="app-main">
        <section className="card key-banner">
          <p>
            API Key source: {keyStatus === "loading" && "Checking env sources..."}
            {keyStatus === "ready" && "Loaded (GROQ_API_KEY detected)"}
            {keyStatus === "missing" && "Missing GROQ_API_KEY"}
          </p>
          <button onClick={handleExport}>Export PDF</button>
        </section>

        <section className="scenario-row">
          {DEMO_SCENARIOS.map((scenario) => (
            <button key={scenario.id} onClick={() => applyScenario(scenario.text)}>
              {scenario.label}
            </button>
          ))}
        </section>

        <ValidationAlert validation={validation} />

        <section className="three-col">
          <div className="card">
            <h2>Incident Input</h2>
            <textarea
              value={incidentText}
              onChange={(event) => {
                setIncidentText(event.target.value);
                setAutoRegenerate(false);
              }}
              placeholder="Paste incident description in Bangla, English, or Banglish"
            />
            <button className="primary" onClick={() => runGeneration(incidentText, null, "manual")}>
              {isLoading ? "Processing..." : "Validate and Generate Bengali Report"}
            </button>
          </div>

          <div className="card">
            <h2>Extracted Entities</h2>
            <div className="fields">
              {ENTITY_FIELDS.map(([key, label, isArray]) => (
                <label key={key}>
                  <span>{label}</span>
                  <input
                    value={isArray ? (entities[key] || []).join(", ") : entities[key] || ""}
                    onChange={(event) => updateEntityField(key, event.target.value, isArray)}
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="card">
            <h2>BPC Matches + Bengali Report Draft</h2>
            <div className="matches">
              {bpcMatches.length === 0 && <p className="muted">No matched sections yet.</p>}
              {bpcMatches.map((match) => (
                <label key={`${match.section}-${match.title}`} className="match-item">
                  <input
                    type="checkbox"
                    checked={Boolean(selectedSections[match.section])}
                    onChange={() =>
                      setSelectedSections((current) => ({
                        ...current,
                        [match.section]: !current[match.section]
                      }))
                    }
                  />
                  <div>
                    <strong>✓ {formatLegalSection(match.section)} - {match.title}</strong>
                    <p>{match.justification}</p>
                  </div>
                </label>
              ))}
            </div>
            <textarea value={reportDraft} onChange={(event) => setReportDraft(event.target.value)} />
          </div>
        </section>

        <section className="card metrics">
          <h3>Impact Metrics</h3>
          <div className="metric-grid">
            <div>
              <p>Estimated Manual Time</p>
              <strong>40 min</strong>
            </div>
            <div>
              <p>Time with DMP Shohayok</p>
              <strong>3 min</strong>
            </div>
            <div>
              <p>Estimated Time Saved</p>
              <strong>37 min</strong>
            </div>
          </div>
          <p className="muted">
            {generationCount > 0
              ? `Generated ${generationCount} run(s). Last API turnaround: ${lastDurationSec || "-"} sec.`
              : "Run a scenario or generate once to populate live metrics."}
          </p>
        </section>
      </main>
    </div>
  );
}
