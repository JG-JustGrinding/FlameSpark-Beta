import ExplorePageClient from "./ExplorePageClient";
import { fetchExplorePagePosts } from "@/lib/projectFunctions";

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

export default async function ExplorePage() {
  const seed = Math.random() * 2 - 1;
  const INITIAL_SIZE = 10;
  let initialPosts = [];
  try {
    initialPosts = await fetchExplorePagePosts(null, 0, INITIAL_SIZE, seed);
  } catch (e) {
    initialPosts = [];
  }

  return (
    <ExplorePageClient initialPosts={initialPosts} initialSeed={seed} />
  );
}
