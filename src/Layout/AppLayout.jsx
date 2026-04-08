import { useMemo, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8010";

function pageTitle(pathname) {
  if (pathname.startsWith("/scenarios")) return "Scenarios";
  if (pathname.startsWith("/uploads")) return "Uploads";
  if (pathname.startsWith("/settings")) return "Settings";
  return "Cash Flow Risk Dashboard";
}

export default function AppLayout() {
  const location = useLocation();

  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("Waiting for data");
  const [baselineResult, setBaselineResult] = useState(null);
  const [scenarioResult, setScenarioResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  // Inputs
  const [openingBalance, setOpeningBalance] = useState(0);
  const [horizonDays, setHorizonDays] = useState(30);
  const [baselineWindowDays, setBaselineWindowDays] = useState(30);
  const [warningThreshold, setWarningThreshold] = useState(150);

  // Scenario control
  const [outflowShiftDays, setOutflowShiftDays] = useState(0);

  async function runForecast() {
    if (!file) {
      alert("Please select a CSV file");
      return;
    }

    async function fetchForecast(shiftDays) {
      const qs = new URLSearchParams({
        opening_balance: String(openingBalance),
        horizon_days: String(horizonDays),
        baseline_window_days: String(baselineWindowDays),
        outflow_shift_days: String(shiftDays),
        warning_threshold: String(warningThreshold),
      });

      const formData = new FormData();
      formData.append("file", file);

      const url = `${API_BASE}/upload-csv-forecast?${qs.toString()}`;
      const res = await fetch(url, { method: "POST", body: formData });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Backend ${res.status}: ${text.slice(0, 200)}`);
      }

      return res.json();
    }

    try {
      setIsRunning(true);

      // 1) baseline always
      setStatus("Running baseline...");
      const baselineData = await fetchForecast(0);
      setBaselineResult(baselineData);

      // clear old scenario (prevents stale comparisons)
      setScenarioResult(null);

      // 2) scenario if requested
      const shift = Number(outflowShiftDays) || 0;
      if (shift > 0) {
        setStatus(`Running scenario (shift ${shift}d)...`);
        const scenarioData = await fetchForecast(shift);
        setScenarioResult(scenarioData);
      }

      setStatus("Forecast completed");
    } catch (error) {
      console.error("Fetch error:", error);
      setStatus(`Error: ${error?.message || String(error)}`);
    } finally {
      setIsRunning(false);
    }
  }

  const baselineForecast = baselineResult?.forecast ?? null;
  const scenarioForecast = scenarioResult?.forecast ?? null;

  const firstNegative = baselineForecast?.first_negative_date || null;
  const firstWarning = baselineForecast?.first_warning_date || null;
  const scenarioFirstNegative = scenarioForecast?.first_negative_date || null;

  const chartData = useMemo(() => {
    const baseSeries = baselineForecast?.series || [];
    const scenSeries = scenarioForecast?.series || [];
    const scenByDate = new Map(scenSeries.map((d) => [d.date, d.balance]));

    return baseSeries.map((d) => ({
      date: d.date,
      balance_baseline: d.balance,
      balance_scenario: scenByDate.get(d.date) ?? null,
    }));
  }, [baselineForecast, scenarioForecast]);

  const outletContext = {
    // data
    file,
    status,
    baselineResult,
    scenarioResult,
    isRunning,

    // inputs + setters
    openingBalance,
    setOpeningBalance,
    horizonDays,
    setHorizonDays,
    baselineWindowDays,
    setBaselineWindowDays,
    warningThreshold,
    setWarningThreshold,

    // scenario + setters
    outflowShiftDays,
    setOutflowShiftDays,

    // actions
    setFile,
    runForecast,

    // derived
    baselineForecast,
    scenarioForecast,
    firstNegative,
    firstWarning,
    scenarioFirstNegative,
    chartData,
  };

  return (
    <div className="shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brandMark">P</div>
          <div>
            <div className="brandName">Previa</div>
            <small style={{ color: "rgba(255,255,255,.55)" }}>Cash Flow Risk</small>
          </div>
        </div>

       <nav className="nav">
  <NavLink to="/dashboard" className={({ isActive }) => `navItem ${isActive ? "navItemActive" : ""}`}>
    Dashboard <small>Risk overview</small>
  </NavLink>

  <NavLink to="/scenarios" className={({ isActive }) => `navItem ${isActive ? "navItemActive" : ""}`}>
    Scenarios <small>What-if</small>
  </NavLink>

  <NavLink to="/uploads" className={({ isActive }) => `navItem ${isActive ? "navItemActive" : ""}`}>
    Uploads <small>Data</small>
  </NavLink>

  <NavLink to="/settings" className={({ isActive }) => `navItem ${isActive ? "navItemActive" : ""}`}>
    Settings <small>Prefs</small>
  </NavLink>
</nav> 
      </aside>

      {/* Main */}
      <div className="main">
        <header className="header">
          <div className="headerTitle">
            <strong>{pageTitle(location.pathname)}</strong>
            <span>{status}</span>
          </div>

          <div className="headerRight">
            <span className="badge">
              Scenario shift: <strong>{outflowShiftDays}d</strong>
            </span>
            <button className="btn" onClick={runForecast} disabled={isRunning}>
              {isRunning ? "Running..." : "Run forecast"}
            </button>
          </div>
        </header>

        <main className="content">
          <Outlet context={outletContext} />
        </main>
      </div>
    </div>
  );
} 