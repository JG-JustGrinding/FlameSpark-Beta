export const metadata = {
  title: "Explore - FlameSpark",
  description:
    "Find new posts and discover new projects on FlameSpark. Explore amazing content from upcoming creations.",
  alternates: {
    canonical: `${process.env.DOMAIN_NAME}/explore`,
  },
  openGraph: {
    title: "Explore - FlameSpark",
    description:
      "Find new posts and discover new projects on FlameSpark. Explore amazing content from upcoming creations.",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/explore`,
    siteName: "FlameSpark",
    type: "website",
  },
  twitter: {
    title: "Explore - FlameSpark",
    description:
      "Find new posts and discover new projects on FlameSpark. Explore amazing content from upcoming creations.",
  },
};

export default async function ExploreLayout({ children }) {
  return children;
}
