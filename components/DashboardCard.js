export default function DashboardCard({ title, value, className=""}) {
  return (
    <div className={`dashboard-card${className ? " " + className : ""}`}>
      <h3 className="titleFont bold">{title}</h3>
      <p className="bodyFont">{value}</p>
    </div>
  );
}