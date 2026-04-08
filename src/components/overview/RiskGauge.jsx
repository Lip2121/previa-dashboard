import React from "react";

function getRiskColor(score) {
  if (score >= 80) return "#22c55e";
  if (score >= 50) return "#f59e0b";
  if (score >= 20) return "#f97316";
  return "#ef4444";
}

export default function RiskGauge({ risk }) {
  const score =
    typeof risk?.score === "number"
      ? risk.score
      : typeof risk?.liquidity_score === "number"
      ? risk.liquidity_score
      : null;

  const level = risk?.level || risk?.risk_level || "—";

  if (score === null) return null;

  const color = getRiskColor(score);

  return (
    <div className="card cardPad">
      <div className="cardTitle">Liquidity Risk</div>

      <div
        style={{
          minHeight: 140,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 52,
            fontWeight: 700,
            lineHeight: 1,
            color,
            marginTop: 8,
          }}
        >
          {score}
        </div>

        <div
          style={{
            marginTop: 10,
            fontSize: 18,
            fontWeight: 600,
            color,
          }}
        >
          {level}
        </div>

        <div
          style={{
            marginTop: 8,
            fontSize: 15,
            color: "#94a3b8",
          }}
        >
          Risk score out of 100
        </div>
      </div>
    </div>
  );
}