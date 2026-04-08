import { useOutletContext } from "react-router-dom";

export default function Settings() {
  const {
    openingBalance,
    setOpeningBalance,
    horizonDays,
    setHorizonDays,
    baselineWindowDays,
    setBaselineWindowDays,
    warningThreshold,
    setWarningThreshold,
  } = useOutletContext();

  return (
    <div className="card cardPad">
      <div className="cardTitle">Defaults</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, maxWidth: 900 }}>
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
          <div style={{ fontSize: 12, opacity: 0.75 }}>Baseline window</div>
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
      </div>

      <div style={{ marginTop: 12, color: "rgba(255,255,255,.6)", fontSize: 13 }}>
        These values affect the next forecast run.
      </div>
    </div>
  );
} 