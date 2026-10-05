const stats = [
  { value: "₹0", label: "Brokerage you pay" },
  { value: "500+", label: "Properties listed" },
  { value: "10+", label: "Years in Pune real estate" },
  { value: "100%", label: "Listings verified" },
];

export default function TrustIndicators() {
  return (
    <section className="trust-v2">
      <div className="container">
        <dl className="trust-v2-list">
          {stats.map((stat) => (
            <div key={stat.label} className="trust-v2-item">
              <dt>{stat.label}</dt>
              <dd>{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
