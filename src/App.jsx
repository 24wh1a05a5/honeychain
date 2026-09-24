import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Blocks,
  Check,
  ChevronRight,
  CircleAlert,
  Cloud,
  Cpu,
  Database,
  Droplets,
  Fingerprint,
  Hexagon,
  Leaf,
  LineChart,
  Menu,
  PackageCheck,
  QrCode,
  ScanLine,
  ShieldCheck,
  Thermometer,
  UserRound,
  Weight,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { QRCodeSVG } from "qrcode.react";
import jsQR from "jsqr";
import QRCode from "qrcode";

const api = async (path, options) => {
  const response = await fetch(path, options);
  if (!response.ok) throw new Error("API request failed");
  return response.json();
};

const getLocalNetworkUrl = () => {
  const envUrl = import.meta.env.VITE_PUBLIC_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");

  const fallback = window.location.origin;
  if (fallback && !fallback.includes("localhost") && !fallback.includes("127.0.0.1")) {
    return fallback.replace(/\/$/, "");
  }

  const wifiCandidates = [
    "192.168.0.1",
    "192.168.1.1",
    "10.0.0.1",
    "10.0.2.2",
    "172.16.0.1",
  ];

  const host = window.location.hostname;
  if (host && host !== "localhost" && host !== "127.0.0.1") {
    return `http://${host}:5173`;
  }

  const activeIp = window.location.ancestorOrigins?.length
    ? ""
    : "";

  return activeIp || fallback.replace(/\/$/, "");
};

const getPublicBaseUrl = () => getLocalNetworkUrl();

function Logo() {
  return (
    <div className="logo">
      <div className="logo-mark">
        <Hexagon size={19} />
      </div>
      <span>
        Honey<span>Chain</span>
      </span>
    </div>
  );
}

