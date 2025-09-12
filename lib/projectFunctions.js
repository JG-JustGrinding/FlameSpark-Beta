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
            content, // JSON array e.g. [{ contentType: "text", content: "My first post" }]
            is_pinned,
        },
        ])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getProjectPosts(projectId, filter = "") {
  const Oldest = filter === "Oldest";

  const { data, error } = await supabase
    .from("posts")
    .select(`
      id, title, description, content, is_pinned, created_at,
      creator_id,
      projects ( id, title )
    `)
    .eq("project_id", projectId)
    .order("created_at", { ascending: Oldest });

  if (error) throw error;
  return data;
}


export async function fetchPosts(projectId, page, pageSize, filter = "") {
  const from = page * pageSize;
  const to = from + pageSize - 1;
  const Oldest = filter === "Oldest";

  const { data, error } = await supabase
    .from("posts")
    .select(`
      id, title, description, content, is_pinned, created_at,
      creator_id,
      projects ( id, title )
    `)
    .eq("project_id", projectId)
    .order("created_at", { ascending: Oldest })
    .range(from, to);

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}

export function extractYouTubeId (url) {
  try {
    const parsed = new URL(url);

    if (parsed.hostname === "youtu.be") {
      // Short link format
      return parsed.pathname.slice(1); // remove leading "/"
    }

    if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname === "/watch") {
        // Normal watch link
        return parsed.searchParams.get("v");
      }

      if (parsed.pathname.startsWith("/embed/")) {
        // Already an embed link
        return parsed.pathname.split("/embed/")[1];
      }
    }
  } catch {
    return null;
  }
  return null;
};


export async function uploadPostFile(file, projectId, MBlimit = 2, limitErrorMessage = "File is too large to upload") { // limit is in mb
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error("Must be logged in");

  if (file.size > MBlimit * 1024 * 1024) {
    throw new Error(limitErrorMessage);
  }

  const fileExt = file.name.split(".").pop();
  const filePath = `${projectId}/${Date.now()}.${fileExt}`;

  const { error } = await supabase.storage
    .from("posts")
    .upload(filePath, file);

  if (error) throw error;

  // Get public URL
  const { data } = supabase.storage.from("posts").getPublicUrl(filePath);

  return { uploadedUrl: data.publicUrl, filePath };
};

export async function deletePostFile(filePath) {
  const { error } = await supabase.storage.from("posts").remove([filePath]);
  if (error) throw error;
}

export function timeAgo(date) {
  const now = new Date();
  const past = new Date(date);
  const diffInMs = now - past;
  const diffInSec = Math.floor(diffInMs / 1000);

  const mins = Math.floor(diffInSec / 60);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (diffInSec < 60) {
    return `${diffInSec} second${diffInSec !== 1 ? 's' : ''} ago`;
  }

  if (mins < 60) {
    return `${mins} minute${mins !== 1 ? 's' : ''} ago`;
  }

  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }

  return `${days} day${days !== 1 ? 's' : ''} ago`;
}