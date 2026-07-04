import "./EvidenceCard.css";
import type { Evidence } from "../types";

interface Props {
  evidence: Evidence;
}

const icons: Record<string, string> = {
  LOG: "📄",
  CODE: "💻",
  NOTE: "📝",
};

export default function EvidenceCard({ evidence }: Props) {
  return (
    <div className="evidence-card">
      <div className="evidence-header">
        <span className="evidence-icon">
          {icons[evidence.type] ?? "📌"}
        </span>

        <span className="evidence-type">
          {evidence.type}
        </span>
      </div>

      <div className="evidence-content">
        {evidence.content}
      </div>

      <div className="evidence-date">
        🕒 {new Date(evidence.created_at).toLocaleString()}
      </div>
    </div>
  );
}