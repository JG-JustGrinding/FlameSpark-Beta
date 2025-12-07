import Header from "@/components/Header";
import UserClient from "./UserClient.jsx";
import { supabase } from "@/lib/supabaseClient.js";
import { getUser, getUserJoinedProjects } from "@/lib/projectFunctions";

export default async function UserPage({ params }) {
  const { id } = params;
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

  return (
    <>
      <Header />
      {error && <span className="error-message bodyFont">{error}</span>}
      <UserClient user={user} projects={projects} joinedProjects={joinedProjects} />
    </>
  );
}