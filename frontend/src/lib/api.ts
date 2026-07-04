

import type { BugSession, Evidence, Hypothesis } from "../types";

const BASE_URL = "http://127.0.0.1:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`API ${res.status}: ${detail}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  listSessions: () => request<BugSession[]>("/sessions/"),
  getSession: (id: number) => request<BugSession>(`/sessions/${id}`),
  createSession: (data: { title: string; project: string; description?: string }) =>
    request<BugSession>("/sessions/", { method: "POST", body: JSON.stringify(data) }),
  deleteSession: (id: number) =>
    request<void>(`/sessions/${id}`, { method: "DELETE" }),
  listEvidence: (sessionId: number) => request<Evidence[]>(`/evidence/${sessionId}`),
  createEvidence: (data: { session_id: number; type: string; content: string }) =>
    request<Evidence>("/evidence/", { method: "POST", body: JSON.stringify(data) }),
  listHypotheses: (sessionId: number) => request<Hypothesis[]>(`/hypothesis/${sessionId}`),
  createHypothesis: (data: { session_id: number; title: string }) =>
    request<Hypothesis>("/hypothesis/", { method: "POST", body: JSON.stringify(data) }),
  updateHypothesis: (id: number, data: { status: string; reason?: string }) =>
    request<Hypothesis>(`/hypothesis/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  // 👇 NEW — paste this block here
  askBugRecall: (sessionId: number, question: string) =>
    request<{ answer: string }>(`/sessions/${sessionId}/ask`, {
      method: "POST",
      body: JSON.stringify({ question }),
    }),
getSessionSummary: (sessionId: number) =>
      request<{ answer: string }>(`/sessions/${sessionId}/summary`),
    getSimilarBugs: (sessionId: number) =>
      request<{ matches: { session_id: number; title: string; project: string; reason: string }[] }>(
        `/sessions/${sessionId}/similar`
      ),
};