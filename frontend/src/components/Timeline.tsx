interface Props {
  timeline: any[];

  evidenceInput: string;
  setEvidenceInput: (value: string) => void;

  hypInput: string;
  setHypInput: (value: string) => void;

  addEvidence: (e: React.FormEvent) => void;
  addHypothesis: (e: React.FormEvent) => void;

  TimelineRow: any;
  SectionLabel: any;

  inputStyle: React.CSSProperties;
  smallBtnStyle: React.CSSProperties;
}

export default function Timeline({
  timeline,

  evidenceInput,
  setEvidenceInput,

  hypInput,
  setHypInput,

  addEvidence,
  addHypothesis,

  TimelineRow,
  SectionLabel,

  inputStyle,
  smallBtnStyle,
}: Props) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
      }}
    >
      <SectionLabel>Investigation Timeline</SectionLabel>

      <div
        style={{
          position: "relative",
          paddingLeft: 20,
          marginTop: 16,
          maxHeight: "65vh",
          overflowY: "auto",
        }}
      >
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

        {timeline.length === 0 ? (
          <div
            style={{
              color: "var(--text-faint)",
              fontSize: 13,
              paddingLeft: 4,
            }}
          >
            No evidence or hypotheses logged yet.
          </div>
        ) : (
          timeline.map((item, i) => (
            <TimelineRow key={i} item={item} />
          ))
        )}
      </div>

      <div
        style={{
          marginTop: 24,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <form
          onSubmit={addEvidence}
          style={{
            display: "flex",
            gap: 8,
          }}
        >
          <input
            value={evidenceInput}
            onChange={(e) => setEvidenceInput(e.target.value)}
            placeholder="Log a log line, note, or snippet..."
            style={{
              ...inputStyle,
              flex: 1,
              fontFamily: "var(--font-mono)",
            }}
          />

          <button type="submit" style={smallBtnStyle}>
            Add Evidence
          </button>
        </form>

        <form
          onSubmit={addHypothesis}
          style={{
            display: "flex",
            gap: 8,
          }}
        >
          <input
            value={hypInput}
            onChange={(e) => setHypInput(e.target.value)}
            placeholder="Log a hypothesis..."
            style={{
              ...inputStyle,
              flex: 1,
            }}
          />

          <button
            type="submit"
            style={{
              ...smallBtnStyle,
              background: "var(--amber)",
              color: "#241800",
            }}
          >
            Add Hypothesis
          </button>
        </form>
      </div>
    </div>
  );
}