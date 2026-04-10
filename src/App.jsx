import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ReportGeneratorPage from "./pages/ReportGeneratorPage";
import ReportRecordsPage from "./pages/ReportRecordsPage";
import CrimeHotspotsPage from "./pages/CrimeHotspotsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/app" element={<ReportGeneratorPage />} />
      <Route path="/reports" element={<ReportRecordsPage />} />
      <Route path="/hotspots" element={<CrimeHotspotsPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
