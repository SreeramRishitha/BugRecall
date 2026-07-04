import StatusPill from "./StatusPill";
import type { BugSession } from "../types";

interface Props {
  session: BugSession;
}

export default function SessionHeader({ session }: Props) {
  return (
    <div
      style={{
        marginBottom: 28,
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
          <div
            style={{
              fontSize: 12,
              color: "var(--text-faint)",
              fontFamily: "var(--font-mono)",
              marginBottom: 8,
            }}
          >
            {session.project} · #{session.id}
          </div>

          <h1
            style={{
              fontSize: 34,
              margin: 0,
              fontWeight: 700,
            }}
          >
            {session.title}
          </h1>

          {session.description && (
            <p
              style={{
                marginTop: 12,
                color: "var(--text-muted)",
                maxWidth: 650,
                lineHeight: 1.7,
              }}
            >
              {session.description}
            </p>
          )}
        </div>

        <StatusPill status={session.status} />
      </div>
    </div>
  );
}