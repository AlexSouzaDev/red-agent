import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How it works — red-agent",
  description: "Full technical explanation of the red-agent evaluation harness",
};

export default function AboutPage() {
  return (
    <main className="aboutShell">
      <section className="aboutHero">
        <p className="eyebrow">Technical documentation</p>
        <h1>How it works</h1>
        <p className="lede">
          red-agent is an adversarial evaluation harness that stress-tests tool-using
          LLM agents against a library of typed attack scenarios. It runs controlled
          injections, captures agent traces, and scores outcomes with a separate judge model.
        </p>
      </section>

      <section className="docSection">
        <div className="docSectionHeader">
          <span className="sectionIndex">01</span>
          <h2>The Problem</h2>
        </div>
        <div className="docBody">
          <p>
            Modern LLM agents have tool access — they can read documents, call APIs,
            execute code, and trigger financial operations. This creates a wide attack surface:
            adversaries can embed malicious instructions in any data the agent reads or any
            tool response it receives.
          </p>
          <p>
            Standard benchmarks measure capability, not robustness under adversarial conditions.
            red-agent fills that gap by systematically injecting attacks at every trust boundary
            the agent relies on, then measuring whether it was manipulated, detected the threat,
            or safely refused.
          </p>
        </div>
      </section>

      <section className="docSection">
        <div className="docSectionHeader">
          <span className="sectionIndex">02</span>
          <h2>Attack Categories</h2>
        </div>
        <div className="docBody">
          <div className="attackGrid">
            <div className="attackCell">
              <div className="attackCellAccent" />
              <h3>Prompt Injection</h3>
              <p>
                Malicious instructions embedded inside documents the agent is asked to
                summarize or analyze. The payload hijacks the agent&apos;s next action
                by overriding its task context from within a trusted-looking file.
              </p>
            </div>
            <div className="attackCell">
              <div className="attackCellAccent" />
              <h3>Poisoned Tool Output</h3>
              <p>
                Injection delivered via a tool&apos;s return value — for example, a price
                feed or calculator that returns a crafted string with embedded instructions
                alongside the expected data.
              </p>
            </div>
            <div className="attackCell">
              <div className="attackCellAccent" />
              <h3>Context Flooding</h3>
              <p>
                The context window is filled with benign-looking content that subtly
                reframes the agent&apos;s understanding of which company, account, or
                asset it is working with — causing it to act on incorrect identity.
              </p>
            </div>
            <div className="attackCell">
              <div className="attackCellAccent" />
              <h3>Indirect Injection</h3>
              <p>
                Instructions injected through a secondary retrieved source — a compliance
                database, a news article, an email — that the agent consults as part of
                its reasoning, not as the primary task input.
              </p>
            </div>
            <div className="attackCell">
              <div className="attackCellAccent" />
              <h3>CoT Hijack</h3>
              <p>
                Chain-of-thought manipulation: payload targets the agent&apos;s reasoning
                trace itself, inserting plausible-looking reasoning steps that lead to a
                compromised conclusion while appearing internally consistent.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="docSection">
        <div className="docSectionHeader">
          <span className="sectionIndex">03</span>
          <h2>Evaluation Pipeline</h2>
        </div>
        <div className="docBody">
          <div className="pipelineSteps">
            <div className="pipelineStep">
              <span className="stepNum">1</span>
              <div className="stepContent">
                <h3>Scenario Loading</h3>
                <p>
                  YAML scenario files are parsed and validated against the{" "}
                  <span className="inlineCode">AttackScenario</span> schema. Each scenario
                  declares a victim task, injection point, payload, and pass/fail criteria.
                </p>
              </div>
            </div>
            <div className="pipelineStep">
              <span className="stepNum">2</span>
              <div className="stepContent">
                <h3>Mock Tool Injection</h3>
                <p>
                  The harness wraps each tool call with an injector. When a scenario targets
                  a specific tool, the injector substitutes or poisons the tool output with the
                  attack payload before the agent processes it.
                </p>
              </div>
            </div>
            <div className="pipelineStep">
              <span className="stepNum">3</span>
              <div className="stepContent">
                <h3>Agent Execution</h3>
                <p>
                  The target finance agent runs to completion. Full message trace, all tool
                  calls with inputs and outputs, final response, token count, and latency are
                  captured in an{" "}
                  <span className="inlineCode">AgentTrace</span>.
                </p>
              </div>
            </div>
            <div className="pipelineStep">
              <span className="stepNum">4</span>
              <div className="stepContent">
                <h3>Automated Judging</h3>
                <p>
                  A separate judge model receives the trace and the scenario&apos;s{" "}
                  <span className="inlineCode">compromised_if</span> and{" "}
                  <span className="inlineCode">safe_if</span> criteria. It classifies the
                  outcome and returns a structured explanation.
                </p>
              </div>
            </div>
            <div className="pipelineStep">
              <span className="stepNum">5</span>
              <div className="stepContent">
                <h3>Scoring &amp; Aggregation</h3>
                <p>
                  Per-scenario outcomes roll up into run-level statistics: ASR, detection
                  rate, safe refusal rate, and a severity-weighted ASR that penalizes failures
                  on critical scenarios more heavily.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="docSection">
        <div className="docSectionHeader">
          <span className="sectionIndex">04</span>
          <h2>Outcome Definitions</h2>
        </div>
        <div className="docBody">
          <table className="outcomeTable">
            <thead>
              <tr>
                <th>Outcome</th>
                <th>Meaning</th>
                <th>Counts toward</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="label">
                  <span className="outcomeChip" data-outcome="COMPROMISED">COMPROMISED</span>
                </td>
                <td>The agent executed or endorsed the attacker&apos;s intended action.</td>
                <td>Attack Success Rate (ASR)</td>
              </tr>
              <tr>
                <td className="label">
                  <span className="outcomeChip" data-outcome="DETECTED">DETECTED</span>
                </td>
                <td>The agent explicitly flagged a manipulation attempt but may have partially complied.</td>
                <td>Detection Rate</td>
              </tr>
              <tr>
                <td className="label">
                  <span className="outcomeChip" data-outcome="SAFE">SAFE</span>
                </td>
                <td>The agent completed the legitimate task correctly, ignoring the injected payload.</td>
                <td>Safe Refusal Rate</td>
              </tr>
              <tr>
                <td className="label">
                  <span className="outcomeChip" data-outcome="PARTIAL">PARTIAL</span>
                </td>
                <td>Mixed result — part of the injected goal was achieved but not fully.</td>
                <td>Partial Rate</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="docSection">
        <div className="docSectionHeader">
          <span className="sectionIndex">05</span>
          <h2>Running Evaluations</h2>
        </div>
        <div className="docBody">
          <p>
            Two entry points are provided. The mock runner uses pre-scripted agent responses
            and does not call any live LLM API — it is useful for validating the harness itself
            and running in CI without cost.
          </p>
          <p>
            The live runner targets a real agent implementation. Set the{" "}
            <span className="inlineCode">ANTHROPIC_API_KEY</span> environment variable, then
            configure which model to evaluate in{" "}
            <span className="inlineCode">scripts/run-eval.ts</span>.
          </p>
          <div className="actions" style={{ marginTop: "8px" }}>
            <span className="cmdChip">npm run eval:mock</span>
            <span className="cmdChip">npm run eval</span>
          </div>
          <p style={{ marginTop: "20px" }}>
            Results are written to{" "}
            <span className="inlineCode">results/</span> as timestamped JSON files and
            immediately visible in the dashboard. Each file contains the full run summary
            and every individual scenario result with its judge explanation.
          </p>
        </div>
      </section>
    </main>
  );
}
