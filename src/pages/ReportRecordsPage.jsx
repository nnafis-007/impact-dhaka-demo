import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllReportRecords,
  updateInvestigationStatus
} from "../services/reportStore";
import { clearCurrentUsername } from "../services/authService";
import { formatLegalSections } from "../utils/legal";

const STATUS_OPTIONS = ["Pending", "In progress", "Done"];

function displayCell(value) {
  if (!value) {
    return "";
  }
  const text = String(value).trim();
  if (!text || text.toLowerCase() === "unknown") {
    return "";
  }
  return text;
}

function statusClass(status) {
  if (status === "Done") {
    return "status-done";
  }
  if (status === "In progress") {
    return "status-in-progress";
  }
  return "status-pending";
}

export default function ReportRecordsPage() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);

  useEffect(() => {
    setRecords(getAllReportRecords());
  }, []);

  function handleStatusChange(recordId, status) {
    const updated = updateInvestigationStatus(recordId, status);
    setRecords(updated);
  }

  function handleLogout() {
    clearCurrentUsername();
    navigate("/login");
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <h1>DMP Shohayok</h1>
          <p>Generated Police Reports</p>
        </div>
        <div className="topbar-actions">
          <button onClick={() => navigate("/app")}>Back To Generator</button>
          <button onClick={() => navigate("/hotspots")}>Hotspots</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main className="app-main">
        <section className="card">
          <h2>Report Records</h2>
          <div className="table-wrap">
            <table className="records-table">
              <thead>
                <tr>
                  <th>Report ID</th>
                  <th>Created At</th>
                  <th>Complainant</th>
                  <th>Incident Type</th>
                  <th>Location</th>
                  <th>Legal Sections</th>
                  <th>Investigation Status</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 && (
                  <tr>
                    <td colSpan="7">No generated reports found yet.</td>
                  </tr>
                )}
                {records.map((record) => (
                  <tr key={record.id}>
                    <td>{record.id}</td>
                    <td>{new Date(record.created_at).toLocaleString()}</td>
                    <td>{displayCell(record.complainant_name)}</td>
                    <td>{displayCell(record.incident_type)}</td>
                    <td>
                      {[displayCell(record.location_area), displayCell(record.location_thana)]
                        .filter(Boolean)
                        .join(", ")}
                    </td>
                    <td>{formatLegalSections(record.applicable_sections || []).join(", ") || "-"}</td>
                    <td>
                      <select
                        className={statusClass(record.investigation_status)}
                        value={record.investigation_status || "Pending"}
                        onChange={(event) => handleStatusChange(record.id, event.target.value)}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
