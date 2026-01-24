export const dynamic = 'force-dynamic';

import ExplorePageClient from "./ExplorePageClient";
import { fetchExplorePagePostsNew } from "@/lib/projectFunctions";
import { supabaseServerClient } from "@/lib/supabaseServerClient.js";

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
		url: `${process.env.DOMAIN_NAME}/explore`,
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
	const supabase = await supabaseServerClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	let id = user ? user.id : null;

	const seed = Math.random() * 2 - 1;
	const INITIAL_SIZE = 10;
	let initialPosts = [];
	try {
		initialPosts = await fetchExplorePagePostsNew(id, 0, INITIAL_SIZE, seed);
	} catch (e) {
		initialPosts = [];
	}

	return (
		<ExplorePageClient initialPosts={initialPosts} initialSeed={seed} pageSize={INITIAL_SIZE} userId={id} />
	);
}
