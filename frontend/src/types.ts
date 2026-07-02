export type SessionStatus = "OPEN" | "CLOSED";
export type EvidenceType = "LOG" | "CODE" | "NOTE";
export type HypothesisStatus = "UNTESTED" | "TESTED" | "CONFIRMED" | "RULED_OUT";

export interface BugSession {
  id: number;
  title: string;
  project: string;
  description: string | null;
  status: SessionStatus;
  created_at: string;
}

export interface Evidence {
  id: number;
  session_id: number;
  type: EvidenceType;
  content: string;
  created_at: string;
}

export interface Hypothesis {
  id: number;
  session_id: number;
  title: string;
  status: HypothesisStatus;
  reason: string | null;
  created_at: string;
}

