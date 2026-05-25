
import { IndianRupee, Upload, WalletCards } from "lucide-react";

const sampleSubscriptions = [
  {
    name: "Netflix",
    amount: 649,
    frequency: "monthly",
    upi_app: "Google Pay",
    estimated_monthly_spend: 649,
  },
  {
    name: "Amazon Prime",
    amount: 299,
    frequency: "monthly",
    upi_app: "Paytm",
    estimated_monthly_spend: 299,
  },
  {
    name: "Spotify",
    amount: 119,
    frequency: "monthly",
    upi_app: "PhonePe",
    estimated_monthly_spend: 119,
  },
];

export default function App() {
  const total = sampleSubscriptions.reduce((sum, item) => sum + item.estimated_monthly_spend, 0);

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <WalletCards size={24} />
          <span>UPI Autopay</span>
        </div>
        <button className="nav-item active">Dashboard</button>
        <button className="nav-item">Subscriptions</button>
        <button className="nav-item">Cancel Guidance</button>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Unified tracker</p>
            <h1>Autopay subscriptions</h1>
          </div>
          <label className="upload-button">
            <Upload size={18} />
            <span>Upload CSV</span>
            <input type="file" accept=".csv" />
          </label>
        </header>

        <section className="metrics">
          <Metric icon={<IndianRupee size={18} />} label="Monthly spend" value={`₹${total}`} />
          <Metric label="Active subscriptions" value={sampleSubscriptions.length} />
          <Metric label="Highest expense" value="Netflix" />
        </section>

        <section className="table-panel">
          <div className="panel-heading">
            <h2>Detected subscriptions</h2>
            <span>{sampleSubscriptions.length} active</span>
          </div>
          <div className="subscription-table">
            <div className="table-row table-head">
              <span>Name</span>
              <span>Amount</span>
              <span>Frequency</span>
              <span>UPI app</span>
            </div>
            {sampleSubscriptions.map((subscription) => (
              <div className="table-row" key={subscription.name}>
                <strong>{subscription.name}</strong>
                <span>₹{subscription.amount}</span>
                <span>{subscription.frequency}</span>
                <span>{subscription.upi_app}</span>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
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
