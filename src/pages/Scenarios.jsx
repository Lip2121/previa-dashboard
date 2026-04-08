import { useOutletContext } from "react-router-dom";
import KpiStrip from "../components/overview/KpiStrip";
import DecisionInsight from "../components/overview/DecisionInsight";

export default function Scenarios() {
  const {
    baselineResult,
    scenarioResult,
    outflowShiftDays,
    setOutflowShiftDays,
    warningThreshold,
    setWarningThreshold,
    horizonDays,
    setHorizonDays,
    baselineWindowDays,
    setBaselineWindowDays,
  } = useOutletContext();

  return (
    <>
      <div className="card cardPad" style={{ marginBottom: 16 }}>
        <div className="cardTitle">Scenario controls</div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12,
            maxWidth: 900,
          }}
        >
          <label>
            <div style={{ fontSize: 12, opacity: 0.75 }}>Outflow shift days</div>
            <input
              type="number"
              min="0"
              value={outflowShiftDays}
              onChange={(e) => setOutflowShiftDays(Number(e.target.value))}
            />
          </label>

          <label>
            <div style={{ fontSize: 12, opacity: 0.75 }}>Warning threshold</div>
            <input
              type="number"
              value={warningThreshold}
              onChange={(e) => setWarningThreshold(Number(e.target.value))}
            />
          </label>

          <label>
            <div style={{ fontSize: 12, opacity: 0.75 }}>Horizon days</div>
            <input
              type="number"
              value={horizonDays}
              onChange={(e) => setHorizonDays(Number(e.target.value))}
            />
          </label>

          <label>
            <div style={{ fontSize: 12, opacity: 0.75 }}>Baseline window</div>
            <input
              type="number"
              value={baselineWindowDays}
              onChange={(e) => setBaselineWindowDays(Number(e.target.value))}
            />
          </label>
        </div>

        <div style={{ marginTop: 10, color: "rgba(255,255,255,.6)", fontSize: 13 }}>
          Tip: Set a shift & click <strong>Run forecast</strong> in the header to generate a scenario.
        </div>
      </div>

      {baselineResult || scenarioResult ? (
        <>
          <div style={{ marginBottom: 16 }}>
            <KpiStrip baselineResult={baselineResult} scenarioResult={scenarioResult} />
          </div>

          <DecisionInsight
            summary={baselineResult?.summary}
            decisionImpact={baselineResult?.decision_impact}
          />
        </>
      ) : (
        <div className="card cardPad">
          <div className="cardTitle">No results yet</div>
          Upload a CSV and run a forecast first.
        </div>
      )}
    </>
  );
}