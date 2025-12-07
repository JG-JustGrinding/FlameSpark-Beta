import Header from "@/components/Header";
import BlogCard from "@/components/BlogCard";
import "@/styles/BlogsPage.css";

export const metadata = {
  title: "Blogs - FlameSpark",
  description: "Stories, insights, and more from FlameSpark!",

  alternates: {
    canonical: `${process.env.DOMAIN_NAME}/blogs`,
  },

  openGraph: {
    title: "FlameSpark Blogs: Stories, Insights, and More!",
    description:
      "Stories, insights, and more from FlameSpark.",
    url: `${process.env.DOMAIN_NAME}/blogs`,
    siteName: "FlameSpark",
    type: "website",
    images: [
      {
        url: `${process.env.DOMAIN_NAME}/blogs_banner.png`,
        width: 1200,
        height: 630,
        alt: "FlameSpark Blogs Banner",
      }
    ],
    authors: ["FlameSpark"],
  },
  twitter: {
    card: "summary_large_image",
    title: "FlameSpark Blogs: Stories, Insights, and More!",
    description:
      "Stories, insights, and more from FlameSpark.",
    images: [`${process.env.DOMAIN_NAME}/blogs_banner.png`],
    creator: "@FlameSpark",
  },
};

const blogPosts = [
  {
    id: "the-story-of-flamespark",
    title: "The Story of FlameSpark: Where the Go-Getters Grow",
    excerpt: "The why, how, and what behind **FlameSpark**: the platform that gives everyone a chance to shine.",
    coverImage: "/Thumbnail_Future.png",
    author: "FlameSpark",
    authorImage: "/FLAMESPARK_WITHBG_CIRCULAR.svg",
    date: "2025-11-30",
    readTime: "2 min read",
    tags: ["Introduction", "Innovation"],
    showDate: false,
  },
  {
    id: "how-traditional-social-media-kills-ideas",
    title: "How Traditional Social Media Kills Ideas",
    excerpt: "How social media platforms prioritize popularity over potential, preventing new ideas from getting the recognition they deserve.",
    coverImage: "/Thumbnail_Fail.png",
    author: "FlameSpark",
    authorImage: "/FLAMESPARK_WITHBG_CIRCULAR.svg",
    date: "2025-11-30",
    readTime: "5 min read",
    tags: ["Social Media", "Revelation"],
    showDate: false,
  },
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
              showDate={post.showDate}
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