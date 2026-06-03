interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  delta?: string;       // e.g. "+12%" shown as a small badge
  deltaUp?: boolean;    // green if true, red if false
  accent?: string;      // left border colour (css colour string)
}

export function StatCard({ title, value, subtitle, delta, deltaUp, accent }: StatCardProps) {
  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-1"
      style={{
        background: "var(--color-card)",
        border: "1px solid var(--color-card-border)",
        borderLeft: accent ? `3px solid ${accent}` : "1px solid var(--color-card-border)",
      }}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "#94a3b8" }}>
          {title}
        </p>
        {delta && (
          <span
            className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
            style={{
              background: deltaUp ? "#dcfce7" : "#fee2e2",
              color: deltaUp ? "#15803d" : "#dc2626",
            }}
          >
            {delta}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-foreground)" }}>
        {value}
      </p>
      {subtitle && <p className="text-xs" style={{ color: "#94a3b8" }}>{subtitle}</p>}
    </div>
  );
}
