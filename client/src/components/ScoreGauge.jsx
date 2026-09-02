import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";

export default function ScoreGauge({ score, size = 160 }) {
  const data = [{ name: "score", value: score, fill: "#0f172a" }];

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <RadialBarChart
        width={size}
        height={size}
        cx="50%"
        cy="50%"
        innerRadius="75%"
        outerRadius="100%"
        barSize={10}
        data={data}
        startAngle={90}
        endAngle={-270}
      >
        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
        <RadialBar background dataKey="value" cornerRadius={10} />
      </RadialBarChart>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold text-slate-900">{score}%</span>
        <span className="text-xs text-slate-500">Match</span>
      </div>
    </div>
  );
}