function Button({ children, onClick, secondary = false, className = "" }) {
  return (
    <button
      className={`button ${secondary ? "button-secondary" : ""} ${className}`}
      onClick={onClick}
    >
      {children}
      <ArrowRight size={16} />
    </button>
  );
}
function Badge({ children, tone = "green" }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

async function downloadCertificate(batch) {
  if (!batch) return;

  const verificationUrl = `${getPublicBaseUrl()}/verify/${batch.batchId}`;
  const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
    width: 220,
    margin: 2,
    errorCorrectionLevel: "M",
  });

  const html = `
    <!doctype html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>HoneyChain Certificate - ${batch.batchId || "Batch"}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background: #f7f3e8;
            margin: 0;
            padding: 40px;
            color: #1f2a1f;
          }
          .card {
            max-width: 760px;
            margin: 0 auto;
            background: #fffdf9;
            border: 2px solid #d9b46f;
            border-radius: 18px;
            padding: 32px;
            box-shadow: 0 10px 30px rgba(74, 54, 18, 0.1);
          }
          .logo { font-size: 28px; font-weight: 700; letter-spacing: 0.04em; }
          .logo span { color: #b7841f; }
          h1 { margin: 20px 0 10px; font-size: 34px; }
          .meta { display: grid; grid-template-columns: repeat(2, minmax(180px, 1fr)); gap: 18px; margin-top: 26px; }
          .item { background: #faf4e6; border-radius: 12px; padding: 14px 16px; }
          .label { display: block; color: #6a685d; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
          .value { font-size: 22px; font-weight: 700; }
          .status {
            display: inline-block; margin-top: 24px; padding: 10px 18px; border-radius: 999px;
            background: #eaf7ee; color: #227a3a; font-weight: 700;
          }
          .small { margin-top: 24px; color: #615f5a; font-size: 14px; }
          .qr { margin-top: 28px; text-align: center; }
          .qr img { width: 220px; height: 220px; border: 1px solid #e4dcc9; padding: 10px; background: #fff; }
          .qr p { margin: 10px 0 0; color: #615f5a; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="logo">Honey<span>Chain</span></div>
          <h1>Certificate of Authenticity</h1>
          <p>This certifies that the honey batch below has been verified and tracked through the HoneyChain traceability system.</p>
          <div class="meta">
            <div class="item"><span class="label">Batch ID</span><div class="value">${batch.batchId || "N/A"}</div></div>
            <div class="item"><span class="label">Honey Type</span><div class="value">${batch.honeyType || "N/A"}</div></div>
            <div class="item"><span class="label">Producer</span><div class="value">${batch.producer || "N/A"}</div></div>
            <div class="item"><span class="label">Origin</span><div class="value">${batch.origin || "N/A"}</div></div>
            <div class="item"><span class="label">Purity</span><div class="value">${batch.purity || "Not provided"}</div></div>
            <div class="item"><span class="label">Verification</span><div class="value">${batch.verificationStatus || (batch.verified ? "Verified" : "Not verified")}</div></div>
          </div>
          <div class="status">${batch.verificationStatus || (batch.verified ? "Verified" : "Not verified")}</div>
          <div class="qr">
            <img src="${qrDataUrl}" alt="QR code for ${batch.batchId || "batch"}" />
            <p>Scan to verify this batch</p>
          </div>
          <div class="small">Blockchain record: ${batch.blockchain || "Local demo record"}</div>
        </div>
      </body>
    </html>
  `;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `honeychain-certificate-${batch.batchId || "batch"}.html`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function Nav({ page, setPage, user, onLogout }) {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  return (
    <header className="nav">
      <div className="nav-inner">
        <button className="brand-button" onClick={() => setPage("home")}>
          <Logo />
        </button>
        <button className="mobile-menu" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
        <nav className={open ? "nav-links open" : "nav-links"}>
          {[
            ["home", "Overview"],
            ["dashboard", "Dashboard"],
            ["traceability", "Traceability"],
            ["verify", "Verify product"],
          ].map(([id, label]) => (
            <button
              key={id}
              className={page === id ? "active" : ""}
              onClick={() => {
                setPage(id);
                setOpen(false);
                setProfileOpen(false);
              }}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="nav-actions">
          <span className="network-pill">
            <span className="live-dot" /> Local network
          </span>
          <div className="profile-menu">
            <button
              className="avatar"
              aria-label="Open profile"
              aria-expanded={profileOpen}
              onClick={() => setProfileOpen(!profileOpen)}
            >
              <UserRound size={17} />
            </button>
            {profileOpen && (
              <div className="profile-popover">
                <div className="profile-heading">
                  <div className="profile-avatar">
                    <UserRound size={18} />
                  </div>
                  <div>
                    <strong>{user.name}</strong>
                    <span>{user.role}</span>
                  </div>
                </div>
                <div className="profile-status">
                  <span className="live-dot" /> Signed in on local network
                </div>
                <button className="profile-action" onClick={onLogout}>
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function Home({ setPage }) {
  const [scoopOpen, setScoopOpen] = useState(false);
  const ownerName = JSON.parse(
    localStorage.getItem("honeychain-user") || '{"name":"Maya Farms"}'
  ).name;
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-line" /> TRUST INFRASTRUCTURE FOR HONEY
          </div>
          <h1>
            Every jar has
            <br />
            <em>a story.</em>
          </h1>
          <p className="hero-sub">
            HoneyChain turns every harvest into a trusted, transparent journey —
            from hive to home.
          </p>
          <div className="hero-actions">
            <Button onClick={() => setPage("verify")}>Verify a product</Button>
            <button
              className="text-button"
              onClick={() => setPage("dashboard")}
            >
              Explore dashboard <ChevronRight size={17} />
            </button>
          </div>
          <div className="hero-note">
            <div className="avatar-stack">
              <span>MF</span>
              <span>AK</span>
              <span>RC</span>
            </div>
            <span>
              Trusted by <b>240+ beekeepers</b> building better harvests
            </span>
          </div>
        </div>
        <div className="hero-visual">
          <div className="visual-orbit orbit-one" />
          <div className="visual-orbit orbit-two" />
          <button
            className={`jar-graphic ${scoopOpen ? "scoop-open" : ""}`}
            aria-label="Show honey thickness"
            onClick={() => setScoopOpen(!scoopOpen)}
          >
            <div className="jar-lid">
              <span>RAW / 2026</span>
            </div>
            <div className="jar-neck" />
            <div className="jar-body">
              <div className="jar-honey" />
              <div className="jar-label">
                <small>{ownerName.toUpperCase()}</small>
                <strong>HONEY</strong>
                <span>Wildflower harvest</span>
                <i>HC</i>
              </div>
            </div>
            <div className="jar-base" />
            <div className="honey-spoon">
              <span className="spoon-bowl" />
              <span className="spoon-handle" />
              <b>
                THICKNESS
                <br />
                <em>68%</em>
              </b>
            </div>
          </button>
          <div className="data-node node-temp">
            <Thermometer size={17} />
            <span>34.2°C</span>
            <small>Temperature</small>
          </div>
          <div className="data-node node-chain">
            <Blocks size={17} />
            <span>Verified</span>
            <small>Blockchain</small>
          </div>
          <div className="data-node node-weight">
            <Weight size={17} />
            <span>42.8 kg</span>
            <small>Hive weight</small>
          </div>
          <div className="visual-caption">
            <span className="live-dot" /> LIVE SENSOR NETWORK <i>•</i> 03 ACTIVE
            HIVES
          </div>
        </div>
      </section>
      <section className="trust-strip">
        <span>Traceability you can touch</span>
        <div>
          <span>
            <ShieldCheck size={15} /> Tamper evident
          </span>
          <span>
            <Database size={15} /> Data backed
          </span>
          <span>
            <Fingerprint size={15} /> Origin assured
          </span>
        </div>
      </section>
      <section className="section problem-section">
        <div className="section-kicker">WHY HONEYCHAIN</div>
        <div className="split-heading">
          <h2>
            The gap between
            <br />
            <em>trust and truth.</em>
          </h2>
          <p>
            Honey is one of nature's most carefully made foods. Its journey
            should be just as carefully understood. We give every participant
            the clarity to make that happen.
          </p>
        </div>
        <div className="problem-grid">
          <div className="problem-card">
            <span className="number">01</span>
            <CircleAlert />
            <h3>Opaque supply chains</h3>
            <p>
              Origin, processing and handling data gets lost between the hive
              and the shelf.
            </p>
          </div>
          <div className="problem-card">
            <span className="number">02</span>
            <Fingerprint />
            <h3>Trust is hard to verify</h3>
            <p>
              Consumers want authenticity, but have no simple way to check what
              is in their jar.
            </p>
          </div>
          <div className="problem-card accent-card">
            <span className="number">03</span>
            <Activity />
            <h3>Hives need better signals</h3>
            <p>
              Beekeepers need timely insight to protect colony health and
              improve yields.
            </p>
          </div>
        </div>
      </section>
      <section className="section dark-section">
        <div className="section-kicker light">THE HONEYCHAIN SYSTEM</div>
        <div className="split-heading light-heading">
          <h2>
            One connected layer
            <br />
            for <em>every journey.</em>
          </h2>
          <p>
            Sensor data, human expertise and blockchain verification come
            together in a single operating view.
          </p>
        </div>
        <div className="flow">
          <FlowItem icon={<Hexagon />} title="Hive" detail="Living origin" />
          <ArrowRight />
          <FlowItem
            icon={<Cpu />}
            title="IoT sensors"
            detail="Real-time signals"
          />
          <ArrowRight />
          <FlowItem
            icon={<Blocks />}
            title="Blockchain"
            detail="Immutable record"
          />
          <ArrowRight />
          <FlowItem icon={<QrCode />} title="Consumer" detail="Proof in hand" />
        </div>
        <div className="feature-grid">
          <Feature
            icon={<Thermometer />}
            title="Smart hive monitoring"
            text="Know how your hives are doing at a glance with live temperature, humidity, weight and activity signals."
          />
          <Feature
            icon={<QrCode />}
            title="Proof in every package"
            text="One scan opens a complete, human-readable story of where your honey came from."
          />
          <Feature
            icon={<LineChart />}
            title="Insights that move you"
            text="Turn patterns into action with production forecasts, health signals and early warnings."
          />
        </div>
      </section>
      <section className="section architecture-section">
        <div className="section-kicker">DESIGNED FOR THE REAL WORLD</div>
        <div className="architecture-layout">
          <div>
            <h2>
              From hive to home,
              <br />
              <em>without the guesswork.</em>
            </h2>
            <p className="section-lead">
              HoneyChain is the connective tissue between field operations and
              the trust customers expect.
            </p>
            <Button onClick={() => setPage("dashboard")} secondary>
              Open the live dashboard
            </Button>
          </div>
          <div className="architecture-map">
            <div className="map-line" />
            {[
              ["01", "IoT", "Sensor network"],
              ["02", "API", "Cloud backend"],
              ["03", "Ledger", "Blockchain record"],
              ["04", "Scan", "Consumer proof"],
            ].map(([n, title, desc]) => (
              <div className="arch-node" key={n}>
                <span>{n}</span>
                <div>
                  <b>{title}</b>
                  <small>{desc}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="cta-band">
        <div>
          <div className="section-kicker light">
            A BETTER STANDARD FOR HONEY
          </div>
          <h2>
            Make trust part of
            <br />
            <em>the harvest.</em>
          </h2>
        </div>
        <Button onClick={() => setPage("traceability")}>
          Register a batch
        </Button>
      </section>
    </>
  );
}
function FlowItem({ icon, title, detail }) {
  return (
    <div className="flow-item">
      <div className="flow-icon">{icon}</div>
      <b>{title}</b>
      <small>{detail}</small>
    </div>
  );
}
function Feature({ icon, title, text }) {
  return (
    <div className="feature">
      <div className="feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
      <ChevronRight size={18} />
    </div>
  );
}

function Dashboard({ setPage }) {
  const [hives, setHives] = useState([]);
  const [readings, setReadings] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [batches, setBatches] = useState([]);
  const [analytics, setAnalytics] = useState({});
  useEffect(() => {
    Promise.all([
      api("/api/hives"),
      api("/api/sensors/readings"),
      api("/api/alerts"),
      api("/api/batches"),
      api("/api/analytics"),
    ]).then(([h, r, a, b, an]) => {
      setHives(h);
      setReadings(r);
      setAlerts(a);
      setBatches(b);
      setAnalytics(an);
    });
  }, []);
  return (
    <main className="app-page">
      <div className="page-heading">
        <div>
          <div className="section-kicker">OPERATIONS / OVERVIEW</div>
          <h1>Good morning, Maya.</h1>
          <p>Here is the pulse of your apiary today.</p>
        </div>
        <Button onClick={() => setPage("traceability")}>Register batch</Button>
      </div>
      <div className="metrics-grid">
        <Metric
          icon={<Hexagon />}
          label="Total hives"
          value="24"
          note="+2 this season"
        />
        <Metric
          icon={<Activity />}
          label="Active hives"
          value={hives.length || "03"}
          note="All systems online"
          good
        />
        <Metric
          icon={<PackageCheck />}
          label="Honey batches"
          value={batches.length || "18"}
          note="4 this month"
        />
        <Metric
          icon={<Blocks />}
          label="Verified batches"
          value="16"
          note="88.9% of total"
          good
        />
        <Metric
          icon={<CircleAlert />}
          label="Active alerts"
          value={alerts.length || "03"}
          note="Needs your attention"
          warn
        />
      </div>
      <div className="dashboard-grid">
        <section className="panel chart-panel">
          <div className="panel-top">
            <div>
              <span className="panel-label">SENSOR NETWORK</span>
              <h2>Hive conditions</h2>
            </div>
            <div className="chart-legend">
              <span>
                <i className="legend-temp" /> Temperature
              </span>
              <span>
                <i className="legend-humidity" /> Humidity
              </span>
            </div>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={readings}>
                <defs>
                  <linearGradient id="tempFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d89c28" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#d89c28" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e8e3d8"
                />
                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#8d8b83", fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#8d8b83", fontSize: 11 }}
                  domain={[25, 45]}
                />
                <Tooltip
                  contentStyle={{
                    border: "0",
                    borderRadius: 8,
                    boxShadow: "0 6px 24px #2a2b2118",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="temperature"
                  stroke="#c88617"
                  fill="url(#tempFill)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="humidity"
                  stroke="#7a9f8d"
                  fill="none"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-footer">
            <span>Last 12 hours</span>
            <span>
              Updated just now <span className="live-dot" />
            </span>
          </div>
        </section>
        <section className="panel alerts-panel">
          <div className="panel-top">
            <div>
              <span className="panel-label">ATTENTION NEEDED</span>
              <h2>Active alerts</h2>
            </div>
            <button className="icon-button" onClick={() => setPage("alerts")} aria-label="View all alerts">
              <ArrowRight size={17} />
            </button>
          </div>
          {alerts.map((alert) => (
            <div className="alert-row" key={alert.id}>
              <div className={`alert-icon ${alert.severity}`}>
                <CircleAlert size={16} />
              </div>
              <div>
                <b>{alert.title}</b>
                <p>{alert.detail}</p>
              </div>
              <small>{alert.time}</small>
            </div>
          ))}
          <button className="panel-link" onClick={() => setPage("alerts")}>
            View all alerts <ArrowRight size={15} />
          </button>
        </section>
        <section className="panel hive-panel">
          <div className="panel-top">
            <div>
              <span className="panel-label">APIARY</span>
              <h2>Hive health</h2>
            </div>
            <button className="panel-link" onClick={() => setPage("hives")}>
              See all <ArrowRight size={15} />
            </button>
          </div>
          <div className="hive-list">
            {hives.map((hive) => (
              <div className="hive-row" key={hive.id}>
                <div className="mini-hive">
                  <Hexagon size={18} />
                </div>
                <div className="hive-name">
                  <b>{hive.id}</b>
                  <small>{hive.name}</small>
                </div>
                <div className="hive-reading">
                  <Thermometer size={14} /> {hive.temp}°
                </div>
                <div className="hive-reading">
                  <Droplets size={14} /> {hive.humidity}%
                </div>
                <Badge tone={hive.status === "Optimal" ? "green" : "yellow"}>
                  {hive.status}
                </Badge>
              </div>
            ))}
          </div>
        </section>
        <section className="panel insight-panel">
          <div className="insight-glow">
            <BarChart3 size={24} />
          </div>
          <span className="panel-label">DEMO INSIGHT</span>
          <h2>Signals worth noticing</h2>
          <p>
            {analytics.insight ||
              "Stable nectar flow detected across your active hives."}
          </p>
          <div className="insight-values">
            <div>
              <b>{analytics.hiveHealth || 94}%</b>
              <small>Hive health</small>
            </div>
            <div>
              <b>{analytics.forecast || "1,460"} kg</b>
              <small>Season forecast</small>
            </div>
            <div>
              <b>{analytics.swarmRisk || "Low"}</b>
              <small>Swarm risk</small>
            </div>
          </div>
          <span className="prototype-label">
            Prototype prediction · no ML accuracy claim
          </span>
        </section>
      </div>
    </main>
  );
}
function Metric({ icon, label, value, note, good, warn }) {
  return (
    <div className="metric">
      <div className={`metric-icon ${good ? "good" : warn ? "warn" : ""}`}>
        {icon}
      </div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small className={good ? "good-text" : warn ? "warn-text" : ""}>
        {note}
      </small>
    </div>
  );
}

function Traceability({ setPage }) {
  const [form, setForm] = useState({
    batchId: "HC-2026-0004",
    producer: "Maya Farms",
    origin: "Coorg, India",
    hive: "HIVE-07",
    harvestDate: "2026-09-21",
    honeyType: "Wildflower",
    purity: "98.7%",
    qualityStatus: "Passed",
    processing: "Cold filtered",
  });
  const [created, setCreated] = useState(null);
  const [loading, setLoading] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const result = await api("/api/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setCreated(result);
    } catch {
      setCreated({
        ...form,
        blockchain: "Awaiting local chain",
        qr: "Ready",
        verified: form.qualityStatus === "Passed",
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="app-page">
      <div className="page-heading">
        <div>
          <div className="section-kicker">TRACEABILITY / NEW RECORD</div>
          <h1>Register a harvest.</h1>
          <p>
            Create the trusted record that follows this batch from hive to home.
          </p>
        </div>
      </div>
      <div className="trace-layout">
        <form className="panel form-panel" onSubmit={submit}>
          <div className="panel-top">
            <div>
              <span className="panel-label">BATCH DETAILS</span>
              <h2>Harvest record</h2>
            </div>
            <span className="step-count">01 / 02</span>
          </div>
          <div className="form-grid">
            {[
              ["batchId", "Batch ID"],
              ["producer", "Producer"],
              ["origin", "Origin"],
              ["hive", "Hive"],
              ["harvestDate", "Harvest date"],
              ["honeyType", "Honey type"],
              ["purity", "Purity"],
              ["processing", "Processing"],
            ].map(([key, label]) => (
              <label key={key}>
                {label}
                <input
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  required
                />
              </label>
            ))}
            <label>
              Quality status
              <select
                value={form.qualityStatus}
                onChange={(e) =>
                  setForm({ ...form, qualityStatus: e.target.value })
                }
              >
                <option>Passed</option>
                <option>In testing</option>
                <option>Pending</option>
              </select>
            </label>
          </div>
          <div className="form-footer">
            <span>
              <ShieldCheck size={16} /> Your record is signed server-side
            </span>
            <Button>
              {loading ? "Registering..." : "Register on blockchain"}
            </Button>
          </div>
        </form>
        {created ? (
          <div className="panel qr-panel">
            <div className="verified-heading">
              <div className="success-icon">
                <Check />
              </div>
              <div>
                <span className="panel-label">RECORD CREATED</span>
                <h2>{created.batchId}</h2>
              </div>
            </div>
            <div className="qr-code">
              <QRCodeSVG
                value={`${getPublicBaseUrl()}/verify/${created.batchId}`}
                size={164}
              />
            </div>
            <p className="qr-help">Scan to open this batch's public journey.</p>
            <div className="verification-details">
              <div>
                <span>Batch ID</span>
                <b>{created.batchId}</b>
              </div>
               <div>
                 <span>Purity</span>
                 <b>{created.purity || "Not provided"}</b>
              </div>
              <div>
                <span>Verification status</span>
                <b>{created.verified ? "Verified" : "Not verified"}</b>
              </div>
            </div>
            <Badge tone="green">
              <Check size={13} /> {created.blockchain}
            </Badge>
            <div className="verification-actions">
              <button
                className="panel-link"
                onClick={() => downloadCertificate(created)}
              >
                Download certificate
              </button>
            </div>
          </div>
        ) : (
          <div className="panel qr-empty">
            <QrCode size={32} />
            <h2>Your proof, generated here.</h2>
            <p>
              Complete the record to generate a unique QR code and connect it to
              the local blockchain.
            </p>
            <div className="empty-steps">
              <span>
                <b>1</b> Add batch details
              </span>
              <span>
                <b>2</b> Sign the record
              </span>
              <span>
                <b>3</b> Share the story
              </span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function AlertsPage({ setPage }) {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    api("/api/alerts").then(setAlerts).catch(() => setAlerts([]));
  }, []);

  return (
    <main className="app-page">
      <div className="page-heading">
        <div>
          <div className="section-kicker">OPERATIONS / ALERTS</div>
          <h1>Active alerts</h1>
          <p>Review the conditions that need attention across your apiary.</p>
        </div>
        <button className="panel-link" onClick={() => setPage("dashboard")}>
          Back to dashboard <ArrowRight size={15} />
        </button>
      </div>
      <section className="panel alerts-panel">
        {alerts.map((alert) => (
          <div className="alert-row" key={alert.id}>
            <div className={`alert-icon ${alert.severity}`}>
              <CircleAlert size={16} />
            </div>
            <div>
              <b>{alert.title}</b>
              <p>{alert.detail}</p>
            </div>
            <small>{alert.time}</small>
          </div>
        ))}
        {!alerts.length && <p>No active alerts.</p>}
      </section>
    </main>
  );
}

function HivesPage({ setPage }) {
  const [hives, setHives] = useState([]);
  const [hiveBatches, setHiveBatches] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);

  useEffect(() => {
    api("/api/hives").then(setHives).catch(() => setHives([]));
  }, []);

  const openHive = async (hiveId) => {
    try {
      setSelectedBatch(null);
      setHiveBatches(await api(`/api/hives/${hiveId}/batches`));
    } catch {
      setHiveBatches(null);
    }
  };

  return (
    <main className="app-page">
      <div className="page-heading">
        <div>
          <div className="section-kicker">APIARY / HIVES</div>
          <h1>Hive health</h1>
          <p>Monitor the latest readings from every connected hive.</p>
        </div>
        <button className="panel-link" onClick={() => setPage("dashboard")}>
          Back to dashboard <ArrowRight size={15} />
        </button>
      </div>
      <section className="panel hive-panel">
        <div className="hive-list">
          {hives.map((hive) => (
            <div className="hive-row" key={hive.id}>
              <div className="mini-hive"><Hexagon size={18} /></div>
              <div className="hive-name">
                <b>{hive.id}</b>
                <small>{hive.name}</small>
              </div>
              <div className="hive-reading"><Thermometer size={14} /> {hive.temp}°</div>
              <div className="hive-reading"><Droplets size={14} /> {hive.humidity}%</div>
              <Badge tone={hive.status === "Optimal" ? "green" : "yellow"}>{hive.status}</Badge>
              <button className="panel-link" onClick={() => openHive(hive.id)}>
                Open hive <ArrowRight size={15} />
              </button>
            </div>
          ))}
        </div>
      </section>
      {hiveBatches && !selectedBatch && (
        <section className="panel passport-panel">
          <div className="panel-top">
            <div>
              <span className="panel-label">HIVE BATCHES</span>
              <h2>{hiveBatches.hive.id} · {hiveBatches.hive.name}</h2>
              <p>{hiveBatches.hive.location} · {hiveBatches.batches.length} batch{hiveBatches.batches.length === 1 ? "" : "es"}</p>
            </div>
            <button className="panel-link" onClick={() => setHiveBatches(null)}>Close</button>
          </div>
          <div className="passport-batches">
            {hiveBatches.batches.map((batch) => (
              <div className="passport-batch" key={batch.batchId}>
                <div>
                  <b>{batch.batchId}</b>
                  <small>{batch.honeyType} · Harvested {batch.harvestDate}</small>
                </div>
                <div>
                  <span>Purity</span>
                  <b>{batch.purity || "Not provided"}</b>
                </div>
                <button className="panel-link" onClick={() => setSelectedBatch(batch)}>
                  Open passport <ArrowRight size={15} />
                </button>
              </div>
            ))}
            {!hiveBatches.batches.length && <p>No batches are registered for this hive yet.</p>}
          </div>
        </section>
      )}
      {hiveBatches && selectedBatch && (
        <section className="panel passport-panel">
          <div className="panel-top">
            <div>
              <span className="panel-label">BATCH PASSPORT</span>
              <h2>{selectedBatch.batchId}</h2>
              <p>{selectedBatch.honeyType} · {hiveBatches.hive.name} · {hiveBatches.hive.location}</p>
            </div>
            <button className="panel-link" onClick={() => setSelectedBatch(null)}>Back to batches</button>
          </div>
          <div className="passport-apiary">
            <span className="panel-label">APIARY DATA</span>
            <div className="passport-apiary-grid">
              <div><span>Hive</span><b>{hiveBatches.hive.id}</b></div>
              <div><span>Location</span><b>{hiveBatches.hive.location}</b></div>
              <div><span>Status</span><b>{hiveBatches.hive.status}</b></div>
              <div><span>Temperature</span><b>{hiveBatches.hive.temp}°C</b></div>
              <div><span>Humidity</span><b>{hiveBatches.hive.humidity}%</b></div>
              <div><span>Bee activity</span><b>{hiveBatches.hive.activity}%</b></div>
            </div>
          </div>
          <div className="verification-details">
            <div><span>Batch ID</span><b>{selectedBatch.batchId}</b></div>
            <div><span>Purity</span><b>{selectedBatch.purity || "Not provided"}</b></div>
            <div><span>Verification</span><b>{selectedBatch.verificationStatus}</b></div>
            <div><span>Harvest date</span><b>{selectedBatch.harvestDate}</b></div>
            <div><span>Producer</span><b>{selectedBatch.producer}</b></div>
            <div><span>Processing</span><b>{selectedBatch.processing}</b></div>
          </div>
        </section>
      )}
    </main>
  );
}

function Verify({ setPage, publicView = false }) {
  const [batchId, setBatchId] = useState("");
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState("");
  const verifyBatch = async (id) => {
    const normalizedId = String(id || "").trim();
    if (!normalizedId) {
      setBatch(null);
      setError("Enter a batch ID or upload a QR image.");
      return;
    }
    setBatchId(normalizedId);
    setLoading(true);
    setError("");
    try {
      setBatch(await api(`/api/batches/${encodeURIComponent(normalizedId)}`));
    } catch {
      setBatch(null);
      setError("QR read successfully, but this batch is not available from the server.");
    } finally {
      setLoading(false);
    }
  };
  const uploadQrImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file.name);
    setBatch(null);
    setLoading(true);
    setError("Reading the QR code from your image...");
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext("2d", { willReadFrequently: true });
      context.drawImage(image, 0, 0);
      const scan = jsQR(
        context.getImageData(0, 0, canvas.width, canvas.height).data,
        canvas.width,
        canvas.height,
        { inversionAttempts: "attemptBoth" },
      );
      URL.revokeObjectURL(image.src);
      if (!scan?.data) {
        setLoading(false);
        setError("No QR code found. Please upload a clear photo showing the complete black-and-white QR pattern.");
        return;
      }
      const match = scan.data.match(/(?:\/verify\/|batch(?:Id)?[=:])([^/?#&\s]+)/i);
      const decodedBatchId = match?.[1] || scan.data.match(/HC[-\w]+/i)?.[0];
      if (!decodedBatchId) {
        setLoading(false);
        setError("QR code found, but it does not contain a HoneyChain batch ID.");
        return;
      }
      verifyBatch(decodeURIComponent(decodedBatchId));
    };
    image.onerror = () => {
      URL.revokeObjectURL(image.src);
      setLoading(false);
      setError("That image could not be opened. Please choose another photo.");
    };
    image.src = URL.createObjectURL(file);
  };
  return (
    <main className="verify-page">
      {publicView && (
        <div className="verify-top">
          <Logo />
          <span>PUBLIC PRODUCT VERIFICATION</span>
        </div>
      )}
      <div className="verify-hero">
        <div className="verified-mark">
          <Check size={26} />
        </div>
        <span className="section-kicker">HONEYCHAIN VERIFIED</span>
        <h1>Know your honey.</h1>
        <p>
          Upload a clear photo of the QR code on your jar to see the complete
          journey behind that batch.
        </p>
        <label className="qr-upload">
          <QrCode size={17} />
          <span>{loading ? "Reading QR code..." : selectedFile ? `Selected: ${selectedFile}` : "Upload a photo of the bottle QR code"}</span>
          <input type="file" accept="image/*" onChange={uploadQrImage} />
        </label>
      </div>
      {error && (
        <div className="verification-result">
          <div className="verified-summary">
            <div>
              <Badge tone={loading ? "green" : "yellow"}>
                <CircleAlert size={13} /> {error}
              </Badge>
            </div>
          </div>
        </div>
      )}
      {batch && (
        <div className="verification-result">
          <div className="verified-summary">
            <div>
              <Badge tone="green">
                <Check size={13} /> Product verified
              </Badge>
              <h2>{batch.honeyType} honey</h2>
              <p>
                Batch <b>{batch.batchId}</b> · {batch.origin}
              </p>
            </div>
            <div className="chain-stamp">
              <Blocks size={18} />
              <span>
                Blockchain
                <br />
                <b>{batch.blockchain}</b>
              </span>
            </div>
          </div>
          <div className="journey">
            <span className="panel-label">THE JOURNEY</span>
            <h2>From hive to home.</h2>
            <div className="timeline">
              {(batch.timeline || []).map((event, index) => (
                <div
                  className={`timeline-item ${
                    index === batch.timeline.length - 1 ? "current" : ""
                  }`}
                  key={event}
                >
                  <div className="timeline-dot">
                    {index === batch.timeline.length - 1 ? (
                      <Check size={13} />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div>
                    <b>{event}</b>
                    <small>
                      {index === 0
                        ? batch.hive
                        : index === 1
                        ? batch.harvestDate
                        : "Recorded and timestamped"}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="verification-details">
            <div>
              <span>Batch ID</span>
              <b>{batch.batchId}</b>
            </div>
             <div>
               <span>Purity</span>
               <b>{batch.purity || "Not provided"}</b>
            </div>
            <div>
              <span>Verification status</span>
              <b>{batch.verificationStatus || (batch.verified ? "Verified" : "Not verified")}</b>
            </div>
            <div>
              <span>Producer</span>
              <b>{batch.producer}</b>
            </div>
            <div>
              <span>Origin</span>
              <b>{batch.origin}</b>
            </div>
            <div>
              <span>Hive</span>
              <b>{batch.hive}</b>
            </div>
            <div>
              <span>Harvest date</span>
              <b>{batch.harvestDate}</b>
            </div>
            <div>
              <span>Transaction ID</span>
              <b className="mono">
                {batch.transactionId || "0x local demo record"}
              </b>
            </div>
          </div>
          <div className="verification-actions">
            <button className="panel-link" onClick={() => downloadCertificate(batch)}>
              Download certificate
            </button>
          </div>
        </div>
      )}
      <footer className="verify-footer">
        <span>Transparent. Trusted. Traceable.</span>
      </footer>
    </main>
  );
}

function Auth({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await api(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      localStorage.setItem("honeychain-token", result.token);
      onLogin(result.user);
    } catch (requestError) {
      setError(
        requestError.message === "API request failed"
          ? "Please check your details and try again."
          : requestError.message
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="auth-page">
      <div className="auth-visual">
        <Logo />
        <div>
          <span className="section-kicker light">
            TRUSTED APIARY OPERATIONS
          </span>
          <h1>
            Every harvest
            <br />
            <em>has a home.</em>
          </h1>
          <p>
            Manage hives, sensor signals and verified honey journeys in one
            place.
          </p>
        </div>
      </div>
      <section className="auth-card">
        <div className="auth-tabs">
          <button
            className={mode === "login" ? "active" : ""}
            onClick={() => {
              setMode("login");
              setError("");
            }}
          >
            Log in
          </button>
          <button
            className={mode === "register" ? "active" : ""}
            onClick={() => {
              setMode("register");
              setError("");
            }}
          >
            Create account
          </button>
        </div>
        <span className="section-kicker">HONEYCHAIN ACCOUNT</span>
        <h2>{mode === "login" ? "Welcome back." : "Create your apiary."}</h2>
        <p>
          {mode === "login"
            ? "Sign in to see your hives and harvest records."
            : "Register your farm to begin tracking trusted harvests."}
        </p>
        <form onSubmit={submit}>
          {mode === "register" && (
            <label>
              Farm or owner name
              <input
                required
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                placeholder="Your farm name"
              />
            </label>
          )}
          <label>
            Email address
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
              placeholder="you@example.com"
            />
          </label>
          <label>
            Password
            <input
              required
              minLength="6"
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm({ ...form, password: event.target.value })
              }
              placeholder="At least 6 characters"
            />
          </label>
          {error && <div className="auth-error">{error}</div>}
          <button className="button" type="submit">
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Enter dashboard"
              : "Create my account"}{" "}
            <ArrowRight size={16} />
          </button>
        </form>
      </section>
    </main>
  );
}

export default function App() {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("honeychain-user") || "null")
  );
  const verifyRoute = window.location.pathname.startsWith("/verify");
  const publicPage = verifyRoute && !user;
  const [page, setPage] = useState(
    verifyRoute ? "verify" : user ? "home" : "auth"
  );

  useEffect(() => {
    if (page === "verify") {
      const target = window.location.pathname.startsWith("/verify/")
        ? window.location.pathname
        : "/verify/HC-2026-0001";
      if (window.location.pathname !== target) {
        window.history.pushState({}, "", target);
      }
    } else if (page === "home" && window.location.pathname !== "/") {
      window.history.pushState({}, "", "/");
    } else if (page === "auth" && window.location.pathname !== "/") {
      window.history.pushState({}, "", "/");
    }
  }, [page]);

  const login = (nextUser) => {
    localStorage.setItem("honeychain-user", JSON.stringify(nextUser));
    setUser(nextUser);
    setPage("home");
  };
  const logout = () => {
    localStorage.removeItem("honeychain-user");
    localStorage.removeItem("honeychain-token");
    setUser(null);
    setPage("auth");
  };
  if (page === "auth") return <Auth onLogin={login} />;
  return (
    <div>
      {!publicPage && (
        <Nav
          page={page}
          setPage={setPage}
          user={user || { name: "Guest", role: "beekeeper" }}
          onLogout={logout}
        />
      )}
      {page === "home" && <Home setPage={setPage} />}
      {page === "dashboard" && <Dashboard setPage={setPage} />}
      {page === "alerts" && <AlertsPage setPage={setPage} />}
      {page === "hives" && <HivesPage setPage={setPage} />}
      {page === "traceability" && <Traceability setPage={setPage} />}
      {page === "verify" && <Verify setPage={setPage} publicView={publicPage} />}
    </div>
  );
}
