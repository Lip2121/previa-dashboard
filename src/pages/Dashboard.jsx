import { useOutletContext } from "react-router-dom";
import KpiStrip from "../components/overview/KpiStrip";
import DecisionInsight from "../components/overview/DecisionInsight";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
} from "recharts";

function getBalanceAtDate(data, date, key) {
  const row = data.find((d) => d.date === date);
  return row ? row[key] : null;
}

export default function Dashboard() {
  const {
    baselineResult,
    scenarioResult,
    outflowShiftDays,
    openingBalance,
    setOpeningBalance,
    horizonDays,
    setHorizonDays,
    baselineWindowDays,
    setBaselineWindowDays,
    warningThreshold,
    setWarningThreshold,
    setFile,
    chartData,
    scenarioForecast,
    firstWarning,
    firstNegative,
    scenarioFirstNegative,
  } = useOutletContext();

  return (
    <>
      {(baselineResult || scenarioResult) && (
        <div style={{ marginBottom: 16 }}>
          <KpiStrip baselineResult={baselineResult} scenarioResult={scenarioResult} />
        </div>
      )}

      <div className="card cardPad" style={{ marginBottom: 16 }}>
        <div className="cardTitle">Inputs</div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 12,
            maxWidth: 900,
          }}
        >
          <label>
            <div style={{ fontSize: 12, opacity: 0.75 }}>Opening balance</div>
            <input
              type="number"
              value={openingBalance}
              onChange={(e) => setOpeningBalance(Number(e.target.value))}
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
            <div style={{ fontSize: 12, opacity: 0.75 }}>Baseline window days</div>
            <input
              type="number"
              value={baselineWindowDays}
              onChange={(e) => setBaselineWindowDays(Number(e.target.value))}
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

          <div />
        </div>
      </div>

      <div className="card cardPad" style={{ marginBottom: 16 }}>
        <div className="cardTitle">Upload</div>

        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <span style={{ color: "#64748b", fontSize: 13 }}>
            Upload a CSV with <code>date</code> and <code>amount</code>.
          </span>
        </div>
      </div>

      {(baselineResult || scenarioResult) && (
        <div className="grid2" style={{ marginTop: 16 }}>
          <div className="card cardPad">
            <div className="cardTitle">Cash flow outlook</div>

            <div style={{ width: "100%", height: 380 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />

                  {Number.isFinite(Number(warningThreshold)) && (
                    <ReferenceLine y={Number(warningThreshold)} strokeDasharray="2 6" />
                  )}

                  <Line
                    type="monotone"
                    dataKey="balance_baseline"
                    name="Baseline balance"
                    dot={false}
                    strokeWidth={2}
                  />

                  {scenarioForecast && (
                    <Line
                      type="monotone"
                      dataKey="balance_scenario"
                      name="Scenario balance"
                      dot={false}
                      strokeWidth={2}
                    />
                  )}

                  {firstWarning && <ReferenceLine x={firstWarning} strokeDasharray="5 5" />}
                  {firstNegative && <ReferenceLine x={firstNegative} strokeDasharray="2 2" />}

                  {scenarioFirstNegative && outflowShiftDays > 0 && (
                    <ReferenceLine x={scenarioFirstNegative} strokeDasharray="1 4" />
                  )}

                  {firstNegative && (
                    <ReferenceDot
                      x={firstNegative}
                      y={getBalanceAtDate(chartData, firstNegative, "balance_baseline")}
                      r={6}
                      fill="#0f172a"
                      stroke="none"
                    />
                  )}

                  {scenarioFirstNegative && outflowShiftDays > 0 && (
                    <ReferenceDot
                      x={scenarioFirstNegative}
                      y={getBalanceAtDate(chartData, scenarioFirstNegative, "balance_scenario")}
                      r={6}
                      fill="#0f172a"
                      stroke="none"
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <DecisionInsight
            summary={baselineResult?.summary}
            decisionImpact={baselineResult?.decision_impact}
          />
        </div>
      )}
    </>
  );
}