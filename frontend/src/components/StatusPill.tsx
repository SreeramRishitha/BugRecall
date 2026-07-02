const STYLES: Record<string, { bg: string; fg: string; label: string }> = {
  OPEN: { bg: "var(--amber-dim)", fg: "var(--amber)", label: "Open" },
  CLOSED: { bg: "var(--teal-dim)", fg: "var(--teal)", label: "Closed" },
  UNTESTED: { bg: "var(--surface-hover)", fg: "var(--text-muted)", label: "Untested" },
  TESTED: { bg: "var(--amber-dim)", fg: "var(--amber)", label: "Tested" },
  CONFIRMED: { bg: "var(--teal-dim)", fg: "var(--teal)", label: "Confirmed" },
  RULED_OUT: { bg: "var(--red-dim)", fg: "var(--red)", label: "Ruled out" },
};

export default function StatusPill({ status }: { status: string }) {
  const s = STYLES[status] ?? STYLES.UNTESTED;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 9px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        fontFamily: "var(--font-mono)",
        letterSpacing: 0.2,
        background: s.bg,
        color: s.fg,
        textTransform: "uppercase",
      }}
    >
      {s.label}
    </span>
  );
}
