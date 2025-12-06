"use client";

import { useEffect, useState } from "react";

type LogType = "sensor" | "speech";

// ---------- Types ----------

interface BaseLog {
  _id: string;
  timestamp?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface SensorLog extends BaseLog {
  nodeId: number;
  waterRaw?: number;
  waterPercent?: number;
  temperature?: number;
  humidity?: number;
  fanStatus?: boolean;
  steamStatus?: boolean;
  isTilted?: boolean;
  keyPress?: string | null;
  source?: string;
}

interface SpeechLog extends BaseLog {
  text: string;
  procTime?: number;
  nodeId?: number;
  clientId?: string;
  intent?: string;
  confidence?: number;
}

// ---------- Component ----------

export default function LogsPage() {
  const [logType, setLogType] = useState<LogType>("sensor");

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [sensorLogs, setSensorLogs] = useState<SensorLog[]>([]);
  const [speechLogs, setSpeechLogs] = useState<SpeechLog[]>([]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ----- Forms -----
  const [sensorForm, setSensorForm] = useState({
    nodeId: "",
    temperature: "",
    humidity: "",
    waterPercent: "",
  });

  const [speechForm, setSpeechForm] = useState({
    text: "",
    nodeId: "",
    procTime: "",
  });

  // Helper: build query string from from/to
  const buildQuery = () => {
    const params = new URLSearchParams();
    if (from) {
      const d = new Date(from);
      if (!Number.isNaN(d.getTime())) {
        params.append("from", d.toISOString());
      }
    }
    if (to) {
      const d = new Date(to);
      if (!Number.isNaN(d.getTime())) {
        params.append("to", d.toISOString());
      }
    }
    return params.toString();
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const query = buildQuery();
      const url =
        logType === "sensor"
          ? `/api/logs/sensor-logs${query ? `?${query}` : ""}`
          : `/api/logs/speech-logs${query ? `?${query}` : ""}`;

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Fetch failed: ${res.status}`);
      }

      if (logType === "sensor") {
        const data = (await res.json()) as SensorLog[];
        setSensorLogs(data);
      } else {
        const data = (await res.json()) as SpeechLog[];
        setSpeechLogs(data);
      }
    } catch (err) {
      setErrorMsg("ดึงข้อมูลไม่สำเร็จ");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSensorLog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErrorMsg(null);

      const body: Partial<SensorLog> = {
        nodeId: Number(sensorForm.nodeId) || 0,
        temperature: sensorForm.temperature
          ? Number(sensorForm.temperature)
          : undefined,
        humidity: sensorForm.humidity ? Number(sensorForm.humidity) : undefined,
        waterPercent: sensorForm.waterPercent
          ? Number(sensorForm.waterPercent)
          : undefined,
      };

      const res = await fetch("/api/logs/sensor-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(`Create failed: ${res.status}`);
      }

      const created = (await res.json()) as SensorLog;
      setSensorLogs((prev) => [created, ...prev]);

      setSensorForm({
        nodeId: "",
        temperature: "",
        humidity: "",
        waterPercent: "",
      });
    } catch (err) {
      setErrorMsg("เพิ่ม SensorLog ไม่สำเร็จ");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSpeechLog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErrorMsg(null);

      const body: Partial<SpeechLog> = {
        text: speechForm.text,
        nodeId: speechForm.nodeId
          ? Number(speechForm.nodeId)
          : undefined,
        procTime: speechForm.procTime
          ? Number(speechForm.procTime)
          : undefined,
      };

      const res = await fetch("/api/logs/speech-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(`Create failed: ${res.status}`);
      }

      const created = (await res.json()) as SpeechLog;
      setSpeechLogs((prev) => [created, ...prev]);

      setSpeechForm({
        text: "",
        nodeId: "",
        procTime: "",
      });
    } catch (err) {
      setErrorMsg("เพิ่ม SpeechLog ไม่สำเร็จ");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ดึงครั้งแรกตอนเปิดหน้า
  useEffect(() => {
    void fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logType]);

  const formatDate = (value?: string) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString();
  };

  // ---------- UI ----------

  return (
    <main style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.8rem", marginBottom: "16px" }}>
        Logs Playground
      </h1>

      {/* เลือก Log Type */}
      <section
        style={{
          display: "flex",
          gap: "16px",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <label>
          Log Type:{" "}
          <select
            value={logType}
            onChange={(e) => setLogType(e.target.value as LogType)}
          >
            <option value="sensor">Sensor Logs</option>
            <option value="speech">Speech Logs</option>
          </select>
        </label>

        {/* Filter by time */}
        <label>
          From:{" "}
          <input
            type="datetime-local"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>

        <label>
          To:{" "}
          <input
            type="datetime-local"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>

        <button type="button" onClick={fetchLogs} disabled={loading}>
          {loading ? "Loading..." : "Fetch"}
        </button>
      </section>

      {errorMsg && (
        <p style={{ color: "red", marginBottom: "12px" }}>{errorMsg}</p>
      )}

      {/* ฟอร์มสำหรับใส่ Log */}
      <section
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "24px",
        }}
      >
        <h2 style={{ fontSize: "1.2rem", marginBottom: "8px" }}>
          Create {logType === "sensor" ? "SensorLog" : "SpeechLog"}
        </h2>

        {logType === "sensor" ? (
          <form
            onSubmit={handleCreateSensorLog}
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              alignItems: "flex-end",
            }}
          >
            <label>
              Node ID
              <input
                type="number"
                value={sensorForm.nodeId}
                onChange={(e) =>
                  setSensorForm((prev) => ({
                    ...prev,
                    nodeId: e.target.value,
                  }))
                }
              />
            </label>
            <label>
              Temperature (°C)
              <input
                type="number"
                step="0.1"
                value={sensorForm.temperature}
                onChange={(e) =>
                  setSensorForm((prev) => ({
                    ...prev,
                    temperature: e.target.value,
                  }))
                }
              />
            </label>
            <label>
              Humidity (%)
              <input
                type="number"
                step="0.1"
                value={sensorForm.humidity}
                onChange={(e) =>
                  setSensorForm((prev) => ({
                    ...prev,
                    humidity: e.target.value,
                  }))
                }
              />
            </label>
            <label>
              Water (%)
              <input
                type="number"
                step="0.1"
                value={sensorForm.waterPercent}
                onChange={(e) =>
                  setSensorForm((prev) => ({
                    ...prev,
                    waterPercent: e.target.value,
                  }))
                }
              />
            </label>

            <button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Add Sensor Log"}
            </button>
          </form>
        ) : (
          <form
            onSubmit={handleCreateSpeechLog}
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              alignItems: "flex-end",
            }}
          >
            <label style={{ flex: "1 1 100%" }}>
              Text
              <input
                type="text"
                value={speechForm.text}
                onChange={(e) =>
                  setSpeechForm((prev) => ({
                    ...prev,
                    text: e.target.value,
                  }))
                }
                style={{ width: "100%" }}
              />
            </label>
            <label>
              Node ID
              <input
                type="number"
                value={speechForm.nodeId}
                onChange={(e) =>
                  setSpeechForm((prev) => ({
                    ...prev,
                    nodeId: e.target.value,
                  }))
                }
              />
            </label>
            <label>
              Proc Time (s)
              <input
                type="number"
                step="0.01"
                value={speechForm.procTime}
                onChange={(e) =>
                  setSpeechForm((prev) => ({
                    ...prev,
                    procTime: e.target.value,
                  }))
                }
              />
            </label>

            <button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Add Speech Log"}
            </button>
          </form>
        )}
      </section>

      {/* Table แสดง Logs */}
      <section>
        <h2 style={{ fontSize: "1.2rem", marginBottom: "8px" }}>
          {logType === "sensor" ? "Sensor Logs" : "Speech Logs"} Table
        </h2>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.9rem",
              color: "#333",
            }}
          >
            <thead>
              {logType === "sensor" ? (
                <tr>
                  <th style={thStyle}>_id</th>
                  <th style={thStyle}>Timestamp</th>
                  <th style={thStyle}>Node</th>
                  <th style={thStyle}>Temp (°C)</th>
                  <th style={thStyle}>Humidity (%)</th>
                  <th style={thStyle}>Water (%)</th>
                  <th style={thStyle}>Fan</th>
                  <th style={thStyle}>Steam</th>
                </tr>
              ) : (
                <tr>
                  <th style={thStyle}>_id</th>
                  <th style={thStyle}>Timestamp</th>
                  <th style={thStyle}>Text</th>
                  <th style={thStyle}>Node</th>
                  <th style={thStyle}>Proc Time (s)</th>
                  <th style={thStyle}>Intent</th>
                </tr>
              )}
            </thead>
            <tbody>
              {logType === "sensor"
                ? sensorLogs.map((log) => (
                    <tr key={log._id}>
                      <td style={tdStyle}>{log._id}</td>
                      <td style={tdStyle}>
                        {formatDate(log.timestamp ?? log.createdAt)}
                      </td>
                      <td style={tdStyle}>{log.nodeId}</td>
                      <td style={tdStyle}>
                        {log.temperature ?? "-"}
                      </td>
                      <td style={tdStyle}>
                        {log.humidity ?? "-"}
                      </td>
                      <td style={tdStyle}>
                        {log.waterPercent ?? "-"}
                      </td>
                      <td style={tdStyle}>
                        {log.fanStatus === undefined
                          ? "-"
                          : log.fanStatus
                          ? "ON"
                          : "OFF"}
                      </td>
                      <td style={tdStyle}>
                        {log.steamStatus === undefined
                          ? "-"
                          : log.steamStatus
                          ? "ON"
                          : "OFF"}
                      </td>
                    </tr>
                  ))
                : speechLogs.map((log) => (
                    <tr key={log._id}>
                      <td style={tdStyle}>{log._id}</td>
                      <td style={tdStyle}>
                        {formatDate(log.timestamp ?? log.createdAt)}
                      </td>
                      <td style={tdStyle}>{log.text}</td>
                      <td style={tdStyle}>
                        {log.nodeId ?? "-"}
                      </td>
                      <td style={tdStyle}>
                        {log.procTime ?? "-"}
                      </td>
                      <td style={tdStyle}>
                        {log.intent ?? "-"}
                      </td>
                    </tr>
                  ))}
              {logType === "sensor" && sensorLogs.length === 0 && (
                <tr>
                  <td style={tdStyle} colSpan={8}>
                    ไม่มีข้อมูล
                  </td>
                </tr>
              )}
              {logType === "speech" && speechLogs.length === 0 && (
                <tr>
                  <td style={tdStyle} colSpan={6}>
                    ไม่มีข้อมูล
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

// small style helpers
const thStyle: React.CSSProperties = {
  borderBottom: "1px solid #ddd",
  padding: "8px",
  textAlign: "left",
  backgroundColor: "#f9f9f9",
};

const tdStyle: React.CSSProperties = {
  borderBottom: "1px solid #eee",
  padding: "6px 8px",
};
