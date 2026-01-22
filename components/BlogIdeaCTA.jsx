"use client";
import { useState } from "react";
import BlogIdeaPanel from "./BlogIdeaPanel";

export default function BlogIdeaCTA() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <article className="blog-card" style={{ cursor: 'pointer' }}>
        <div className="blog-card-link" role="button" onClick={() => setOpen(true)} aria-label="Submit a Blog">
          <div className="blog-card-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/add_logo.png" alt="Submit a Blog" style={{ width: 96, height: 96, objectFit: 'contain' }} />
          </div>
          <div className="blog-card-content">
            <div className="blog-card-tags">
              <span className="blog-tag bodyFont">Community</span>
              <span className="blog-tag bodyFont">Ideas</span>
            </div>
            <h3 className="blog-card-title titleFont">Submit a Blog</h3>
            <p className="blog-card-excerpt bodyFont">
              Share your idea for a future FlameSpark blog. We welcome contributions from our community!
            </p>
            <div className="blog-card-meta bodyFont">

            </div>
          </div>
        </div>
      </article>

      <BlogIdeaPanel isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
