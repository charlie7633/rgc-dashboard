"use client";

export type ViewOption = "bar" | "line" | "pie" | "table" | "heatmap" | "ai";

interface View {
  id: ViewOption;
  label: string;
  icon: string;
  description: string;
  default: boolean;
}

const VIEWS: View[] = [
  { id: "bar",     icon: "📊", label: "Bar chart",    description: "Ratings by product",          default: true },
  { id: "pie",     icon: "🥧", label: "Pie chart",    description: "Sentiment breakdown",          default: true },
  { id: "line",    icon: "📈", label: "Line chart",   description: "Ratings over time",            default: false },
  { id: "table",   icon: "🗂️", label: "Table",        description: "Sortable review list",         default: true },
  { id: "heatmap", icon: "🌡", label: "Heatmap",      description: "Reviewer × product matrix",    default: false },
  { id: "ai",      icon: "🤖", label: "AI Summary",   description: "Gemini themes & insights",     default: true },
];

interface ViewPickerProps {
  selected: ViewOption[];
  onChange: (views: ViewOption[]) => void;
}

export function ViewPicker({ selected, onChange }: ViewPickerProps) {
  function toggle(id: ViewOption) {
    onChange(
      selected.includes(id) ? selected.filter((v) => v !== id) : [...selected, id]
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {VIEWS.map((v) => {
        const active = selected.includes(v.id);
        return (
          <button
            key={v.id}
            onClick={() => toggle(v.id)}
            className="rounded-xl p-4 text-left transition-all"
            style={{
              background: active ? "#eef2ff" : "var(--color-card)",
              border: active ? "2px solid var(--color-rgc-electric)" : "2px solid var(--color-card-border)",
            }}
          >
            <div className="text-2xl mb-2">{v.icon}</div>
            <p className="text-sm font-semibold" style={{ color: active ? "var(--color-rgc-electric)" : "var(--text-primary)" }}>
              {v.label}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              {v.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}
