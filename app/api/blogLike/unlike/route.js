import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  const { blogId, anonId } = await req.json();

  const { error } = await supabase
    .from("blog_likes")
    .delete()
    .eq("blog_id", blogId)
    .eq("anon_id", anonId);

  if (error) return NextResponse.json({ error }, { status: 400 });

  return NextResponse.json({ success: true });
}