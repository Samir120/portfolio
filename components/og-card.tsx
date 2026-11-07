// The Open Graph card, drawn by next/og at build time. Its renderer cannot
// read globals.css, so the colours are the Tokyo Night values from
// docs/02 §3.1, and every element with more than one child sets
// `display: flex`, which the renderer requires.
// https://nextjs.org/docs/app/api-reference/functions/image-response

const COLOURS = {
  bg: "#16161e",
  borderSubtle: "#24283b",
  text: "#c0caf5",
  textSecondary: "#a9b1d6",
  textMuted: "#9aa5ce",
  brand: "#9ece6a",
} as const;

type OgCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  footer: string;
};

export function OgCard({ eyebrow, title, description, footer }: OgCardProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        padding: 48,
        background: COLOURS.bg,
        fontFamily: "Geist",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 56,
          border: `2px solid ${COLOURS.borderSubtle}`,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 16,
            fontSize: 24,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: COLOURS.textMuted,
          }}
        >
          <span style={{ color: COLOURS.brand }}>/</span>
          <span>{eyebrow}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 600,
              letterSpacing: -1.5,
              color: COLOURS.text,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 34,
              lineHeight: 1.4,
              color: COLOURS.textSecondary,
            }}
          >
            {description}
          </div>
        </div>
        <div
          style={{ display: "flex", fontSize: 24, color: COLOURS.textMuted }}
        >
          {footer}
        </div>
      </div>
    </div>
  );
}
