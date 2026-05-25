import { useMemo, useState } from "react";
import {
  Ban,
  BarChart3,
  ChevronRight,
  CreditCard,
  IndianRupee,
  LayoutDashboard,
  Loader2,
  Upload,
  WalletCards,
} from "lucide-react";
import paylensLogo from "./assets/brand/paylens-logo.png";
import gpayLogo from "./assets/logos/gpay.png";
import hotstarLogo from "./assets/logos/jiohotstar.png";
import netflixLogo from "./assets/logos/netflix.png";
import paytmLogo from "./assets/logos/paytm.png";
import phonepeLogo from "./assets/logos/phonepe.png";
import primeLogo from "./assets/logos/prime-video.png";
import spotifyLogo from "./assets/logos/spotify.png";

const sampleSubscriptions = [
  {
    name: "Netflix",
    amount: 649,
    frequency: "monthly",
    upi_app: "Google Pay",
    estimated_monthly_spend: 649,
    occurrences: 3,
    cancellation_guidance: "Open Google Pay > Profile > Autopay > Select mandate > Cancel.",
  },
  {
    name: "Amazon Prime",
    amount: 299,
    frequency: "monthly",
    upi_app: "Paytm",
    estimated_monthly_spend: 299,
    occurrences: 3,
    cancellation_guidance: "Open Paytm > UPI & Payment Settings > Automatic Payments > Cancel mandate.",
  },
  {
    name: "JioHotstar",
    amount: 299,
    frequency: "monthly",
    upi_app: "Google Pay",
    estimated_monthly_spend: 299,
    occurrences: 3,
    cancellation_guidance: "Open Google Pay > Profile > Autopay > Select mandate > Cancel.",
  },
  {
    name: "Spotify",
    amount: 119,
    frequency: "monthly",
    upi_app: "PhonePe",
    estimated_monthly_spend: 119,
    occurrences: 3,
    cancellation_guidance: "Open PhonePe > Profile > Autopay > Select subscription > Disable.",
  },
];

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "subscriptions", label: "Subscriptions", icon: CreditCard },
  { id: "guidance", label: "Cancel Guidance", icon: Ban },
];

const APP_NAME = "PayLens";
const APP_TAGLINE = "Unified UPI Autopay Manager";

const serviceLogoAssets = {
  hotstar: hotstarLogo,
  netflix: netflixLogo,
  prime: primeLogo,
  spotify: spotifyLogo,
};

const paymentLogoAssets = {
  gpay: gpayLogo,
  paytm: paytmLogo,
  phonepe: phonepeLogo,
};

export default function App() {
  const [activeView, setActiveView] = useState("dashboard");
  const [subscriptions, setSubscriptions] = useState(sampleSubscriptions);
  const [summary, setSummary] = useState(createSummary(sampleSubscriptions));
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("Sample data loaded. Upload CSV to analyze your transactions.");

  const highestExpenseName = summary.highest_recurring_expense?.name ?? "None";
  const spendByApp = useMemo(() => groupSpendByApp(subscriptions), [subscriptions]);

  async function handleUpload(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    setIsUploading(true);
    setMessage("Analyzing transactions...");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail ?? "CSV analysis failed.");
      }

      const result = await response.json();
      setSubscriptions(result.subscriptions);
      setSummary(result);
      setMessage(`Analyzed ${file.name}`);
      setActiveView("dashboard");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-logo-frame">
            <img alt="PayLens logo" className="brand-logo" src={paylensLogo} />
          </span>
          <div>
            <span>{APP_NAME}</span>
            <small>{APP_TAGLINE}</small>
          </div>
        </div>

        <nav className="nav-list" aria-label="Primary">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={`nav-item ${activeView === item.id ? "active" : ""}`}
                key={item.id}
                onClick={() => setActiveView(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="upi-stack">
          <AppBadge app="Google Pay" />
          <AppBadge app="PhonePe" />
          <AppBadge app="Paytm" />
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">{APP_NAME}</p>
            <h1>{viewTitle(activeView)}</h1>
          </div>
          <label className="upload-button">
            {isUploading ? <Loader2 className="spin" size={18} /> : <Upload size={18} />}
            <span>{isUploading ? "Analyzing" : "Upload CSV"}</span>
            <input type="file" accept=".csv" disabled={isUploading} onChange={handleUpload} />
          </label>
        </header>

        <div className="view-stage" key={activeView}>
          {activeView === "dashboard" && (
            <Dashboard
              highestExpenseName={highestExpenseName}
              message={message}
              spendByApp={spendByApp}
              subscriptions={subscriptions}
              summary={summary}
            />
          )}

          {activeView === "subscriptions" && (
            <SubscriptionsView message={message} subscriptions={subscriptions} />
          )}

          {activeView === "guidance" && <GuidanceView subscriptions={subscriptions} />}
        </div>
      </section>
    </main>
  );
}

