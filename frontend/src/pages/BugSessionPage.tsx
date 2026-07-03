import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api";
import type { BugSession, Evidence, Hypothesis } from "../types";
import StatusPill from "../components/StatusPill";

type TimelineItem =
  | { kind: "evidence"; data: Evidence; at: string }
  | { kind: "hypothesis"; data: Hypothesis; at: string };

export default function BugSessionPage() {
  const { id } = useParams();
  const sessionId = Number(id);

  const [session, setSession] = useState<BugSession | null>(null);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);

  const [evidenceInput, setEvidenceInput] = useState("");
  const [hypInput, setHypInput] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatLog, setChatLog] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  const load = () => {
    api.getSession(sessionId).then(setSession);
    api.listEvidence(sessionId).then(setEvidence);
    api.listHypotheses(sessionId).then(setHypotheses);
  };

  useEffect(load, [sessionId]);

  const addEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceInput.trim()) return;
    await api.createEvidence({ session_id: sessionId, type: "NOTE", content: evidenceInput });
    setEvidenceInput("");
    load();
  };

  const addHypothesis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hypInput.trim()) return;
    await api.createHypothesis({ session_id: sessionId, title: hypInput });
    setHypInput("");
    load();
  };

  const markHypothesis = async (hypId: number, status: string) => {
    await api.updateHypothesis(hypId, { status });
    load();
  };

const sendChat = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!chatInput.trim() || chatLoading) return;
  const question = chatInput;
  setChatLog((log) => [...log, { role: "user", text: question }]);
  setChatInput("");
  setChatLoading(true);
  try {
    const res = await api.askBugRecall(sessionId, question);
    setChatLog((log) => [...log, { role: "ai", text: res.answer }]);
  } catch (err) {
    setChatLog((log) => [
      ...log,
      { role: "ai", text: `Error reaching the recall engine: ${err instanceof Error ? err.message : "unknown error"}` },
    ]);
  } finally {
    setChatLoading(false);
  }
};

  if (!session) {
    return <div style={{ padding: 48, color: "var(--text-muted)" }}>Loading case file…</div>;
  }

  const timeline: TimelineItem[] = [
    ...evidence.map((e): TimelineItem => ({ kind: "evidence", data: e, at: e.created_at })),
    ...hypotheses.map((h): TimelineItem => ({ kind: "hypothesis", data: h, at: h.created_at ?? "" })),
  ].sort((a, b) => (a.at < b.at ? -1 : 1));

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: "40px 32px" }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-faint)" }}>
            {session.project} · #{session.id}
          </span>
          <StatusPill status={session.status} />
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 600, margin: "0 0 8px", letterSpacing: -0.4 }}>
          {session.title}
        </h1>
        {session.description && (
          <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.6, maxWidth: 640 }}>
            {session.description}
          </p>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 32 }}>
        <div>
          <SectionLabel>Investigation timeline</SectionLabel>

          <div style={{ position: "relative", paddingLeft: 20, marginTop: 16 }}>
            {timeline.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  left: 5,
                  top: 6,
                  bottom: 6,
                  width: 1,
                  background: "var(--border-strong)",
                }}
              />
            )}
            {timeline.length === 0 && (
              <div style={{ color: "var(--text-faint)", fontSize: 13, paddingLeft: 4 }}>
                No evidence or hypotheses logged yet.
              </div>
            )}
            {timeline.map((item, i) => (
              <TimelineRow key={i} item={item} />
            ))}
          </div>

          <form onSubmit={addEvidence} style={{ marginTop: 24, display: "flex", gap: 8 }}>
            <input
              value={evidenceInput}
              onChange={(e) => setEvidenceInput(e.target.value)}
              placeholder="Log a log line, note, or snippet…"
              style={{ ...inputStyle, flex: 1, fontFamily: "var(--font-mono)" }}
            />
            <button type="submit" style={smallBtnStyle}>
              Add evidence
            </button>
          </form>

          <form onSubmit={addHypothesis} style={{ marginTop: 10, display: "flex", gap: 8 }}>
            <input
              value={hypInput}
              onChange={(e) => setHypInput(e.target.value)}
              placeholder="Log a hypothesis…"
              style={{ ...inputStyle, flex: 1 }}
            />
            <button type="submit" style={{ ...smallBtnStyle, background: "var(--amber)", color: "#241800" }}>
              Add hypothesis
            </button>
          </form>

          {hypotheses.length > 0 && (
            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              {hypotheses.map((h) => (
                <div
                  key={h.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    padding: "10px 12px",
                  }}
                >
                  <span style={{ fontSize: 13 }}>{h.title}</span>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <StatusPill status={h.status} />
                    <button onClick={() => markHypothesis(h.id, "CONFIRMED")} style={tagBtnStyle}>
                      ✓
                    </button>
                    <button onClick={() => markHypothesis(h.id, "RULED_OUT")} style={tagBtnStyle}>
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <SectionLabel>Ask BugRecall</SectionLabel>
          <div
            style={{
              marginTop: 16,
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              background: "var(--surface)",
              display: "flex",
              flexDirection: "column",
              height: 420,
            }}
          >
            <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
              {chatLog.length === 0 && (
                <div style={{ color: "var(--text-faint)", fontSize: 12.5, lineHeight: 1.6 }}>
                  Ask what to check next. BugRecall will reason over everything logged in this case.
                </div>
              )}
              {chatLog.map((m, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: 12.5,
                    lineHeight: 1.5,
                    color: m.role === "ai" ? "var(--teal)" : "var(--text)",
                    fontFamily: m.role === "ai" ? "var(--font-mono)" : "var(--font-ui)",
                  }}
                >
                  <span style={{ color: "var(--text-faint)" }}>{m.role === "ai" ? "bugrecall › " : "you › "}</span>
                  {m.text}
                </div>
              ))}
            </div>
            <form onSubmit={sendChat} style={{ borderTop: "1px solid var(--border)", padding: 10, display: "flex", gap: 6 }}>
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="What should I check next?"
                style={{ ...inputStyle, flex: 1, fontSize: 12.5 }}
              />
              <button type="submit" style={smallBtnStyle} disabled={chatLoading}>
              {chatLoading ? "…" : "→"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        letterSpacing: 0.6,
        textTransform: "uppercase",
        color: "var(--text-faint)",
      }}
    >
      {children}
    </div>
  );
}

