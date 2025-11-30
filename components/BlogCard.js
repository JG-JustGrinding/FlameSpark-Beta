import React from 'react';
import './BlogCard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faUser } from '@fortawesome/free-solid-svg-icons';

export default function BlogCard({
  id,
  title = 'Blog Post Title',
  excerpt = '',
  coverImage = '/placeholder-blog.jpg',
  author = 'Author',
  authorImage = null,
  date = null,
  readTime = '5 min read',
  tags = [],
  showDate = false
}) {
  const formattedDate = date ? new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }) : null;

  // Basic markdown support for bold (**text**) and italic (*text*) in excerpt
  const renderExcerpt = (text) => {
    if (!text) return null;
    // Escape HTML to prevent injection
    const escapeHtml = (s) => s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
    let safe = escapeHtml(text);
    // Bold: **text**
    safe = safe.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic: *text* (avoid matching bold markers)
    safe = safe.replace(/(^|\s)\*(?!\*)([^*]+?)\*(?=\s|$)/g, '$1<em>$2</em>');
    return { __html: safe };
  };

  return (
    <article className="blog-card">
      <a href={`/blog/${id}`} className="blog-card-link">
        <div className="blog-card-image">
          <img src={coverImage} alt={title} />
        </div>
        <div className="blog-card-content">
          {tags.length > 0 && (
            <div className="blog-card-tags">
              {tags.slice(0, 2).map((tag, i) => (
                <span key={i} className="blog-tag bodyFont">{tag}</span>
              ))}
            </div>
          )}
          <h3 className="blog-card-title titleFont">{title}</h3>
          {excerpt && (
            <p className="blog-card-excerpt bodyFont" dangerouslySetInnerHTML={renderExcerpt(excerpt)} />
          )}
          <div className="blog-card-meta bodyFont">
            <span className="meta-item">
              {authorImage ? (
                <img src={authorImage} alt={author} className="author-image pfp-shape" />
              ) : (
                <FontAwesomeIcon icon={faUser} />
              )}
              {author}
            </span>
            <span className="meta-item">
              <FontAwesomeIcon icon={faClock} />
              {readTime}
            </span>
            {date && showDate && <span className="meta-date">{formattedDate}</span>}
          </div>
        </div>
      </a>
    </article>
  );
}
