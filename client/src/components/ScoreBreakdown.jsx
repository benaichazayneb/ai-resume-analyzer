const LABELS = {
  skillsScore: "Skills Match",
  similarityScore: "Text Similarity",
  keywordScore: "Keywords",
  experienceScore: "Experience",
  educationScore: "Education",
};

export default function ScoreBreakdown({ analysis }) {
  const rows = Object.entries(LABELS).map(([key, label]) => ({
    key,
    label,
    value: analysis[key] ?? 0,
  }));

  return (
    <div className="w-full space-y-3">
      {rows.map((row) => (
        <div key={row.key}>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">{row.label}</span>
            <span className="font-medium text-slate-900">{row.value}%</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-slate-900"
              style={{ width: `${row.value}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