function TimelineRow({ item }: { item: TimelineItem }) {
  const isEvidence = item.kind === "evidence";
  return (
    <div style={{ position: "relative", paddingBottom: 16 }}>
      <div
        style={{
          position: "absolute",
          left: -20,
          top: 4,
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: isEvidence ? "var(--amber)" : "var(--teal)",
          border: "2px solid var(--bg)",
        }}
      />
      <div style={{ fontSize: 10, color: "var(--text-faint)", marginBottom: 3, fontFamily: "var(--font-mono)" }}>
        {isEvidence ? "EVIDENCE" : "HYPOTHESIS"}
      </div>
      <div
        style={{
          fontSize: 13,
          fontFamily: isEvidence ? "var(--font-mono)" : "var(--font-ui)",
          color: "var(--text)",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-sm)",
          padding: "8px 10px",
        }}
      >
        {isEvidence ? (item.data as Evidence).content : (item.data as Hypothesis).title}
      </div>
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

const smallBtnStyle: React.CSSProperties = {
  background: "var(--text)",
  color: "var(--bg)",
  border: "none",
  borderRadius: "var(--radius-sm)",
  padding: "0 14px",
  fontSize: 12.5,
  fontWeight: 600,
  cursor: "pointer",
};

const tagBtnStyle: React.CSSProperties = {
  background: "var(--bg)",
  border: "1px solid var(--border-strong)",
  borderRadius: 4,
  color: "var(--text-muted)",
  fontSize: 11,
  width: 22,
  height: 22,
  cursor: "pointer",
};
