interface Props {
  loading: boolean;
  summary: string | null;
  onDismiss: () => void;
}

export default function ResumeBanner({ loading, summary, onDismiss }: Props) {
  if (!loading && !summary) return null;

  return (
    <div
      style={{
        marginBottom: 24,
        border: "1px solid var(--teal-dim)",
        borderLeft: "3px solid var(--teal)",
        borderRadius: "var(--radius)",
        background: "var(--surface)",
        padding: "14px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 16,
      }}
    >
      <div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10.5,
            letterSpacing: 0.6,
            textTransform: "uppercase",
            color: "var(--teal)",
            marginBottom: 6,
          }}
        >
          Welcome back
        </div>
        {loading ? (
          <div style={{ color: "var(--text-faint)", fontSize: 13 }}>Reviewing the case file…</div>
        ) : (
          <div style={{ color: "var(--text)", fontSize: 13.5, lineHeight: 1.6 }}>{summary}</div>
        )}
      </div>
      {!loading && (
        <button
          onClick={onDismiss}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-faint)",
            fontSize: 16,
            cursor: "pointer",
            lineHeight: 1,
          }}
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  );
}