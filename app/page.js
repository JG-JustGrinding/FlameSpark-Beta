export const dynamic = 'force-dynamic';

import DiscoverClient from "./DiscoverClient";
import { createServerClient } from "@/lib/supabaseServerClient";
import PrimaryPageLayout from "@/components/PrimaryPageLayout";

import { supabase } from "@/lib/supabaseClient.js";

export const metadata = {
  title: "FlameSpark",
  description:
    "Discover new projects on FlameSpark. Support creators, follow their journeys, and join amazing communities of upcoming creations.",
  alternates: {
    canonical: `${process.env.DOMAIN_NAME}/`,
  },
  openGraph: {
    title: "FlameSpark",
    description:
      "Discover new projects on FlameSpark. Support creators, follow their journeys, and join amazing communities of upcoming creations.",
    url: `${process.env.DOMAIN_NAME}/`,
    siteName: "FlameSpark",
    type: "website",
    images: [`${process.env.DOMAIN_NAME}/flamespark_banner.png`],
  },
  twitter: {
    title: "FlameSpark",
    description:
      "Discover new projects on FlameSpark. Support creators, follow their journeys, and join amazing communities of upcoming creations.",
    images: [`${process.env.DOMAIN_NAME}/flamespark_banner.png`],
  },
};

export default async function Discover() {
  const INITIAL_PAGE_SIZE = 20;
  let initialProjects = [];
  let errorMessage = "";
  let initialHasMore = true;

  try {
    const { data, error } = await supabase.rpc("get_random_projects", { limit_count: INITIAL_PAGE_SIZE });
    if (error) {
      errorMessage = "Failed to load projects.";
    } else {
      initialProjects = data || [];
      if (!data || data.length < INITIAL_PAGE_SIZE) {
        initialHasMore = false;
      }
    }
  } catch (e) {
    errorMessage = "Failed to load projects.";
  }

  return (
    <PrimaryPageLayout title="Discover" description="Find amazing new projects to be part of">
      <DiscoverClient initialProjects={initialProjects} initialError={errorMessage} initialHasMore={initialHasMore} />
    </PrimaryPageLayout>
  );
}
