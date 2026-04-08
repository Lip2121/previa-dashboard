import React, { useMemo } from "react";

function formatCurrency(n, currency = "USD") {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";

  const abs = Math.abs(n);
  const formatted = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    currencyDisplay: "symbol",
    maximumFractionDigits: 0,
  }).format(abs);

  return n < 0 ? `-${formatted}` : formatted;
}

function formatDate(d) {
  if (!d) return "—";
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function clampLabel(label) {
  return label?.length > 26 ? label.slice(0, 25) + "…" : label;
}

function DeltaPill({ value, prefix = "", suffix = "" }) {
  if (value === null || value === undefined || Number.isNaN(value)) return null;

  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  const abs = Math.abs(value);
  const isPos = value > 0;
  const isNeg = value < 0;

  return (
    <span
      className={[
        "kpi-pill",
        isPos ? "kpi-pill--pos" : "",
        isNeg ? "kpi-pill--neg" : "",
      ].join(" ")}
      title={`${prefix}${value}${suffix}`}
    >
      {sign}
      {prefix}
      {abs}
      {suffix}
    </span>
  );
}

function KpiCard({ label, value, sub, delta, deltaKind }) {
  return (
    <div className="kpi-card">
      <div className="kpi-top">
        <div className="kpi-label" title={label}>
          {clampLabel(label)}
        </div>

        {deltaKind === "currency" && <DeltaPill value={delta} prefix="$" />}
        {deltaKind === "days" && <DeltaPill value={delta} suffix="d" />}
        {deltaKind === "date" && (delta ? <span className="kpi-pill">{delta}</span> : null)}
        {deltaKind === "pct" && <DeltaPill value={delta} suffix="%" />}
      </div>

      <div className="kpi-value">{value}</div>
      {sub ? <div className="kpi-sub">{sub}</div> : <div className="kpi-sub kpi-sub--empty"> </div>}
    </div>
  );
}

function pickLowest(series) {
  if (!Array.isArray(series) || series.length === 0) return null;
  return series.reduce((acc, p) => (acc === null || p.balance < acc.balance ? p : acc), null);
}

export default function KpiStrip({ baselineResult, scenarioResult }) {
  const metrics = useMemo(() => {
    const base = baselineResult?.forecast;
    const scen = scenarioResult?.forecast;

    if (!base?.series?.length) return null;

    const baseSeries = base.series;
    const scenSeries = scen?.series || [];

    const currency = base.currency || "USD";

    const currentBalance = baseSeries[baseSeries.length - 1]?.balance ?? null;

    const lowestBase = pickLowest(baseSeries);
    const lowestBalance = lowestBase?.balance ?? null;
    const lowestBalanceDate = lowestBase?.date ?? null;

    const firstWarningDate = base.first_warning_date ?? null;
    const firstNegativeDate = base.first_negative_date ?? null;

    const runwayDays =
      firstNegativeDate && baseSeries.length
        ? Math.max(
            0,
            Math.round(
              (new Date(firstNegativeDate) - new Date(baseSeries[0].date)) /
                (1000 * 60 * 60 * 24)
            )
          )
        : null;

    let deltaLowestBalance = null;
    let deltaRunwayDays = null;
    let deltaFirstNegativeDateLabel = null;

    if (scen?.series?.length) {
      const lowestScen = pickLowest(scenSeries);
      const scenLowestBalance = lowestScen?.balance ?? null;

      if (lowestBalance != null && scenLowestBalance != null) {
        deltaLowestBalance = Math.round(scenLowestBalance - lowestBalance);
      }

      const scenFirstNeg = scen.first_negative_date ?? null;

      if (firstNegativeDate && scenFirstNeg) {
        const diffDays = Math.round(
          (new Date(scenFirstNeg) - new Date(firstNegativeDate)) /
            (1000 * 60 * 60 * 24)
        );
        deltaFirstNegativeDateLabel = `${diffDays >= 0 ? "+" : ""}${diffDays}d`;
        deltaRunwayDays = diffDays;
      }
    }

    const baseRiskScore =
      typeof base?.risk?.score === "number" ? base.risk.score : null;
    const baseRiskLevel = base?.risk?.level || null;

    const scenRiskScore =
      typeof scen?.risk?.score === "number" ? scen.risk.score : null;

    const deltaRiskScore =
      baseRiskScore != null && scenRiskScore != null
        ? Math.round(scenRiskScore - baseRiskScore)
        : null;

    const baseProb =
      typeof base?.liquidity_failure?.probability === "number"
        ? base.liquidity_failure.probability
        : null;

    const baseProbError = base?.liquidity_failure?.error || null;

    const scenProb =
      typeof scen?.liquidity_failure?.probability === "number"
        ? scen.liquidity_failure.probability
        : null;

    const deltaProbPct =
      baseProb != null && scenProb != null
        ? Math.round((scenProb - baseProb) * 100)
        : null;

    return {
      currency,
      currentBalance,
      lowestBalance,
      lowestBalanceDate,
      firstWarningDate,
      firstNegativeDate,
      runwayDays,
      scenario: {
        deltaLowestBalance,
        deltaRunwayDays,
        deltaFirstNegativeDateLabel,
      },
      risk: {
        score: baseRiskScore,
        level: baseRiskLevel,
        deltaScore: deltaRiskScore,
      },
      failure: {
        prob: baseProb,
        deltaProbPct,
        error: baseProbError,
      },
    };
  }, [baselineResult, scenarioResult]);

  if (!metrics) return null;

  const current = formatCurrency(metrics.currentBalance, metrics.currency);
  const lowest = formatCurrency(metrics.lowestBalance, metrics.currency);

  const lowestSub = metrics.lowestBalanceDate ? `on ${formatDate(metrics.lowestBalanceDate)}` : "—";
  const warn = metrics.firstWarningDate ? formatDate(metrics.firstWarningDate) : "No warning";
  const neg = metrics.firstNegativeDate ? formatDate(metrics.firstNegativeDate) : "No breach";

  const runway =
    metrics.runwayDays != null
      ? `${metrics.runwayDays} day${metrics.runwayDays === 1 ? "" : "s"}`
      : "No breach";

  const riskValue = metrics.risk?.score != null ? `${metrics.risk.score}` : "—";
  const riskSub = metrics.risk?.level ? `Risk level: ${metrics.risk.level}` : "—";

  const failPct =
    metrics.failure?.prob != null
      ? `${Math.round(metrics.failure.prob * 100)}%`
      : "—";

  const failSub =
    metrics.failure?.prob != null
      ? "Chance cash goes negative"
      : metrics.failure?.error
      ? "Need more history"
      : "Chance cash goes negative";

  const sc = metrics.scenario || {};

  return (
    <div className="kpi-strip">
      <KpiCard label="Current cash" value={current} sub="Latest balance" />

      <KpiCard
        label="Lowest projected"
        value={lowest}
        sub={lowestSub}
        delta={sc.deltaLowestBalance}
        deltaKind="currency"
      />

      <KpiCard label="First warning" value={warn} sub="Crosses warning threshold" />

      <KpiCard
        label="First negative"
        value={neg}
        sub="Crosses below 0"
        delta={sc.deltaFirstNegativeDateLabel}
        deltaKind="date"
      />

      <KpiCard
        label="Runway"
        value={runway}
        sub="Until negative"
        delta={sc.deltaRunwayDays}
        deltaKind="days"
      />

      <KpiCard
        label="Liquidity risk"
        value={riskValue}
        sub={riskSub}
        delta={metrics.risk?.deltaScore}
      />

      <KpiCard
        label="Failure probability"
        value={failPct}
        sub={failSub}
        delta={metrics.failure?.deltaProbPct}
        deltaKind="pct"
      />
    </div>
  );
}