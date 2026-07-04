import { Link } from "react-router-dom";

interface Match {
  session_id: number;
  title: string;
  project: string;
  reason: string;
}

export default function SimilarBugs({ matches, loading }: { matches: Match[]; loading: boolean }) {
  if (loading) {
    return <div style={{ color: "var(--text-faint)", fontSize: 12.5 }}>Checking past cases…</div>;
  }
  if (matches.length === 0) return null;

  return (
    <div style={{ marginTop: 24 }}>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: 0.6,
          textTransform: "uppercase",
          color: "var(--text-faint)",
          marginBottom: 12,
        }}
      >
        Similar past cases
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {matches.map((m) => (
          <Link
            key={m.session_id}
            to={`/sessions/${m.session_id}`}
            style={{
              display: "block",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              padding: "10px 12px",
              background: "var(--surface)",
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
              {m.title} <span style={{ color: "var(--text-faint)", fontWeight: 400 }}>· {m.project}</span>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>{m.reason}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}