function Dashboard({ highestExpenseName, message, spendByApp, subscriptions, summary }) {
  return (
    <>
      <section className="metrics">
        <Metric icon={<IndianRupee size={18} />} label="Monthly spend" value={formatMoney(summary.total_monthly_spend)} />
        <Metric icon={<WalletCards size={18} />} label="Active subscriptions" value={summary.active_subscription_count} />
        <Metric icon={<BarChart3 size={18} />} label="Highest expense" value={highestExpenseName} />
      </section>

      <section className="dashboard-grid">
        <Panel title="Detected subscriptions" meta={`${subscriptions.length} active`} message={message}>
          <SubscriptionTable subscriptions={subscriptions} compact />
        </Panel>

        <Panel title="UPI app split" meta="Monthly">
          <div className="app-spend-list">
            {spendByApp.map((item, index) => (
              <div className="app-spend-row" key={item.app} style={{ "--delay": `${index * 70}ms` }}>
                <AppBadge app={item.app} />
                <strong>{formatMoney(item.total)}</strong>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section className="analytics-grid">
        <Panel title="Spend distribution" meta="By subscription">
          <DonutChart subscriptions={subscriptions} />
        </Panel>

        <Panel title="Monthly comparison" meta="Recurring value">
          <BarChart subscriptions={subscriptions} />
        </Panel>
      </section>
    </>
  );
}

function SubscriptionsView({ message, subscriptions }) {
  return (
    <Panel title="Subscriptions" meta={`${subscriptions.length} active`} message={message}>
      <div className="subscription-card-grid">
        {subscriptions.length === 0 && <div className="empty-state">No recurring subscriptions detected in this CSV.</div>}
        {subscriptions.map((subscription, index) => (
          <article
            className="subscription-card"
            key={`${subscription.name}-${subscription.upi_app}`}
            style={{ "--delay": `${index * 75}ms` }}
          >
            <ServiceLogo name={subscription.name} size="large" />
            <div className="subscription-card-main">
              <div>
                <h2>{subscription.name}</h2>
                <AppBadge app={subscription.upi_app} />
              </div>
              <strong>{formatMoney(subscription.amount)}</strong>
            </div>
            <div className="subscription-meta">
              <span>{subscription.frequency}</span>
              <span>{subscription.occurrences ?? 0} payments</span>
              <span>{formatMoney(subscription.estimated_monthly_spend)} monthly</span>
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );
}

function GuidanceView({ subscriptions }) {
  return (
    <Panel title="Cancel Guidance" meta={`${subscriptions.length} mandates`}>
      <div className="guidance-list">
        {subscriptions.length === 0 && <div className="empty-state">Upload a CSV to show mandate guidance.</div>}
        {subscriptions.map((subscription, index) => (
          <article
            className="guidance-item"
            key={`${subscription.name}-${subscription.upi_app}`}
            style={{ "--delay": `${index * 70}ms` }}
          >
            <ServiceLogo name={subscription.name} />
            <div>
              <h2>{subscription.name}</h2>
              <p>{subscription.cancellation_guidance ?? defaultGuidance(subscription.upi_app)}</p>
            </div>
            <ChevronRight size={18} />
          </article>
        ))}
      </div>
    </Panel>
  );
}

function SubscriptionTable({ subscriptions, compact = false }) {
  return (
    <div className="subscription-table">
      <div className="table-row table-head">
        <span>Name</span>
        <span>Amount</span>
        <span>Frequency</span>
        <span>UPI app</span>
      </div>
      {subscriptions.length === 0 && <div className="empty-state">No recurring subscriptions detected in this CSV.</div>}
      {subscriptions.map((subscription, index) => (
        <div
          className={`table-row ${compact ? "compact" : ""}`}
          key={`${subscription.name}-${subscription.upi_app}`}
          style={{ "--delay": `${index * 55}ms` }}
        >
          <div className="table-name">
            <ServiceLogo name={subscription.name} />
            <strong>{subscription.name}</strong>
          </div>
          <span>{formatMoney(subscription.amount)}</span>
          <span>{subscription.frequency}</span>
          <AppBadge app={subscription.upi_app} />
        </div>
      ))}
    </div>
  );
}

function DonutChart({ subscriptions }) {
  const total = subscriptions.reduce((sum, item) => sum + item.estimated_monthly_spend, 0);
  const segments = buildSegments(subscriptions, total);
  const background = segments.length
    ? `conic-gradient(${segments.map((segment) => `${segment.color} ${segment.start}% ${segment.end}%`).join(", ")})`
    : "#dce7e2";

  return (
    <div className="donut-layout">
      <div className="donut-chart" style={{ background }}>
        <div className="donut-hole">
          <span>Total</span>
          <strong>{formatMoney(total)}</strong>
        </div>
      </div>
      <div className="chart-legend">
        {segments.map((segment) => (
          <div className="legend-row" key={segment.name}>
            <span className="legend-color" style={{ background: segment.color }} />
            <span>{segment.name}</span>
            <strong>{segment.percent}%</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChart({ subscriptions }) {
  const max = Math.max(...subscriptions.map((item) => item.estimated_monthly_spend), 1);

  return (
    <div className="bar-chart">
      {subscriptions.map((subscription, index) => {
        const width = Math.max((subscription.estimated_monthly_spend / max) * 100, 8);
        return (
          <div className="bar-row" key={`${subscription.name}-bar`} style={{ "--delay": `${index * 90}ms` }}>
            <div className="bar-label">
              <ServiceLogo name={subscription.name} />
              <span>{subscription.name}</span>
            </div>
            <div className="bar-track" aria-label={`${subscription.name} monthly spend`}>
              <span
                className={`bar-fill ${logoKey(subscription.name)}`}
                style={{ width: `${width}%` }}
              />
            </div>
            <strong>{formatMoney(subscription.estimated_monthly_spend)}</strong>
          </div>
        );
      })}
    </div>
  );
}

function Panel({ children, message, meta, title }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>{title}</h2>
          {message && <p>{message}</p>}
        </div>
        {meta && <span>{meta}</span>}
      </div>
      {children}
    </section>
  );
}

function Metric({ icon, label, value }) {
  return (
    <article className="metric">
      <div className="metric-label">
        {icon}
        <span>{label}</span>
      </div>
      <strong>{value}</strong>
    </article>
  );
}

function ServiceLogo({ name, size = "regular" }) {
  const key = logoKey(name);
  const logo = serviceLogoAssets[key];

  return (
    <span className={`service-logo ${key} ${size}`} aria-label={`${name} logo`} title={name}>
      {logo ? <img alt="" src={logo} /> : logoText(name)}
    </span>
  );
}

function AppBadge({ app }) {
  const key = appKey(app);
  return (
    <span className={`app-badge ${key}`}>
      <PaymentLogo app={app} />
      {app}
    </span>
  );
}

function PaymentLogo({ app }) {
  const key = appKey(app);
  const logo = paymentLogoAssets[key];
  if (logo) {
    return <img alt="" className={`payment-logo ${key}-mark`} src={logo} />;
  }
  return <span className="payment-logo default-mark" aria-hidden="true" />;
}

function createSummary(subscriptions) {
  const total = subscriptions.reduce((sum, item) => sum + item.estimated_monthly_spend, 0);
  const highest = [...subscriptions].sort((a, b) => b.estimated_monthly_spend - a.estimated_monthly_spend)[0] ?? null;

  return {
    total_monthly_spend: total,
    active_subscription_count: subscriptions.length,
    highest_recurring_expense: highest,
  };
}

function groupSpendByApp(subscriptions) {
  const totals = subscriptions.reduce((acc, item) => {
    acc[item.upi_app] = (acc[item.upi_app] ?? 0) + item.estimated_monthly_spend;
    return acc;
  }, {});

  return Object.entries(totals)
    .map(([app, total]) => ({ app, total }))
    .sort((a, b) => b.total - a.total);
}

function formatMoney(value) {
  return `Rs. ${Number(value ?? 0).toLocaleString("en-IN")}`;
}

function viewTitle(view) {
  if (view === "subscriptions") {
    return "Subscriptions";
  }
  if (view === "guidance") {
    return "Cancel guidance";
  }
  return "Autopay dashboard";
}

function logoKey(name) {
  const value = name.toLowerCase();
  if (value.includes("netflix")) return "netflix";
  if (value.includes("spotify")) return "spotify";
  if (value.includes("hotstar") || value.includes("jio")) return "hotstar";
  if (value.includes("amazon") || value.includes("prime")) return "prime";
  return "default";
}

function logoText(name) {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function appKey(app) {
  const value = app.toLowerCase();
  if (value.includes("google")) return "gpay";
  if (value.includes("phonepe")) return "phonepe";
  if (value.includes("paytm")) return "paytm";
  return "default";
}

function defaultGuidance(app) {
  return `Open ${app}, go to Autopay or UPI mandates, select the subscription, and cancel the mandate.`;
}

function buildSegments(subscriptions, total) {
  let cursor = 0;
  return subscriptions.map((subscription, index) => {
    const percent = total > 0 ? Math.round((subscription.estimated_monthly_spend / total) * 100) : 0;
    const start = cursor;
    const end = cursor + (total > 0 ? (subscription.estimated_monthly_spend / total) * 100 : 0);
    cursor = end;

    return {
      name: subscription.name,
      percent,
      start,
      end,
      color: chartColor(subscription.name, index),
    };
  });
}

function chartColor(name, index) {
  const key = logoKey(name);
  const colors = {
    netflix: "#e50914",
    spotify: "#1db954",
    prime: "#00a8e1",
    hotstar: "#7b2ff7",
    default: ["#1f8a70", "#f6a821", "#5f259f", "#4285f4"][index % 4],
  };
  return colors[key] ?? colors.default;
}
