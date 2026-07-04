import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import type { BugSession } from "../types";
import StatusPill from "../components/StatusPill";
import Header from "../components/Header";
import SessionCard from "../components/SessionCard";
export default function Dashboard() {
  const [sessions, setSessions] = useState<BugSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [project, setProject] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    api
      .listSessions()
      .then(setSessions)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !project.trim()) return;
    try {
      await api.createSession({ title, project, description: description || undefined });
      setTitle("");
      setProject("");
      setDescription("");
      setShowForm(false);
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div
    style={{
      maxWidth: 1100,
      margin: "0 auto",
      padding: "32px",
      background: "#0F172A",
      minHeight: "100vh",
    }}
  >
    <Header onNewSession={() => setShowForm((s) => !s)} />


      {showForm && (
        <form
          onSubmit={handleCreate}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: 20,
            marginBottom: 28,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <input
            placeholder="Title — e.g. Login redirect loop"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={inputStyle}
            autoFocus
          />
          <input
            placeholder="Project — e.g. BugRecall"
            value={project}
            onChange={(e) => setProject(e.target.value)}
            style={inputStyle}
          />
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            style={{ ...inputStyle, resize: "vertical", fontFamily: "var(--font-ui)" }}
          />
          <button
            type="submit"
            style={{
              alignSelf: "flex-start",
              background: "var(--teal)",
              color: "#04201D",
              border: "none",
              borderRadius: "var(--radius-sm)",
              padding: "8px 14px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Create session
          </button>
        </form>
      )}

      {error && <div style={{ color: "var(--red)", fontSize: 13, marginBottom: 16 }}>{error}</div>}

      {loading ? (
        <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Loading…</div>
      ) : sessions.length === 0 ? (
        <div
          style={{
            border: "1px dashed var(--border-strong)",
            borderRadius: "var(--radius)",
            padding: 40,
            textAlign: "center",
            color: "var(--text-muted)",
          }}
        >
          <div style={{ fontSize: 14, marginBottom: 4 }}>No cases yet.</div>
          <div style={{ fontSize: 13 }}>Open your first bug session to start building memory.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sessions.map((s) => (
            <SessionCard
    key={s.id}
    session={s}
/>

          ))}
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: "var(--bg)",
  border: "1px solid var(--border-strong)",
  borderRadius: "var(--radius-sm)",
  padding: "9px 12px",
  color: "var(--text)",
  fontSize: 13,
  outline: "none",
};
