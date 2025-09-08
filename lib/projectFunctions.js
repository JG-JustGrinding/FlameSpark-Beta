import { supabase } from "./supabaseClient";

export async function joinProject(userId, projectId) {

  const cannotJoin = await isUserJoinedOrOwner(userId, projectId);
  if (cannotJoin)
  {
    return;
  }

  const { data, error } = await supabase
    .from("project_members")
    .insert([{ user_id: userId, project_id: projectId }])
    .select();

  if (error) throw error;
  return data;
}

export async function leaveProject(userId, projectId) {
  const { data, error } = await supabase
    .from("project_members")
    .delete()
    .eq("user_id", userId)
    .eq("project_id", projectId);

  if (error) throw error;
  return data;
}

// Get all projects a user has joined
export async function getUserJoinedProjects(userId) {
  const { data, error } = await supabase
    .from("project_members")
    .select(`
      project_id,
      projects(
        id,
        title,
        tagline,
        cover_image,
        icon
      )
    `)
    .eq("user_id", userId);

  if (error) throw error;
  return data.map((row) => row.projects);
}

export async function isUserJoinedOrOwner(userId, projectId) {
    if (!userId)
    {
        return false;
    }

  const { data: projectData, error: projectError } = await supabase
    .from("projects")
    .select("owner_id")
    .eq("id", projectId)
    .single();

  if (projectError) throw projectError;
  if (projectData?.owner_id === userId) return true;

  const { count, error: memberError } = await supabase
    .from("project_members")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId)
    .eq("user_id", userId);

  if (memberError) throw memberError;
  return count > 0;
}

export async function isUserOwner(userId, projectId) {
    if (!userId)
    {
        return false;
    }

  const { data: projectData, error: projectError } = await supabase
    .from("projects")
    .select("owner_id")
    .eq("id", projectId)
    .single();

  if (projectError) throw projectError;
  return (projectData?.owner_id === userId);
}

export async function getProject(id) {
  const { data: project, error } = await supabase
  .from("projects")
  .select("*")
  .eq("id", id)
  .single();

  if (error)
  {
    throw error;
  }

  return project;
}

export async function createPost(projectId, title, description, content, is_pinned = false) {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error("Must be logged in");

    const { data, error } = await supabase
        .from("posts")
        .insert([
        {
            project_id: projectId,
            creator_id: user.id,
            title,
            description,
            content, // JSON array e.g. [{ postType: "text", content: "My first post" }]
            is_pinned,
        },
        ])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getProjectPosts(projectId) {
  const { data, error } = await supabase
    .from("posts")
    .select(`
      id, title, description, content, is_pinned, created_at,
      creator_id,
      projects ( id, title )
    `)
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}