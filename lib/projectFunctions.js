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

// project stats
export async function getProjectViews(id) {
  const { count, error } = await supabase
    .from('project_views')
    .select('user_id', { count: 'exact', head: true })
    .eq('project_id', id);

  if (error) {
    throw error;
  }

  return count ?? 0;
}

export async function getProjectSupporters(id) {
  const { count, error } = await supabase
    .from('project_members')
    .select('user_id', { count: 'exact', head: true })
    .eq('project_id', id);

  if (error) {
    throw error;
  }

  return count ?? 0;
}

export async function getProjectPostCount(id) {
  const { count, error } = await supabase
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .eq('project_id', id);

  if (error) {
    throw error;
  }

  return count ?? 0;
}

export async function getProjectLikeDislikeCounts(id) {
  const { data, error } = await supabase
    .rpc('get_project_like_dislike_counts', { p_project_id: id });

  if (error) throw error;

  // ex: [{ likes: 10, dislikes: 2 }]
  return data?.[0] ?? { likes: 0, dislikes: 0 };
}

export async function getProjectAvgPostInterval(projectId) {
  const { data, error } = await supabase
    .rpc('get_project_avg_post_interval', { p_project_id: projectId });

  if (error) throw error;

  return data ?? null;
}

export async function getPost(id) {
  const { data, error } = await supabase
  .from("posts")
  .select("*")
  .eq("id", id)
  .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function createPost(projectId, title, description, content, is_pinned = false) {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error("Must be logged in");

    let pollIds = [];

    for (const element of content) {
      if (element.contentType === "poll") {
        // create poll; pass null for post_id now, link it later
        const { data: pollId, error: pollError } = await createPoll(element.content, null)

        if (pollError) throw pollError;

        pollIds.push(pollId);

        // replace the poll content with the poll ID
        element.content = pollId;
      }
    }

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

        console.log(pollIds);

      // update polls with the project's id
      for (const pollId of pollIds) {
        const { error: updateError } = await supabase
          .from("polls")
          .update({ post_id: data.id })
          .eq("id", pollId);

        if (updateError) throw updateError;
      }

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

  // fetch post to verify ownership and to inspect content
  const post = await getPost(postId);

  // only post creator or project owner may delete
  const isOwner = await isUserOwner(user.id, post.project_id);
  if (post.creator_id !== user.id && !isOwner) {
    throw new Error("Not authorized to delete this post");
  }

  // helper: extract storage file path from a Supabase public url
  function extractStoragePath(publicUrl) {
    try {
      if (!publicUrl) return null;
      const u = new URL(publicUrl);
      // path like: /storage/v1/object/public/<bucket>/<path>
      const seg = '/storage/v1/object/public/';
      const idx = u.pathname.indexOf(seg);
      if (idx !== -1) {
        const after = u.pathname.slice(idx + seg.length); // <bucket>/<path>
        // remove bucket segment
        const parts = after.split('/');
        if (parts.length <= 1) return null;
        parts.shift(); // remove bucket
        return parts.join('/');
      }

      // fallback: if the url contains '/posts/' assume everything after that is the file path
      const alt = u.pathname.indexOf('/posts/');
      if (alt !== -1) {
        return u.pathname.slice(alt + '/posts/'.length);
      }

      return null;
    } catch (e) {
      return null;
    }
  }

  // collect file paths to delete
  const pathsToDelete = new Set();

  try {
    const content = post.content || [];
    for (const part of content) {
      if (!part) continue;
      const t = part.contentType;
      const c = part.content;

      if (t === 'image' && Array.isArray(c)) {
        for (const url of c) {
          const p = extractStoragePath(url);
          if (p) pathsToDelete.add(p);
        }
      }

      if (t === 'audio' && typeof c === 'string') {
        const p = extractStoragePath(c);
        if (p) pathsToDelete.add(p);
      }

      // if there are other content types that store files in storage, add them here
      if (t === 'file' && typeof c === 'string') {
        const p = extractStoragePath(c);
        if (p) pathsToDelete.add(p);
      }
    }

    // delete files from storage (posts bucket)
    for (const p of pathsToDelete) {
      try {
        await deletePostFile(p);
      } catch (err) {
        // log and continue deleting other files
        console.warn('Failed to delete storage file', p, err?.message || err);
      }
    }

    // delete polls associated with this post (if any)
    const { error: pollErr } = await supabase.from('polls').delete().eq('post_id', postId);
    if (pollErr) {
      // not fatal, but notify
      console.warn('Failed to delete polls for post', postId, pollErr.message || pollErr);
    }

    // delete comments for this post
    const { error: commentsErr } = await supabase.from('comments').delete().eq('post_id', postId);
    if (commentsErr) {
      console.warn('Failed to delete comments for post', postId, commentsErr.message || commentsErr);
    }

    // finally delete the post row
    const { error: postErr } = await supabase.from('posts').delete().eq('id', postId);
    if (postErr) throw postErr;

    return true;
  } catch (err) {
    throw err;
  }
}

export async function ratePost(postId, userId, value)
{
  if (!userId)
  {
    const err = new Error("Not logged in");
    err.notLoggedIn = true;
    throw err;
  }

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
    const { data, error } = await supabase.rpc("get_project_posts", {
    p_project_id: projectId,
    p_page: page,
    p_page_size: pageSize,
    p_filter: filter,
  });

  if (error) {
    console.log(error);
    return [];
  }

  return data;

  //OLD
  const from = page * pageSize;
  const to = from + pageSize - 1;
  const Oldest = filter === "Oldest";

  const { data: d, error: e } = await supabase
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

export async function GetProjectPostsForChart(request) {
  const { searchParams } = new URL(request.url);
  const range = searchParams.get('range') || 'week';

  // Example: fetch from your database here
  // Hardcoded demo data
  const data = {
    day: [
      { label: 'Mon', count: 2 },
      { label: 'Tue', count: 3 },
      { label: 'Wed', count: 5 },
      { label: 'Thu', count: 1 },
      { label: 'Fri', count: 4 },
    ],
    week: [
      { label: 'Week 1', count: 12 },
      { label: 'Week 2', count: 9 },
      { label: 'Week 3', count: 15 },
    ],
  };

  return NextResponse.json(data[range] || []);
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

export async function fetchProjectPageOtherPosts(postId, projectId, currentPage, postCount, seed) {
  try {
      const { data, error } = await supabase.rpc("get_project_page_other_posts", {
      excluded_post_id: postId,
      preferred_project_id: projectId, // project id the user is currently on
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

export async function getPostCommentCount(postId) {
  const { count, error } = await supabase
  .from('comments')
  .select('*', { count: 'exact', head: true })
  .eq('post_id', postId);

  if (error) {
    throw error;
  }

  return count ?? 0;
}

export async function createComment(postId, userId, content, parentId = null) {
  const { data, error } = await supabase.rpc("create_post_comment", {
    p_post_id: postId,
    p_user_id: userId,
    p_content: content,
    p_parent_id: parentId,
  });

  if (error) throw error;
  return data[0]; // single comment
}

export async function fetchComments(postId, page, pageSize, filter = "") {
  const { data, error } = await supabase.rpc("get_post_comments", {
    p_post_id: postId,
    p_page: page,
    p_page_size: pageSize,
    p_filter: "",
  });

  if (error) {
    throw error;
  }
  
  return data;
}

export async function fetchReplyCount(commentId) {
  const { data, error } = await supabase.rpc("get_comment_reply_count", {
    p_comment_id: commentId,
  });

  if (error) throw error;
  return data;
}

export async function fetchReplies(commentId, page, pageSize) {
  const { data, error } = await supabase.rpc("get_comment_replies", {
    p_comment_id: commentId,
    p_page: page,
    p_page_size: pageSize,
  });

  if (error) throw error;

  return data;
}

export async function createPoll(options, postId = null) {
  const {data, error} = await supabase.rpc("create_poll", {
    p_options: options,
    p_post_id: postId
  });

  return { data, error };
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

export function getLikeRatio(likes, dislikes) {
  // Ensure numbers are non-negative
  likes = Math.max(0, likes);
  dislikes = Math.max(0, dislikes);

  const total = likes + dislikes;

  // If no reactions, return 0%
  if (total === 0) return 0;

  return (likes / total) * 100;
}

export function getLikeDislikePercent(likes, dislikes) {
  // Ensure numbers are non-negative
  likes = Math.max(0, likes);
  dislikes = Math.max(0, dislikes);

  const total = likes + dislikes;

  // If no reactions, return 0%
  if (total === 0) return 0;

  const score = ((likes - dislikes) / total) * 100;
  return score;
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

export function formatInterval(intervalStr) {
  if (!intervalStr) return null;

  // Example input: "3 days 04:12:00" or "04:12:00"
  const match = intervalStr.match(/(?:(\d+) days )?(\d+):(\d+):(\d+)/);
  if (!match) return null;

  const days = parseInt(match[1] || "0", 10);
  const hours = parseInt(match[2], 10);
  const minutes = parseInt(match[3], 10);
  const seconds = parseInt(match[4], 10);

  const totalSeconds = days * 86400 + hours * 3600 + minutes * 60 + seconds;

  if (totalSeconds < 60) {
    return `${totalSeconds} second${totalSeconds !== 1 ? "s" : ""}`;
  } else if (totalSeconds < 3600) {
    const mins = Math.floor(totalSeconds / 60);
    return `${mins} minute${mins !== 1 ? "s" : ""}`;
  } else if (totalSeconds < 86400) {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  } else {
    const d = Math.floor(totalSeconds / 86400);
    const hrs = Math.floor((totalSeconds % 86400) / 3600);
    return hrs > 0 ? `${d}d ${hrs}h` : `${d}d`;
  }
}

export function shortenNumber(num) {
  if (num == 0)
  {
    return "0";
  }

  if (!num)
  {
    return "";
  }

  const abs = Math.abs(num);
  if (abs < 1000) return num.toString();

  const units = ["", "k", "M", "B", "T"];
  const order = Math.floor(Math.log10(abs) / 3);
  const divisor = Math.pow(1000, order);
  const short = Math.trunc((abs / divisor) * 10) / 10; // truncate to 1 decimal

  const sign = num < 0 ? "-" : "";
  return sign + (short % 1 === 0 ? short.toFixed(0) : short) + units[order];
}

export function truncate(num, decimals = 0, fixed = false) {
  const factor = Math.pow(10, decimals);
  const truncated = Math.trunc(num * factor) / factor;
  return fixed ? truncated.toFixed(decimals) : truncated;
}