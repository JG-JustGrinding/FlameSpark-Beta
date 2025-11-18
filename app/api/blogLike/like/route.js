import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { blogId, anonId } = await req.json();
    if (!blogId || !anonId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for") || "unknown";

    // Rate limit: prevent one IP from spamming
    const { count } = await supabase
      .from("blog_likes")
      .select("*", { count: "exact", head: true })
      .eq("ip_address", ip)
      .gte("created_at", new Date(Date.now() - 10 * 60 * 1000).toISOString());

    if (count >= 3) {
      return NextResponse.json({ blocked: true });
    }

    const { error } = await supabase.from("blog_likes").insert({
      blog_id: blogId,
      anon_id: anonId,
      ip_address: ip
    });

    if (error && error.code === "23505") {
      return NextResponse.json({ alreadyLiked: true });
    }

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}