export default function ArticleLayout({ children }) {
  return children;
}

export function generateMetadata() {
  return {
    title: "How Traditional Social Media Kills Ideas - FlameSpark",
    description: "How social media platforms prioritize popularity over potential, preventing new ideas from getting the recognition they deserve.",

    alternates: {
      canonical: `${process.env.DOMAIN_NAME}/blog/how-traditional-social-media-kills-ideas`,
    },

    openGraph: {
      title: "How Traditional Social Media Kills Ideas - FlameSpark",
      description:
        "Uncover how social media platforms prioritize popularity over potential, preventing new ideas from getting the recognition they deserve.",
      url: `${process.env.DOMAIN_NAME}/blog/how-traditional-social-media-kills-ideas`,
      siteName: "FlameSpark",
      type: "article",
      images: [
        {
          url: `${process.env.DOMAIN_NAME}/Thumbnail_Fail.png`,
          width: 1200,
          height: 630,
          alt: "FlameSpark Thumbnail",
        }
      ],
      authors: ["FlameSpark"],
    },
    twitter: {
      card: "summary_large_image",
      title: "How Traditional Social Media Kills Ideas - FlameSpark",
      description:
        "Uncover how social media platforms prioritize popularity over potential, preventing new ideas from getting the recognition they deserve.",
      images: [`${process.env.DOMAIN_NAME}/Thumbnail_Fail.png`],
      creator: "@FlameSpark",
    },
    other: {
      "script:ld+json": JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        headline:
          "How Traditional Social Media Kills Ideas",
        description:
          "How social media platforms prioritize popularity over potential, preventing new ideas from getting the recognition they deserve.",
        image: `${process.env.DOMAIN_NAME}/Thumbnail_Fail.png`,
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