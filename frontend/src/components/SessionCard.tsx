import { Link } from "react-router-dom";
import type { BugSession } from "../types";
import StatusPill from "./StatusPill";

interface Props {
  session: BugSession;
}

export default function SessionCard({ session }: Props) {
  return (
    <Link
      to={`/sessions/${session.id}`}
      style={{
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <div
        style={{
          background: "#171B22",
          border: "1px solid #2B3240",
          borderRadius: "16px",
          padding: "22px",
          transition: "0.25s",
          cursor: "pointer",
          marginBottom: "18px",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#3B82F6";
          e.currentTarget.style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#2B3240";
          e.currentTarget.style.transform = "translateY(0px)";
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                color: "white",
                fontSize: "20px",
              }}
            >
              🐞 {session.title}
            </h2>

            <p
              style={{
                color: "#94A3B8",
                marginTop: "10px",
                marginBottom: "6px",
              }}
            >
              📁 {session.project}
            </p>

            <small
              style={{
                color: "#64748B",
              }}
            >
              Session #{session.id}
            </small>
          </div>

          <StatusPill status={session.status} />
        </div>

        <hr
          style={{
            margin: "18px 0",
            border: 0,
            borderTop: "1px solid #2B3240",
          }}
        />

        <div
          style={{
            color: "#60A5FA",
            fontWeight: 500,
          }}
        >
          Continue Investigation →
        </div>
      </div>
    </Link>
  );
}