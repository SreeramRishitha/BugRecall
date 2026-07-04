import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api";
import type { BugSession, Evidence, Hypothesis } from "../types";

import EvidenceCard from "../components/EvidenceCard";
import HypothesisCard from "../components/HypothesisCard";
import Sidebar from "../components/Sidebar";
import SessionHeader from "../components/SessionHeader";
import Timeline from "../components/Timeline";

type TimelineItem =
  | { kind: "evidence"; data: Evidence; at: string }
  | { kind: "hypothesis"; data: Hypothesis; at: string };

export default function BugSessionPage() {
  const { id } = useParams();
  const sessionId = Number(id);

  const [session, setSession] = useState<BugSession | null>(null);
  const [allSessions, setAllSessions] = useState<BugSession[]>([]);
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

    api.listSessions().then(setAllSessions);

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
  ...evidence.map((e): TimelineItem => ({
    kind: "evidence",
    data: e,
    at: e.created_at,
  })),

  ...hypotheses.map((h): TimelineItem => ({
  kind: "hypothesis",
  data: h,
  at: h.created_at,
})),].sort((a, b) => a.at.localeCompare(b.at));
  return (
    <div style={{ maxWidth:1700,
width:"100%", margin: "0 auto",padding: "32px" }}>
      <SessionHeader session={session} />

<div
  style={{
    display: "grid",
   gridTemplateColumns: "280px minmax(650px,1fr) 360px",
    gap: 40,
    alignItems: "start",
  }}
><Sidebar sessions={allSessions} />

        <Timeline
  timeline={timeline}
  

  evidenceInput={evidenceInput}
  setEvidenceInput={setEvidenceInput}

  hypInput={hypInput}
  setHypInput={setHypInput}

  addEvidence={addEvidence}
  addHypothesis={addHypothesis}

  TimelineRow={TimelineRow}
  SectionLabel={SectionLabel}

  inputStyle={inputStyle}
  smallBtnStyle={smallBtnStyle}
/>
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
              height:"calc(100vh - 220px)"
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

  {isEvidence ? (
    <EvidenceCard evidence={item.data as Evidence} />
  ) : (
    <HypothesisCard hypothesis={item.data as Hypothesis} />
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

