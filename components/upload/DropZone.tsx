"use client";

import { useRef, useState } from "react";

interface DropZoneProps {
  onFile: (file: File) => void;
  loading: boolean;
}

export function DropZone({ onFile, loading }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFile(file);
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className="cursor-pointer rounded-2xl border-2 border-dashed transition-all p-16 text-center"
      style={{
        borderColor: dragging ? "var(--color-rgc-electric)" : "var(--color-card-border)",
        background: dragging ? "#eef2ff" : "var(--color-card)",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.json"
        className="hidden"
        onChange={handleChange}
      />

      {/* Upload icon */}
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
        style={{ background: "linear-gradient(135deg,#1D1B84,#5A67D8,#C061B9)" }}
      >
        <span className="text-2xl">⬆</span>
      </div>

      {loading ? (
        <p className="font-semibold text-sm" style={{ color: "var(--text-accent)" }}>
          Parsing file…
        </p>
      ) : (
        <>
          <p className="font-semibold text-sm mb-1" style={{ color: "var(--text-primary)" }}>
            Drop your dataset here, or click to browse
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Accepts .csv and .json · Max 10MB · Multiple files coming soon
          </p>
        </>
      )}
    </div>
  );
}
