"use client";
import { useState } from "react";
import Header from "@/components/Header";
import { useBlogLike } from "@/lib/useBlogLike.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faCalendar, faArrowLeft, faHeart as faHeartSolid, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { faHeart } from "@fortawesome/free-regular-svg-icons";
import "@/styles/BlogArticle.css";

export default function BlogArticle({ blogId, article, children }) {
  const { liked, count, like, unlike, actionInProgress, loading } = useBlogLike(blogId);

  const handleLike = () => {
    if (liked) {
      unlike();
    } else {
      like();
    }
  };

  return (
    <div className="blog-article-page">
      <Header />
      <main className="article-container">
        <a href="/blogs" className="back-link bodyFont">
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Blogs
        </a>
        
        <article className="article-content">
          <div className="article-cover">
            <img src={article.coverImage} alt={article.title} />
          </div>
          
          <div className="article-header">
            <h1 className="titleFont">{article.title}</h1>
            
            <div className="article-meta">
              <div className="author-section">
                <img src={article.authorImage} alt={article.author} className="author-image pfp-shape" />
                <span className="bodyFont">{article.author}</span>
              </div>
              <div className="meta-info bodyFont">
                <span>
                  <FontAwesomeIcon icon={faCalendar} /> {new Date(article.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span>
                  <FontAwesomeIcon icon={faClock} /> {article.readTime}
                </span>
              </div>
            </div>
            
            <div className="article-tags bodyFont">
              {article.tags.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
          </div>
          
          <div className="article-body bodyFont">
            {children}
          </div>

          {blogId && <div className="article-likes">
            <button 
              className={`like-button ${loading ? ' loading' : ''} ${liked ? 'liked' : ''}`}
              onClick={handleLike}
              aria-label={liked ? "Unlike article" : "Like article"}
              disabled={actionInProgress || loading}
            >
              <FontAwesomeIcon icon={liked ? faHeartSolid : faHeart} />
              {loading ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                <span className="bodyFont">{count} {count === 1 ? 'Like' : 'Likes'}</span>
              )}
            </button>
          </div>}
        </article>
      </main>
    </div>
  );
}
