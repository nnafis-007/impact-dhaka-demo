import seedRecords from "../data/reportRecords.json";

const STORAGE_KEY = "dmp_report_records";
const STORAGE_VERSION_KEY = "dmp_report_records_version";
const STORAGE_VERSION = "2";

function readStoredRecords() {
  try {
    const savedVersion = localStorage.getItem(STORAGE_VERSION_KEY);
    if (savedVersion !== STORAGE_VERSION) {
      const seeded = [...seedRecords];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      localStorage.setItem(STORAGE_VERSION_KEY, STORAGE_VERSION);
      return seeded;
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = [...seedRecords];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [...seedRecords];
    }

    return parsed.map((record) => ({
      ...record,
      investigation_status:
        record.investigation_status === "Pendign"
          ? "Pending"
          : (record.investigation_status || "Pending")
    }));
  } catch {
    return [...seedRecords];
  }
}

function writeStoredRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function getAllReportRecords() {
  return readStoredRecords();
}

export function saveGeneratedReportRecord({ incidentText, entities, matches, reportDraft }) {
  const records = readStoredRecords();
  const nextRecord = {
    id: `RPT-${Date.now()}`,
    created_at: new Date().toISOString(),
    incident_text: incidentText,
    complainant_name: entities.complainant_name || "",
    incident_type: entities.incident_type || "",
    location_area: entities.location_area || "",
    location_thana: entities.location_thana || "",
    incident_date: entities.incident_date || "",
    incident_time: entities.incident_time || "",
    applicable_sections: (matches || []).map((item) => item.section),
    report_draft: reportDraft,
    investigation_status: "Pending"
  };

  const updatedRecords = [nextRecord, ...records];
  writeStoredRecords(updatedRecords);
  return nextRecord;
}

export function updateInvestigationStatus(recordId, status) {
  const records = readStoredRecords();
  const updatedRecords = records.map((record) => {
    if (record.id !== recordId) {
      return record;
    }
    return { ...record, investigation_status: status };
  });

  writeStoredRecords(updatedRecords);
  return updatedRecords;
}
