"use client";
import BlogArticle from "@/components/BlogArticle";

export default function TheStoryOfFlameSpark() {
  const article = {
    title: "The Story of FlameSpark: Where the Go-Getters Grow",
    coverImage: "https://t3.ftcdn.net/jpg/01/37/95/98/360_F_137959806_doSGnNfHz3smjII5ATZpBpHELJie82Vb.jpg",
    author: "FlameSpark",
    authorImage: "/FLAMESPARK_WITHBG_CIRCULAR.svg",
    date: "2025-11-15",
    readTime: "5 min read",
    tags: ["Tutorial", "Getting Started"],
    likes: 0
  };

  return (
    <BlogArticle blogId="the-story-of-flamespark" article={article}>
      <p>
        Welcome to the story behind FlameSpark—a platform built for creators, innovators, and go-getters who believe ideas deserve a stage, no matter how early or rough they are.
      </p>
      
      <h2 className="titleFont">The Spark That Started It All</h2>
      <p>
        FlameSpark was born from a simple frustration: too many great ideas die in silence. Whether it's a groundbreaking app concept, a creative side project, or an ambitious startup dream, most ideas never see the light of day because creators don't have the right platform to share them.
      </p>
      <p>
        We wanted to change that. FlameSpark is designed to be the home for your early-stage ideas—a place where you can share your vision, gather feedback, and build a community of supporters who believe in what you're creating.
      </p>
      
      <h2 className="titleFont">Building for the Go-Getters</h2>
      <p>
        At FlameSpark, we celebrate the journey, not just the destination. We know that the path from idea to execution is messy, unpredictable, and full of iterations. That's why our platform is built to support you at every stage:
      </p>
      <ul>
        <li><strong>Share Your Ideas:</strong> Post your projects, no matter how early-stage they are.</li>
        <li><strong>Get Real Feedback:</strong> Connect with a community that understands the creative process.</li>
        <li><strong>Grow Together:</strong> Build relationships with fellow creators and potential collaborators.</li>
      </ul>
      
      <h2 className="titleFont">What Makes FlameSpark Different?</h2>
      <p>
        Unlike traditional social platforms or crowdfunding sites, FlameSpark focuses on <em>ideas in progress</em>. We're not looking for polished products or fully-funded ventures—we're here for the raw, unfinished, and ambitious.
      </p>
      <p>
        Our community thrives on authenticity. Whether you're a solo developer building your first app, an artist experimenting with new mediums, or an entrepreneur testing a bold concept, FlameSpark is your space to grow.
      </p>
      
      <h2 className="titleFont">Join the Movement</h2>
      <p>
        FlameSpark isn't just a platform—it's a movement. We're building a community of creators who support each other, share knowledge, and push boundaries together.
      </p>
      <p>
        So if you've got an idea that's been sitting in your notes app or a project you've been too nervous to share, this is your sign. Bring it to FlameSpark. Let's grow together.
      </p>
      
      <div className="article-cta">
        <a href="/create" className="cta-button button-shape">Share Your First Project</a>
        <a href="/discover" className="cta-button button-shape secondary">Discover Projects</a>
      </div>
    </BlogArticle>
  );
}
