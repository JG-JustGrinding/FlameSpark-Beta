import BlogArticle from "@/components/BlogArticle";

export default function TheStoryOfFlameSpark() {
  const article = {
    title: "The Story of FlameSpark: Where the Go-Getters Grow",
    coverImage: "/Thumbnail_Future.png",
    author: "FlameSpark",
    authorImage: "/FLAMESPARK_WITHBG_CIRCULAR.svg",
    date: "2025-11-30",
    readTime: "2 min read",
    tags: ["Introduction", "Innovation"],
    likes: 0,
    showDate: false,
  };

  return (
    <BlogArticle blogId="the-story-of-flamespark" article={article} related={{ title: "How Traditional Social Media Kills Ideas", description: "The reality of traditional social media and its unfairness to creators.", href: "/blog/how-traditional-social-media-kills-ideas", coverImage: "/Thumbnail_Fail.png" }}>
      <p>
        Ideas are meant to be shared. Great ideas are meant to be successful. Yet, despite this, ideas are constantly competing for just the chance to be noticed. Currently, If you want to show something to the world, your only options are to spend immense money on advertisement or to attempt to use traditional social media, where the top 1% of creators get the majority of the attention. Because of this, most ideas, even the most amazing ones, never get a fair chance to shine.
      </p>
      {false && <p className="label-color"><i>This is the problem that FlameSpark was created to solve.</i></p>}

      <h2 className="titleFont">FlameSpark's Vision</h2>
      <p>
        <b>FlameSpark</b>, a new social media platform, is designed to allow ideas and their creators flourish rather than fight. The premise of FlameSpark is to allow creators to gather a community around their ideas as they work to turn them into reality. FlameSpark is unique because instead of most social media, where the top creators get 90% of the views, FlameSpark features an unbiased algorithm, where all ideas have a chance to get noticed and grow.
      </p>

      <h2 className="titleFont">How FlameSpark Works</h2>
      <p>
        FlameSpark works by creators starting <b>projects</b>. Projects are places where creators can post various types of content about progress towards completing their idea and build a community around it. People who are interested in the creator's idea can then <b>join</b> their project to show their support. FlameSpark isn’t about posting polished products or fully-funded prototypes, it’s about watching the journey of raw and ambitious projects grow into successful creations!
      </p>

      <h2 className="titleFont">Supporting Creators</h2>
      <p>
        FlameSpark innovately tackles the 3 main challenges for creators: <b>Cost</b>, <b>Luck</b>, and <b>Risk</b>.
      </p>
      <ul>
        <li><strong>Cost:</strong> FlameSpark eliminates the needs for paid advertisements as you grow your audience fairly and naturally through posting.</li>
        <li><strong>Luck:</strong> FlameSpark’s unbiased algorithm allows every project to have a chance to grow without needing to bow to a harsh algorithm.</li>
        <li><strong>Risk:</strong> FlameSpark allows you to secure your audience <i>while</i> working on your idea, so you can gain supporters and build a community before the release of your creation.</li>
      </ul>

      <h2 className="titleFont">Join the Movement!</h2>
      <p>
        FlameSpark is a revolutionary platform that serves as a chance for the ideas that would otherwise go unrecognized to get their chance to truly shine. If you'd like to support our mission and gain access to <strong>FlameSpark Beta</strong>, you can become a member of the FlameSpark Patreon Community! Alternatively, you can follow FlameSpark on other social media platforms or join the FlameSpark discord community.
      </p>

      <div className="article-cta">
        <a href="/create" className="cta-button button-shape">Share Your First Project</a>
        <a href="/discover" className="cta-button button-shape secondary">Discover Projects</a>
      </div>
    </BlogArticle>
  );
}

export function generateMetadata() {
  return {
    title: "The Story of FlameSpark - FlameSpark",
    description: "Understand the why, how, and what behind FlameSpark: the platform that gives everyone a chance to shine.",

    alternates: {
      canonical: `${process.env.DOMAIN_NAME}/blog/the-story-of-flamespark`,
    },

    openGraph: {
      title: "The Story of FlameSpark: Where the Go-Getters Grow",
      description:
        "The why, how, and what behind FlameSpark: the platform that gives everyone a chance to shine.",
      url: `${process.env.DOMAIN_NAME}/blog/the-story-of-flamespark`,
      siteName: "FlameSpark",
      type: "article",
      images: [
        {
          url: `${process.env.DOMAIN_NAME}/Thumbnail_Future.png`,
          width: 1200,
          height: 630,
          alt: "FlameSpark Thumbnail",
        }
      ],
      authors: ["FlameSpark"],
    },
    twitter: {
      card: "summary_large_image",
      title: "The Story of FlameSpark: Where the Go-Getters Grow",
      description:
        "The why, how, and what behind FlameSpark: the platform that gives everyone a chance to shine.",
      images: [`${process.env.DOMAIN_NAME}/Thumbnail_Future.png`],
      creator: "@FlameSpark",
    },
    other: {
      "script:ld+json": JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        headline:
          "The Story of FlameSpark: Where the Go-Getters Grow",
        description:
          "Understand the why, how, and what behind FlameSpark: the platform that gives everyone a chance to shine.",
        image: `${process.env.DOMAIN_NAME}/Thumbnail_Future.png`,
        author: {
          "@type": "Organization",
          name: "FlameSpark"
        },
        publisher: {
          "@type": "Organization",
          name: "FlameSpark",
          logo: {
            "@type": "ImageObject",
            url: `${process.env.DOMAIN_NAME}/FLAMESPARK_WITHBG_CIRCULAR.svg`
          }
        },
        datePublished: "2025-12-16",
        dateModified: "2025-12-16"
      })
    }
  };
}