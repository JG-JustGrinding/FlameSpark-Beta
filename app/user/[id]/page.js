import Header from "@/components/Header";
import UserClient from "./UserClient.jsx";
import { supabase } from "@/lib/supabaseClient.js";
import { getUser, getUserJoinedProjects } from "@/lib/projectFunctions";
import ErrorPage from "@/components/error.jsx";

export default async function UserPage({ params }) {
  const { id } = await params;
  let error = null;
  let user = null;
  let projects = [];
  let joinedProjects = [];

  try {
    if (!id) throw new Error("User ID is missing from the URL.");

    const { data: userData, error: userError } = await getUser(id);
    if (userError) throw userError;
    user = userData;

    const { data: projectData, error: projectError } = await supabase
      .from("projects")
      .select("id, title, tagline, description, tags, cover_image, icon")
      .eq("owner_id", id);
    if (projectError) throw projectError;
    projects = projectData || [];

    joinedProjects = await getUserJoinedProjects(id);
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
      <UserClient user={user} projects={projects} joinedProjects={joinedProjects} />
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
