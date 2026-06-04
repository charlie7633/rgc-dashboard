"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface Reviewer {
  brand: string; firstName: string; lastName: string; age: string;
  gender: string; region: string; tier: string;
  primaryArchetype: string; archetypes: string[]; tags: string[];
  rating: number; sentiment: string; wouldBuyAfter: boolean; wouldBuyFirst: boolean;
  productName: string;
}

const TIER_COLOURS: Record<string, string> = { TIER_1: "#5A67D8", TIER_2: "#C061B9", TIER_3: "#4EA4B5" };
const GENDER_COLOURS = ["#5A67D8", "#C061B9", "#4EA4B5", "#E289C1", "#94a3b8"];

export default function ReviewersPage() {
  const [data, setData] = useState<Reviewer[]>([]);

  useEffect(() => {
    fetch("/api/transcripts").then((r) => r.json()).then((transcripts) => {
      setData(transcripts.filter((t: { user: unknown }) => t.user).map((t: {
        brand: string; productName: string; rating: number; sentiment: string;
        wouldBuyAfter: boolean; wouldBuyFirst: boolean;
        user: { firstName: string; lastName: string; age: string; gender: string; region: string;
          tier: string; primaryArchetype: string; archetypes: string[]; tags: string[]; };
      }) => ({ ...t.user, brand: t.brand, productName: t.productName, rating: t.rating, sentiment: t.sentiment, wouldBuyAfter: t.wouldBuyAfter, wouldBuyFirst: t.wouldBuyFirst })));
    });
  }, []);

  // Age distribution (buckets)
  const ageBuckets: Record<string, number> = { "18-24": 0, "25-34": 0, "35-44": 0, "45-54": 0, "55+": 0 };
  data.forEach((r) => {
    const age = parseInt(r.age);
    if (!isNaN(age)) {
      if (age < 25) ageBuckets["18-24"]++;
      else if (age < 35) ageBuckets["25-34"]++;
      else if (age < 45) ageBuckets["35-44"]++;
      else if (age < 55) ageBuckets["45-54"]++;
      else ageBuckets["55+"]++;
    }
  });
  const ageData = Object.entries(ageBuckets).map(([age, count]) => ({ age, count }));

  // Gender
  const genderCounts: Record<string, number> = {};
  data.forEach((r) => { const g = r.gender || "Not stated"; genderCounts[g] = (genderCounts[g] ?? 0) + 1; });
  const genderData = Object.entries(genderCounts).map(([name, value]) => ({ name, value }));

  // Tier
  const tierCounts: Record<string, number> = {};
  data.forEach((r) => { tierCounts[r.tier] = (tierCounts[r.tier] ?? 0) + 1; });

  // Top archetypes
  const archetypeCounts: Record<string, number> = {};
  data.forEach((r) => r.archetypes?.forEach((a) => { archetypeCounts[a] = (archetypeCounts[a] ?? 0) + 1; }));
  const topArchetypes = Object.entries(archetypeCounts).sort(([, a], [, b]) => b - a).slice(0, 8);

  // Top tags
  const tagCounts: Record<string, number> = {};
  data.forEach((r) => r.tags?.forEach((t) => { tagCounts[t] = (tagCounts[t] ?? 0) + 1; }));
  const topTags = Object.entries(tagCounts).sort(([, a], [, b]) => b - a).slice(0, 20);

  // Region
  const regionCounts: Record<string, number> = {};
  data.forEach((r) => { if (r.region) regionCounts[r.region] = (regionCounts[r.region] ?? 0) + 1; });
  const regionData = Object.entries(regionCounts).sort(([, a], [, b]) => b - a).map(([region, count]) => ({ region: region.replace(" and the ", " & ").replace("East of England", "East"), count }));

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Reviewers</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          {data.length} reviewer profiles · demographics, archetypes, behavioural tags
        </p>
      </div>

      {/* Stat cards */}
      {/* Tier explainer */}
      <div className="mb-4 rounded-xl px-4 py-3 text-xs" style={{ background: "#f8fafc", border: "1px solid var(--color-card-border)", color: "var(--text-muted)" }}>
        <span className="font-semibold" style={{ color: "var(--text-secondary)" }}>What are reviewer tiers? </span>
        Reviewers are rated by the platform based on their track record.{" "}
        <span style={{ color: TIER_COLOURS["TIER_1"] }}>Tier 1</span> = most experienced and trusted (fewest, highest quality reviews) ·{" "}
        <span style={{ color: TIER_COLOURS["TIER_2"] }}>Tier 2</span> = established reviewers with a solid history ·{" "}
        <span style={{ color: TIER_COLOURS["TIER_3"] }}>Tier 3</span> = newer or developing reviewers
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {Object.entries(tierCounts).sort().map(([tier, count]) => {
          const descriptions: Record<string, string> = {
            TIER_1: "Most trusted reviewers",
            TIER_2: "Established reviewers",
            TIER_3: "Developing reviewers",
          };
          return (
            <div key={tier} className="rounded-xl p-4" style={{ background: "var(--color-card)", border: `2px solid ${TIER_COLOURS[tier] ?? "#94a3b8"}` }}>
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: TIER_COLOURS[tier] ?? "#94a3b8" }}>{tier.replace("_", " ")}</p>
              <p className="text-3xl font-black mt-1" style={{ color: "var(--text-primary)" }}>{count}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{descriptions[tier] ?? "reviewers"}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Age */}
        <div className="rounded-2xl p-5" style={{ background: "var(--color-card)", border: "1px solid var(--color-card-border)" }}>
          <p className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Age distribution</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={ageData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="age" tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
              <Bar dataKey="count" name="Reviewers" fill="#5A67D8" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gender */}
        <div className="rounded-2xl p-5" style={{ background: "var(--color-card)", border: "1px solid var(--color-card-border)" }}>
          <p className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Gender breakdown</p>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={130} height={130}>
              <PieChart>
                <Pie data={genderData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" paddingAngle={2}>
                  {genderData.map((entry, i) => <Cell key={`gender-${entry.name}`} fill={GENDER_COLOURS[i % GENDER_COLOURS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5">
              {genderData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: GENDER_COLOURS[i] }} />
                  {d.name}: <strong>{d.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Archetypes */}
        <div className="rounded-2xl p-5" style={{ background: "var(--color-card)", border: "1px solid var(--color-card-border)" }}>
          <p className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Top reviewer archetypes</p>
          <div className="space-y-2">
            {topArchetypes.map(([name, count]) => (
              <div key={name}>
                <div className="flex justify-between text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>
                  <span>{name.replace("The ", "")}</span>
                  <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{count}</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: "#f1f5f9" }}>
                  <div className="h-full rounded-full" style={{ width: `${(count / data.length) * 100}%`, background: "linear-gradient(90deg,#5A67D8,#C061B9)" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Region */}
        <div className="rounded-2xl p-5" style={{ background: "var(--color-card)", border: "1px solid var(--color-card-border)" }}>
          <p className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Reviewer regions</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={regionData} layout="vertical" margin={{ top: 0, right: 8, left: 80, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 9, fill: "#94a3b8" }} />
              <YAxis type="category" dataKey="region" tick={{ fontSize: 9, fill: "#94a3b8" }} width={80} />
              <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
              <Bar dataKey="count" fill="#4EA4B5" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Behavioural tags cloud */}
      <div className="rounded-2xl p-5" style={{ background: "var(--color-card)", border: "1px solid var(--color-card-border)" }}>
        <p className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Top behavioural tags</p>
        <div className="flex flex-wrap gap-2">
          {topTags.map(([tag, count]) => (
            <span key={tag} className="px-2.5 py-1 rounded-full text-xs font-medium"
              style={{
                background: `rgba(90,103,216,${0.1 + (count / topTags[0][1]) * 0.25})`,
                color: "var(--color-rgc-electric)",
                fontSize: `${10 + (count / topTags[0][1]) * 4}px`,
              }}>
              {tag} <span className="opacity-60">{count}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
