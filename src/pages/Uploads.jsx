import { useOutletContext, useNavigate } from "react-router-dom";

export default function Uploads() {
  const { setFile, file, baselineResult, scenarioResult } = useOutletContext();
  const navigate = useNavigate();

  return (
    <>
      <div className="card cardPad" style={{ marginBottom: 16 }}>
        <div className="cardTitle">Upload CSV</div>

        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <span style={{ color: "#64748b", fontSize: 13 }}>
            CSV must include <code>date</code> and <code>amount</code>.
          </span>
        </div>

        <div style={{ marginTop: 10, color: "rgba(255,255,255,.7)", fontSize: 13 }}>
          Selected file: <strong>{file?.name || "None"}</strong>
        </div>
      </div>

      <div className="card cardPad">
        <div className="cardTitle">Next</div>
        <div style={{ color: "rgba(255,255,255,.7)", fontSize: 13, marginBottom: 10 }}>
          Use the header button to run forecasts. Results will show on the Dashboard.
        </div>

        <button className="btn" onClick={() => navigate("/dashboard")}>
          Go to Dashboard
        </button>

        {(baselineResult || scenarioResult) && (
          <div style={{ marginTop: 10, color: "rgba(255,255,255,.65)", fontSize: 13 }}>
            You already have results loaded — head to Dashboard to view them.
          </div>
        )}
      </div>
    </>
  );
} 