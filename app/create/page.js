import CreatePageClient from "./CreatePageClient";
import { supabaseServerClient } from "@/lib/supabaseServerClient";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Create a Project - FlameSpark",
  description: "Start a new project on FlameSpark: add a title, tagline, description, tags, and media to begin sharing your journey.",
  robots: {
    index: false,
    follow: false
  }
};

export default async function CreatePage(){
  const supabase = await supabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  return (
    <CreatePageClient initialUser={user} />
  );
}