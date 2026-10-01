export default function EngineMetricBadges({ metrics }: { metrics?: string[] }) {
  if (!metrics?.length) return null;

  return (
    <ul className="flex flex-wrap gap-1.5">
      {metrics.map((metric) => (
        <li
          key={metric}
          className="rounded-full border border-[#00F0FF]/35 bg-[#00F0FF]/10 px-2 py-1 font-mono text-[10px] leading-4 text-cyan-100 shadow-[0_0_12px_rgba(0,240,255,0.12)]"
        >
          {metric}
        </li>
      ))}
    </ul>
  );
}
