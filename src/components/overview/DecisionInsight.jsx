import React from "react";

export default function DecisionInsight({ summary, decisionImpact }) {
  const headline = summary?.headline;
  const details = summary?.details;
  const suggestions = summary?.suggestions || [];

  return (
    <div className="card cardPad">
      <div className="cardTitle">Decision insight</div>

      {headline ? (
        <>
          <div className="insightHeadline">{headline}</div>

          {details && (
            <div className="insightDetails">
              {details}
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
        <div className="muted">
          Run a forecast to generate an executive summary.
        </div>
      )}
    </div>
  );
}