import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ReportGeneratorPage from "./pages/ReportGeneratorPage";
import ReportRecordsPage from "./pages/ReportRecordsPage";
import CrimeHotspotsPage from "./pages/CrimeHotspotsPage";
import { getCurrentUsername, isPrivilegedUsername } from "./services/authService";

export default function App() {
  const username = getCurrentUsername();
  const isLoggedIn = Boolean(username);
  const isPrivileged = isPrivilegedUsername(username);

  if (!isLoggedIn) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  if (!isPrivileged) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/hotspots" element={<CrimeHotspotsPage />} />
        <Route path="*" element={<Navigate to="/hotspots" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/app" element={<ReportGeneratorPage />} />
      <Route path="/reports" element={<ReportRecordsPage />} />
      <Route path="/hotspots" element={<CrimeHotspotsPage />} />
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  );
}
