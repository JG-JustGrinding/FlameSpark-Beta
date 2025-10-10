import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function DashboardCard({ title, value, icon, secondIcon, className = "" }) {
  return (
    <div className={`dashboard-card${className ? " " + className : ""}`}>
      {icon && (
        <div className="dashboard-card-icon">
          <FontAwesomeIcon icon={icon} />
          {secondIcon && <FontAwesomeIcon icon={secondIcon} />}
        </div>
      )}
      <h3 className="titleFont bold">{title}</h3>
      <p className={`bodyFont dashboard-card-value${(value || value === 0) ? "" : " skeleton"}`}>{value || 0}</p>
    </div>
  );
}