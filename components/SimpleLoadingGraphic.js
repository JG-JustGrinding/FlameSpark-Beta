import "./SimpleLoadingGraphic.css";

export default function SimpleLoadingGraphic({ text = "" }) {
    return (
        <div className="loading">
            <div className="spinner"></div>
            <span className="loading-text bodyFont">{text}</span>
        </div>
    );
}