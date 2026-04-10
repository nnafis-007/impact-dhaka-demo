import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import {
  getAllReportRecords,
  REPORT_RECORDS_UPDATED_EVENT
} from "../services/reportStore";
import { askPoliceReportChatbot } from "../services/chatService";

const DHAKA_CENTER = [23.8103, 90.4125];

const AREA_COORDINATES = [
  { keys: ["dhanmondi", "ধানমন্ডি"], lat: 23.7461, lng: 90.3742, label: "Dhanmondi" },
  { keys: ["mirpur", "মিরপুর"], lat: 23.8223, lng: 90.3654, label: "Mirpur" },
  { keys: ["gulshan", "গুলশান"], lat: 23.7925, lng: 90.4078, label: "Gulshan" },
  { keys: ["banani", "বনানী"], lat: 23.7937, lng: 90.4066, label: "Banani" },
  { keys: ["mohammadpur", "মোহাম্মদপুর"], lat: 23.7581, lng: 90.3589, label: "Mohammadpur" },
  { keys: ["ramna", "রমনা"], lat: 23.7414, lng: 90.4077, label: "Ramna" },
  { keys: ["motijheel", "মতিঝিল"], lat: 23.7314, lng: 90.4177, label: "Motijheel" },
  { keys: ["uttara", "উত্তরা"], lat: 23.8747, lng: 90.4006, label: "Uttara" },
  { keys: ["tejgaon", "তেজগাঁও"], lat: 23.7661, lng: 90.3907, label: "Tejgaon" },
  { keys: ["paltan", "পল্টন"], lat: 23.7318, lng: 90.4143, label: "Paltan" },
  { keys: ["wari", "ওয়ারী", "ওয়ারী"], lat: 23.7104, lng: 90.4168, label: "Wari" },
  { keys: ["jatrabari", "যাত্রাবাড়ী", "যাত্রাবাড়ী"], lat: 23.7102, lng: 90.4417, label: "Jatrabari" }
];

function findCoordinates(record) {
  const locationText = `${record.location_area || ""} ${record.location_thana || ""}`.toLowerCase();
  const matched = AREA_COORDINATES.find((item) => item.keys.some((key) => locationText.includes(key)));

  if (!matched) {
    return {
      lat: 23,
      lng: 90,
      label: "Dhaka (Approximate)"
    };
  }

  return {
    lat: matched.lat,
    lng: matched.lng,
    label: matched.label
  };
}

function toHotspotData(records) {
  const incidents = records.map((record) => {
    const coords = findCoordinates(record);
    return {
      ...record,
      coords
    };
  });

  const hotspotMap = new Map();
  incidents.forEach((incident) => {
    const key = `${incident.coords.lat.toFixed(4)}:${incident.coords.lng.toFixed(4)}`;
    if (!hotspotMap.has(key)) {
      hotspotMap.set(key, {
        key,
        lat: incident.coords.lat,
        lng: incident.coords.lng,
        areaLabel: incident.coords.label,
        count: 0,
        types: new Set()
      });
    }

    const current = hotspotMap.get(key);
    current.count += 1;
    if (incident.incident_type) {
      current.types.add(incident.incident_type);
    }
  });

  const hotspots = Array.from(hotspotMap.values())
    .map((spot) => ({
      ...spot,
      types: Array.from(spot.types)
    }))
    .sort((a, b) => b.count - a.count);

  return { incidents, hotspots };
}

function formatDateTime(record) {
  const date = record.incident_date || "Unknown date";
  const time = record.incident_time || "Unknown time";
  return `${date} ${time}`;
}

