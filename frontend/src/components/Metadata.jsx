import { Activity, Cpu, Gauge, Hash, Radio } from "lucide-react";

export default function Metadata({ metadata }) {
  const source = metadata.resolution_source || "UNKNOWN";
  const items = [
    { key: "model", label: metadata.model || "Unknown model", icon: Cpu, testId: "meta-model" },
    { key: "latency", label: `${metadata.latency_ms ?? "—"} ms`, icon: Gauge, testId: "meta-latency" },
    { key: "input", label: `${metadata.input_tokens ?? "—"} in`, icon: Activity, testId: "meta-input-tokens" },
    { key: "output", label: `${metadata.output_tokens ?? "—"} out`, icon: Hash, testId: "meta-output-tokens" },
    { key: "fallbacks", label: `${metadata.fallback_attempts ?? 0} fallback${metadata.fallback_attempts === 1 ? "" : "s"}`, icon: Radio },
  ];

  return (
    <div className="metadata-card">
      <div className={`metadata-source metadata-source--${source.toLowerCase()}`} data-testid="meta-source">
        <span className="metadata-source-dot" />
        {source.replaceAll("_", " ")}
      </div>
      <div className="metadata-items">
        {items.map(({ key, label, icon: Icon, testId }) => (
          <span className="metadata-item" key={key} {...(testId ? { "data-testid": testId } : {})}>
            <Icon size={12} />
            <span>{label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
