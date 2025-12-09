import Header from "@/components/Header";
import UserClient from "./UserClient.jsx";
import { supabase } from "@/lib/supabaseClient.js";
import { getUser, getUserJoinedProjects } from "@/lib/projectFunctions";
import ErrorPage from "@/components/error.jsx";

export default async function UserPage({ params }) {
  const { id } = await params;
  let error = null;
  let user = null;
  let initialProjects = [];
  let initialJoinedProjects = [];
  let initialHasMoreCreated = true;
  let initialHasMoreJoined = true;
  const PAGE_SIZE = 10;
  let totalCreatedCount = 0;
  let totalJoinedCount = 0;

  try {
    if (!id) throw new Error("User ID is missing from the URL.");

    const { data: userData, error: userError } = await getUser(id);
    if (userError) throw userError;
    user = userData;

    const { data: projectData, error: projectError } = await supabase
      .from("projects")
      .select("id, title, tagline, description, tags, cover_image, icon")
      .eq("owner_id", id)
      .order("id", { ascending: false })
      .limit(PAGE_SIZE);
    if (projectError) throw projectError;
    initialProjects = projectData || [];

    // Determine hasMore for created
    const { count: createdCount } = await supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", id);
    totalCreatedCount = createdCount || 0;
    initialHasMoreCreated = totalCreatedCount > initialProjects.length;

    // Joined projects initial
    const joinedAll = await getUserJoinedProjects(id);
    initialJoinedProjects = joinedAll.slice(0, PAGE_SIZE);
    initialHasMoreJoined = joinedAll.length > initialJoinedProjects.length;
    totalJoinedCount = joinedAll.length;
  } catch (err) {
    error = err.message;
  }

  if (error) {
    return (
      <>
        <ErrorPage />
      </>
    );
  }

  return (
    <>
      <Header />
      <UserClient
        user={user}
        initialProjects={initialProjects}
        initialJoinedProjects={initialJoinedProjects}
        initialHasMoreCreated={initialHasMoreCreated}
        initialHasMoreJoined={initialHasMoreJoined}
        pageSize={PAGE_SIZE}
        userId={id}
        totalCreatedCount={totalCreatedCount}
        totalJoinedCount={totalJoinedCount}
      />
    </>
  );
}

export async function generateMetadata({ params }) {
  const { id } = await params;

  try {
    const { data: userData, error } = await getUser(id);

    if (error || !userData) throw error || new Error("User not found");

    return {
      title: `${userData.username ? userData.username : "No Username"} - Profile | FlameSpark`,
      description: `View ${userData.username ? userData.username : "No Username"}'s profile on FlameSpark. See their created projects, joined projects, and activity.`,
      openGraph: {
        title: `${userData.username ? userData.username : "No Username"} - Profile | FlameSpark`,
        description: `View ${userData.username ? userData.username : "No Username"}'s profile on FlameSpark. See their created projects, joined projects, and activity.`,
        url: `https://flamespark.com/user/${id}`,
        images: userData.avatar_url ? [userData.avatar_url] : undefined,
        type: "profile",
      },
      twitter: {
        card: "summary",
        title: `${userData.username ? userData.username : "No Username"} - Profile | FlameSpark`,
        description: `View ${userData.username ? userData.username : "No Username"}'s profile on FlameSpark.`,
        images: userData.avatar_url ? [userData.avatar_url] : undefined,
      },
    };
  } catch (err) {
    return {
      title: `User Not Found | FlameSpark`,
      description: `The requested user does not exist.`,
    };
  }
}