export default function CrimeHotspotsPage() {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const [records, setRecords] = useState(() => getAllReportRecords());
  const { incidents, hotspots } = useMemo(() => toHotspotData(records), [records]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello. I am your incident assistant. Ask in Bangla or English about hotspot incidents."
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) {
      return;
    }

    const map = L.map(mapRef.current).setView(DHAKA_CENTER, 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors"
    }).addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) {
      return;
    }

    markersLayer.clearLayers();
    hotspots.forEach((spot) => {
      const color = spot.count >= 3 ? "#b91c1c" : spot.count === 2 ? "#d97706" : "#2563eb";
      const marker = L.circleMarker([spot.lat, spot.lng], {
        radius: 8 + spot.count * 3,
        color,
        weight: 2,
        fillColor: color,
        fillOpacity: 0.35
      }).addTo(markersLayer);

      marker.bindPopup(
        `<strong>${spot.areaLabel}</strong><br/>Incidents: ${spot.count}<br/>Types: ${spot.types.join(", ") || "N/A"}`
      );
    });

    if (hotspots.length > 0) {
      const bounds = L.latLngBounds(hotspots.map((spot) => [spot.lat, spot.lng]));
      map.fitBounds(bounds.pad(0.25));
    } else {
      map.setView(DHAKA_CENTER, 12);
    }
  }, [hotspots]);

  useEffect(() => {
    function refreshRecords() {
      setRecords(getAllReportRecords());
    }

    window.addEventListener(REPORT_RECORDS_UPDATED_EVENT, refreshRecords);
    window.addEventListener("storage", refreshRecords);
    document.addEventListener("visibilitychange", refreshRecords);

    return () => {
      window.removeEventListener(REPORT_RECORDS_UPDATED_EVENT, refreshRecords);
      window.removeEventListener("storage", refreshRecords);
      document.removeEventListener("visibilitychange", refreshRecords);
    };
  }, []);

  async function handleSend() {
    const prompt = input.trim();
    if (!prompt || isLoading) {
      return;
    }

    const nextMessages = [...messages, { role: "user", content: prompt }];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const reply = await askPoliceReportChatbot({
        userMessage: prompt,
        records,
        history: nextMessages
      });

      setMessages((current) => [...current, { role: "assistant", content: String(reply || "") }]);
    } catch (error) {
      console.error("Hotspot chat error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <h1>DMP Shohayok</h1>
          <p>Crime Hotspots in Dhaka</p>
        </div>
        <div className="topbar-actions">
          <button onClick={() => navigate("/app")}>Report Generator</button>
          <button onClick={() => navigate("/reports")}>Report Records</button>
          <button onClick={() => navigate("/login")}>Logout</button>
        </div>
      </header>

      <main className="app-main">
        <section className="card hotspot-layout">
          <div className="hotspot-map-wrap">
            <h2>Dhaka Hotspot Map (OpenStreetMap)</h2>
            <p className="muted">Circle size/intensity represents number of incidents per area.</p>
            <div ref={mapRef} className="hotspot-map" />
          </div>

          <aside className="hotspot-sidepanel">
            <h3>Recent Incidents</h3>
            <p className="muted">Crime type, date/time and location from report records.</p>
            <div className="incident-list">
              {incidents.length === 0 && <p className="muted">No report records found.</p>}
              {incidents.map((incident) => (
                <article key={incident.id} className="incident-item">
                  <h4>{incident.incident_type || "Unknown incident type"}</h4>
                  <p>{formatDateTime(incident)}</p>
                  <p>{[incident.location_area, incident.location_thana].filter(Boolean).join(", ") || "Unknown location"}</p>
                </article>
              ))}
            </div>
          </aside>
        </section>
      </main>

      <button className="floating-chat-button" onClick={() => setIsChatOpen((open) => !open)}>
        {isChatOpen ? "Close Chat" : "Chat Assistant"}
      </button>

      {isChatOpen && (
        <section className="floating-chat-panel">
          <div className="floating-chat-header">
            <h3>Hotspot Chatbot</h3>
            <button onClick={() => setIsChatOpen(false)}>Close</button>
          </div>

          <div className="chat-log compact">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`chat-bubble ${message.role === "assistant" ? "assistant" : "user"}`}
              >
                {message.content}
              </div>
            ))}
            {isLoading && <div className="chat-bubble assistant">Thinking...</div>}
          </div>

          <div className="chat-input-row compact">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about hotspot trends, recent incidents, locations..."
            />
            <button onClick={handleSend} disabled={isLoading || !input.trim()}>
              Send
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
