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

function formatChartDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
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
                <LineChart
                  data={chartData}
                  margin={{ top: 12, right: 16, left: 8, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />

                  <XAxis
  dataKey="date"
  tickFormatter={formatChartDate}
  interval={6}
  tick={{ fill: "#94a3b8", fontSize: 12 }}
  axisLine={{ stroke: "rgba(148,163,184,0.22)" }}
  tickLine={false}
/>

                  <YAxis
  tickFormatter={(value) => {
    if (Math.abs(value) >= 1000) return `${Math.round(value / 1000)}k`;
    return `${value}`;
  }}
  tick={{ fill: "#94a3b8", fontSize: 12 }}
  axisLine={{ stroke: "rgba(148,163,184,0.22)" }}
  tickLine={false}
  width={44}
/>

                  <Tooltip
                    labelFormatter={(value) => formatChartDate(value)}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      border: "1px solid rgba(148,163,184,0.18)",
                      borderRadius: "12px",
                      color: "#e2e8f0",
                    }}
                    labelStyle={{ color: "#cbd5e1", fontWeight: 600 }}
                  />

                  <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />

                  {Number.isFinite(Number(warningThreshold)) && (
                    <ReferenceLine
                      y={Number(warningThreshold)}
                      stroke="rgba(245,158,11,0.8)"
                      strokeDasharray="4 4"
                    />
                  )}

                  <Line
                    type="monotone"
                    dataKey="balance_baseline"
                    name="Baseline balance"
                    dot={false}
                    strokeWidth={2.5}
                    stroke="#38bdf8"
                  />

                  {scenarioForecast && (
                    <Line
                      type="monotone"
                      dataKey="balance_scenario"
                      name="Scenario balance"
                      dot={false}
                      strokeWidth={2.5}
                      stroke="#22c55e"
                    />
                  )}

                  {firstWarning && (
                    <ReferenceLine
                      x={firstWarning}
                      stroke="rgba(245,158,11,0.8)"
                      strokeDasharray="5 5"
                    />
                  )}

                  {firstNegative && (
                    <ReferenceLine
                      x={firstNegative}
                      stroke="rgba(239,68,68,0.8)"
                      strokeDasharray="3 3"
                    />
                  )}

                  {scenarioFirstNegative && outflowShiftDays > 0 && (
                    <ReferenceLine
                      x={scenarioFirstNegative}
                      stroke="rgba(34,197,94,0.8)"
                      strokeDasharray="3 5"
                    />
                  )}

                  {firstNegative && (
                    <ReferenceDot
                      x={firstNegative}
                      y={getBalanceAtDate(chartData, firstNegative, "balance_baseline")}
                      r={5}
                      fill="#ef4444"
                      stroke="none"
                    />
                  )}

                  {scenarioFirstNegative && outflowShiftDays > 0 && (
                    <ReferenceDot
                      x={scenarioFirstNegative}
                      y={getBalanceAtDate(chartData, scenarioFirstNegative, "balance_scenario")}
                      r={5}
                      fill="#22c55e"
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
            failureProbability={baselineResult?.forecast?.liquidity_failure?.probability}
          />
        </div>
      )}
    </>
  );
}