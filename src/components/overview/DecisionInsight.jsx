import React from "react";

function getFailureMessage(probability) {
  if (typeof probability !== "number") return null;

  const pct = Math.round(probability * 100);

  if (pct < 10) {
    return `Simulated outcomes indicate limited downside risk, with only a ${pct}% probability of liquidity failure within the forecast horizon.`;
  }

  if (pct < 30) {
    return `Simulated outcomes indicate moderate downside risk, with a ${pct}% probability of liquidity failure within the forecast horizon.`;
  }

  if (pct < 50) {
    return `Although the baseline forecast remains stable, simulated outcomes show meaningful downside risk, with a ${pct}% probability of liquidity failure within the forecast horizon.`;
  }

  return `Despite a stable baseline forecast, simulated outcomes indicate elevated downside risk, with a ${pct}% probability of liquidity failure within the forecast horizon.`;
}

function getAdaptiveHeadline(summaryHeadline, failureProbability) {
  if (!summaryHeadline) return null;
  if (typeof failureProbability !== "number") return summaryHeadline;

  const pct = Math.round(failureProbability * 100);
  const normalized = summaryHeadline.toLowerCase();

  const isSafeBaseline =
    normalized.includes("no immediate liquidity risk detected") ||
    normalized.includes("does not turn negative") ||
    normalized.includes("cash is already below warning threshold") === false &&
    normalized.includes("cash turns negative") === false;

  if (!isSafeBaseline) return summaryHeadline;

  if (pct < 10) {
    return "Baseline remains stable";
  }

  if (pct < 30) {
    return "Stable baseline, with moderate downside risk";
  }

  if (pct < 50) {
    return "Baseline remains stable, but downside risk persists";
  }

  return "Stable baseline, but elevated downside risk";
}

export default function DecisionInsight({
  summary,
  decisionImpact,
  failureProbability,
}) {
  const headline = getAdaptiveHeadline(summary?.headline, failureProbability);
  const details = summary?.details;
  const suggestions = summary?.suggestions || [];

  const failureMessage = getFailureMessage(failureProbability);

  return (
    <div className="card cardPad">
      <div className="cardTitle">Decision insight</div>

      {headline ? (
        <>
          <div className="insightHeadline">{headline}</div>

          {details && <div className="insightDetails">{details}</div>}

          {failureMessage && (
            <div className="insightImpactBox">
              <div className="insightImpactTitle">Failure probability</div>
              <div className="insightImpactText">{failureMessage}</div>
            </div>
          )}

          {suggestions.length > 0 && (
            <ul className="insightSuggestions">
              {suggestions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          )}

          {decisionImpact && (
            <div className="insightImpactBox">
              <div className="insightImpactTitle">Scenario impact</div>
              <div className="insightImpactText">{decisionImpact}</div>
            </div>
          )}
        </>
      ) : (
        <div className="muted">Run a forecast to generate an executive summary.</div>
      )}
    </div>
  );
}