export type OGVerticalProps = {
  name: string;
  tagline: string;
  subtext: string;
  kpis: string[];
};

export function VerticalOGImage({ name, tagline, subtext, kpis }: OGVerticalProps) {
  return (
    <div
      style={{
        width: 1200,
        height: 630,
        background: "#09090b",
        display: "flex",
        flexDirection: "column",
        padding: "72px 80px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(ellipse at 15% 55%, rgba(52,211,153,0.07) 0%, transparent 55%), radial-gradient(ellipse at 85% 20%, rgba(99,102,241,0.05) 0%, transparent 50%)",
          display: "flex",
        }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 0, zIndex: 1 }}>
        <span style={{ color: "#34d399", fontSize: 24, fontWeight: 800 }}>Ops</span>
        <span style={{ color: "#ffffff", fontSize: 24, fontWeight: 800 }}>Oracle AI</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", marginTop: 56, zIndex: 1, flex: 1 }}>
        <div
          style={{
            color: "#34d399",
            fontSize: 13,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.18em",
            marginBottom: 18,
            display: "flex",
          }}
        >
          {name}
        </div>
        <div
          style={{
            color: "#ffffff",
            fontSize: 54,
            fontWeight: 800,
            lineHeight: 1.1,
            maxWidth: 820,
            display: "flex",
            flexWrap: "wrap",
          }}
        >
          {tagline}
        </div>
        <div
          style={{
            color: "#71717a",
            fontSize: 20,
            marginTop: 22,
            fontWeight: 400,
            display: "flex",
          }}
        >
          {subtext}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center", zIndex: 1, marginTop: 40 }}>
        {kpis.map((kpi) => (
          <div
            key={kpi}
            style={{
              padding: "8px 18px",
              borderRadius: 100,
              border: "1px solid rgba(52,211,153,0.28)",
              background: "rgba(52,211,153,0.07)",
              color: "#34d399",
              fontSize: 13,
              fontWeight: 600,
              display: "flex",
            }}
          >
            {kpi}
          </div>
        ))}
        <div
          style={{
            marginLeft: "auto",
            padding: "8px 18px",
            borderRadius: 100,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.03)",
            color: "#52525b",
            fontSize: 13,
            display: "flex",
          }}
        >
          nanoneuron.ai
        </div>
      </div>
    </div>
  );
}
