import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const blogId = url.searchParams.get("blogId");
    const anonId = url.searchParams.get("anonId");

    if (!blogId || !anonId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("blog_likes")
      .select("*")
      .eq("blog_id", blogId)
      .eq("anon_id", anonId)
      .limit(1);

    if (error) return NextResponse.json({ error }, { status: 400 });

    return NextResponse.json({ liked: data.length > 0 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
