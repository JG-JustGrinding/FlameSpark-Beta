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

export async function isUserJoined(userId, projectId) {
    if (!userId)
    {
        return false;
    }

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

export async function editPost(postId, title, description) {
    const { data, error } = await supabase
    .from('posts')
    .update({ title, description })
    .eq('id', postId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deletePost (postId) {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error("Must be logged in");

    const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId);

    if (error) {
      throw error;
    }

    return true;
}

export async function ratePost(postId, userId, value)
{
    const { error } = await supabase.rpc('toggle_rate', {
    p_user_id: userId,
    p_post_id: postId,
    p_value: value,
  });

  if (error) throw error;
}

export async function getPostRating(postId)
{
    const { data: ratingData, error: ratingError } = await supabase
    .rpc('get_post_rating', { p_post_id: postId });

    if (ratingError) throw ratingError;

    return ratingData;
}

export async function getUserRating(postId)
{
    const { data: ratingData, error: ratingError } = await supabase
    .rpc('get_user_rating', { p_post_id: postId });

    if (ratingError) throw ratingError;

    return ratingData;
}

export async function getProjectPosts(projectId, filter = "") {
  const Oldest = filter === "Oldest";

  const { data, error } = await supabase
    .from("posts")
    .select(`
      id, title, description, content, is_pinned, created_at, was_edited,
      creator_id,
      projects ( id, title )
    `)
    .eq("project_id", projectId)
    .order("is_pinned", { ascending: false })
    .order("pinned_at", { ascending: false, nullsLast: true })
    .order("created_at", { ascending: Oldest })

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
      id, title, description, content, is_pinned, created_at, was_edited,
      creator_id,
      projects ( id, title )
    `)
    .eq("project_id", projectId)
    .order("is_pinned", { ascending: false })
    .order("pinned_at", { ascending: false, nullsLast: true })
    .order("created_at", { ascending: Oldest })
    .range(from, to);

  if (error) {
    console.log(error);
    return [];
  }

  return data;
}

export async function fetchRandomProjects(count, excluded_projects)
{
    const { data, error } = await supabase.rpc("get_random_projects", { limit_count: count, excluded_projects });

    if (error) {
      throw error;
    }

    return data;
}

export async function fetchHomePagePosts(userId, currentPage, postCount, misc) { // just following the infinitePostFeed Paginator format
    try {
    // get_home_posts or get_home_posts_proj_rand (proj_rand chooses a random project before selecting the post)
    const { data, error } = await supabase.rpc("get_home_posts", {
      user_uuid: userId,
      page_limit: postCount,
      page_offset: currentPage * postCount,
      seed: misc
    });

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Error fetching homepage posts:", err.message);
    return [];
  }
}

export async function fetchExplorePagePosts(userId, currentPage, postCount, seed) {
  try {
      const { data, error } = await supabase.rpc("get_explore_posts", {
      page_limit: postCount,
      page_offset: currentPage * postCount,
      seed: seed
    });

    if (error) throw error;
    return data;
  } catch (err) {
    console.log(err);
    return[];
  }
}

export async function getUser(id) {
  const { data, error } = await supabase
  .from("profiles")
  .select("id, username, avatar_url, bio, interests")
  .eq("id", id)
  .single();

  return { data, error }
}

export async function search(searchQuery, currentPage, itemCount, filter = null) {
  if (!searchQuery || searchQuery.trim() === "") return [];

  const offset = currentPage * itemCount;
  const q = searchQuery.toLowerCase();

  try {
    // Fetch users
    let { data: userData = [], error: userError } = await supabase
      .from("profiles")
      .select("id, username, avatar_url, bio, interests")
      .ilike("username", `%${q}%`);

    if (userError) throw userError;

    // Fetch projects
    let { data: projectData = [], error: projectError } = await supabase
      .from("projects")
      .select("id, title, tagline, cover_image, tags, icon, description, owner_id")
      .or(`title.ilike.%${q}%,description.ilike.%${q}%,tags.cs.{${q.replace(/[{}"]/g, "")}}`)

    if (projectError) throw projectError;

    // Apply optional filter
    let users = (filter == "users" || filter == "all") ? userData : [];
    let projects = (filter == "projects" || filter == "all") ? projectData : [];

    // Add type
    users = users.map(u => ({ ...u, type: "user" }));
    projects = projects.map(p => ({ ...p, type: "project" }));

    // Combine
    let combined = [...users, ...projects];

    // Sort by relevance
    combined = combined.sort((a, b) => getRelevanceScore(b, q) - getRelevanceScore(a, q));

    // Apply pagination
    const paginated = combined.slice(offset, offset + itemCount);

    return paginated;

  } catch (err) {
    console.error("Search error:", err);
    return [];
  }
}

function getRelevanceScore(item, query) {
  if (item.type === "user") {
    const username = (item.username || "").toLowerCase();
    const bio = (item.bio || "").toLowerCase();
    if (username === query) return 100;
    if (username.includes(query)) return 70;
    if (bio.includes(query)) return 50;
    return 10;
  }

  if (item.type === "project") {
    const title = (item.title || "").toLowerCase();
    const tagline = (item.tagline || "").toLowerCase();
    const tags = (Array.isArray(item.tags) ? item.tags.join(" ") : "").toLowerCase();
    if (title === query) return 100;
    if (title.includes(query)) return 80;
    if (tags.includes(query)) return 70;
    if (tagline.includes(query)) return 50;
    return 10;
  }

  return 0;
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