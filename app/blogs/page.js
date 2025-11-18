"use client";
import Header from "@/components/Header";
import BlogCard from "@/components/BlogCard";
import "@/styles/BlogsPage.css";

const blogPosts = [
  {
    id: "the-story-of-flamespark",
    title: "The Story of FlameSpark: Where the Go-Getters Grow",
    excerpt: "Learn how to create your first project and start sharing your ideas with the community.",
    coverImage: "https://t3.ftcdn.net/jpg/01/37/95/98/360_F_137959806_doSGnNfHz3smjII5ATZpBpHELJie82Vb.jpg",
    author: "FlameSpark",
    authorImage: "/FLAMESPARK_WITHBG_CIRCULAR.svg",
    date: "2025-11-15",
    readTime: "5 min read",
    tags: ["Tutorial", "Getting Started"]
  },
  {
    id: 2,
    title: "Building a Community Around Your Project",
    excerpt: "Discover strategies to engage supporters and grow an active community for your creative projects.",
    coverImage: "https://t3.ftcdn.net/jpg/01/37/95/98/360_F_137959806_doSGnNfHz3smjII5ATZpBpHELJie82Vb.jpg",
    author: "FlameSpark",
    authorImage: "/FLAMESPARK_WITHBG_CIRCULAR.svg",
    date: "2025-11-10",
    readTime: "8 min read",
    tags: ["Community", "Tips"]
  },
  {
    id: 3,
    title: "The Power of Early-Stage Ideas",
    excerpt: "Why sharing your ideas early can lead to better feedback and stronger final products.",
    coverImage: "https://t3.ftcdn.net/jpg/01/37/95/98/360_F_137959806_doSGnNfHz3smjII5ATZpBpHELJie82Vb.jpg",
    author: "FlameSpark",
    authorImage: "/FLAMESPARK_WITHBG_CIRCULAR.svg",
    date: "2025-11-05",
    readTime: "6 min read",
    tags: ["Ideas", "Innovation"]
  }
];

export default function Blogs() {

  return (
    <div className="blogs-page">
      <Header />
      <main className="blogs-container">
        <div className="blogs-header">
          <h1 className="titleFont">FlameSpark Blogs</h1>
          <p className="bodyFont">Stories, Insights, and More from FlameSpark!</p>
        </div>

        <div className="blogs-grid">
          {blogPosts.map((post) => (
            <BlogCard 
              key={post.id} 
              id={post.id}
              title={post.title}
              excerpt={post.excerpt}
              coverImage={post.coverImage}
              author={post.author}
              authorImage={post.authorImage}
              date={post.date}
              readTime={post.readTime}
              tags={post.tags}
            />
          ))}
        </div>

        {blogPosts.length === 0 && (
          <div className="blogs-empty">
            <p className="bodyFont">No blog posts yet. Check back soon!</p>
          </div>
        )}
      </main>
    </div>
  );
}