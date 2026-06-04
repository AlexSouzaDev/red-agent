import Link from "next/link";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { loadScenarios } from "@/lib/attacks/loader";
import type { RunSummary, EvalResult } from "@/lib/attacks/types";

const categoryLabels: Record<string, string> = {
  prompt_injection_document: "Prompt Injection",
  poisoned_tool_output: "Poisoned Tools",
  context_flooding: "Context Flooding",
  indirect_injection: "Indirect Injection",
  chain_of_thought_hijack: "CoT Hijack",
};

interface ResultsFile {
  summary: RunSummary;
  results: EvalResult[];
}

async function loadRuns(): Promise<ResultsFile[]> {
  const dir = path.join(process.cwd(), "results");
  let files: string[];
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith(".json")).sort().reverse();
  } catch {
    return [];
  }
  const runs = await Promise.all(
    files.map(async (file) => {
      const raw = await readFile(path.join(dir, file), "utf8");
      return JSON.parse(raw) as ResultsFile;
    }),
  );
  return runs;
}

export default async function HomePage() {
  const [scenarios, runs] = await Promise.all([
    loadScenarios("data/scenarios"),
    loadRuns(),
  ]);

  const byCategory = scenarios.reduce<Record<string, number>>((counts, scenario) => {
    counts[scenario.category] = (counts[scenario.category] ?? 0) + 1;
    return counts;
  }, {});

  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">Adversarial Finance Agent Stress-Test</p>
        <h1>
          red<span className="accentDot">.</span>agent
        </h1>
        <p className="lede">
          A benchmark harness for attacking tool-using finance agents with typed
          scenarios, controlled mock tools, automatic judging, and comparative scoring.
        </p>
        <div className="actions">
          <span className="cmdChip">npm run eval:mock</span>
          <span className="cmdChip">npm run eval</span>
        </div>
      </section>

      <section className="grid">
        <MetricCard label="Starter scenarios" value={scenarios.length.toString()} />
        <MetricCard label="Attack categories" value={Object.keys(byCategory).length.toString()} />
        <MetricCard label="Eval runs" value={runs.length.toString()} />
      </section>

      <section className="panel">
        <div className="panelHeader">
          <h2>Scenario Library</h2>
          <p>{scenarios.length} scenarios · {Object.keys(byCategory).length} categories</p>
        </div>
        <div className="scenarioList">
          {scenarios.map((scenario) => (
            <article key={scenario.id} className="scenarioCard">
              <div>
                <p className="scenarioId">{scenario.id}</p>
                <h3>{scenario.name}</h3>
              </div>
              <p>{categoryLabels[scenario.category] ?? scenario.category}</p>
              <span className="severityChip" data-severity={scenario.severity}>
                {scenario.severity}
              </span>
            </article>
          ))}
        </div>
      </section>

      {runs.length > 0 ? (
        <section className="panel">
          <div className="panelHeader">
            <h2>Eval Runs</h2>
            <p>Most recent first</p>
          </div>
          <div className="runList">
            {runs.map((run) => (
              <RunCard key={run.summary.run_id} run={run} />
            ))}
          </div>
        </section>
      ) : (
        <section className="panel">
          <div className="panelHeader">
            <h2>Eval Runs</h2>
            <p>No runs yet</p>
          </div>
          <div className="emptyState">
            <p>No evaluation runs found. Run the harness to generate results.</p>
            <code>npm run eval:mock</code>
          </div>
        </section>
      )}
    </main>
  );
}

function RunCard({ run }: { run: ResultsFile }) {
  const { summary, results } = run;
  const ts = new Date(summary.timestamp).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <article className="runCard">
      <div className="runHeader">
        <div>
          <p className="modelLabel">{summary.model}</p>
          <p className="runTime">{ts} · {summary.total_scenarios} scenarios</p>
        </div>
        <div className="runStats">
          <Stat label="ASR" value={`${summary.attack_success_rate}%`} danger />
          <Stat label="Detected" value={`${summary.detection_rate}%`} />
          <Stat label="Safe" value={`${summary.safe_refusal_rate}%`} safe />
          <Stat label="Partial" value={`${summary.partial_rate}%`} />
        </div>
      </div>
      <div className="resultRows">
        {results.map((r) => (
          <div key={r.scenario_id} className="resultRow">
            <span className="resultId">{r.scenario_id}</span>
            <span className="resultName">{r.scenario_name}</span>
            <span data-outcome={r.outcome} className="outcomeChip">{r.outcome}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

function Stat({
  label,
  value,
  danger,
  safe,
}: {
  label: string;
  value: string;
  danger?: boolean;
  safe?: boolean;
}) {
  return (
    <div className="stat">
      <p>{label}</p>
      <strong data-danger={danger || undefined} data-safe={safe || undefined}>
        {value}
      </strong>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="metricCard">
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  );
}
