"use client";
import { useState } from "react";
import PanelOverlay from "./PanelOverlay";
import "./BlogIdeaPanel.css";
import { useUser } from "@/lib/useUser";

export default function BlogIdeaPanel({ isOpen, onClose }) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [contact, setContact] = useState("");
  const [tags, setTags] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const { user, username } = useUser();

  const reset = () => {
    setTitle("");
    setSummary("");
    setContact("");
    setTags("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/blog-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, summary, contact, tags, userId: user?.id }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to submit idea");
      }
      setSuccess(true);
      reset();
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PanelOverlay isOpen={isOpen} onClose={onClose} panelClass={`blog-idea-panel` + (!success ? " full-width" : "")}>
      <div className="titleFont" style={{ marginBottom: 12, fontSize: "1.35rem", fontWeight: 800 }}>
        Submit a Blog
      </div>
      {!success ? (
        <form onSubmit={handleSubmit} className="bodyFont blog-idea-form" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontWeight: 700 }}>Title Idea</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., How Even Great Ideas Get Overlooked"
              required
              style={{ padding: "10px 12px", border: "1px solid #ccc", borderRadius: 8 }}
                maxLength={300}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontWeight: 700 }}>Blog Content</span>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Send a link of the blog or write a brief summary of the content and direction you have in mind."
              rows={5}
              style={{ padding: "10px 12px", border: "1px solid #ccc", borderRadius: 8, resize: "vertical" }}
              maxLength={5000}
              required
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontWeight: 700 }}>Tags (comma-separated)</span>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., Community, Innovation, Social"
              style={{ padding: "10px 12px", border: "1px solid #ccc", borderRadius: 8 }}
              maxLength={300}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontWeight: 700 }}>How can we reach you? (optional)</span>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Email, Social Media, etc."
              style={{ padding: "10px 12px", border: "1px solid #ccc", borderRadius: 8 }}
              maxLength={300}
            />
          </label>

          {!user && <div style={{ fontSize: ".85rem", color: "#555" }}>Submitting anonymously</div>}

          {error && <div style={{ fontSize: ".95rem" }} className="error-message">{error}</div>}

          <div className="blog-idea-footer" style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              type="button"
              onClick={() => {reset(); onClose();}}
              style={{
                background: "transparent",
                color: "var(--black)",
                padding: "10px 16px",
                borderRadius: 8,
                border: "1px solid #ccc",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                background: "var(--flamespark-red)",
                color: "#fff",
                padding: "10px 16px",
                borderRadius: 8,
                border: "none",
                fontWeight: 800,
                cursor: submitting ? "default" : "pointer",
              }}
              className={submitting ? "disabled" : ""}
            >
              {submitting ? "Submitting..." : "Submit Idea"}
            </button>
          </div>
        </form>
      ) : (
        <div className="bodyFont" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontWeight: 700 }}>Thanks! Your idea has been submitted.</div>
          <button
            onClick={() => { setSuccess(false); onClose(); }}
            style={{
              background: "var(--flamespark-red)",
              color: "#fff",
              padding: "10px 16px",
              borderRadius: 8,
              border: "none",
              fontWeight: 800,
              cursor: "pointer",
              width: "fit-content",
            }}
          >
            Close
          </button>
        </div>
      )}
    </PanelOverlay>
  );
}
