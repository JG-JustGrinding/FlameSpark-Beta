export const dynamic = 'force-dynamic';

import ErrorPage from "@/components/error";
import Unauthorized from "@/components/Unauthorized";
import { supabaseServerClient } from "@/lib/supabaseServerClient.js";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children, params }) {
  const supabase = await supabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Unauthorized/>
    )
  }

  // Fetch project owner and authorize
  const {id: projectId} = await params;
  if (!projectId) {
    return <ErrorPage/>;
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("owner_id, is_completed")
    .eq("id", projectId)
    .single();

  if (projectError || !project) {
    return <ErrorPage/>;
  }

  if (project.is_completed) {
    redirect(`/project/${projectId}`);
  }

  if (project.owner_id !== user.id) {
    return <Unauthorized/>;
  }

  return children;
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const supabase = await supabaseServerClient();

  try {
    const { data: projectData, error: projectError } = await supabase
      .from("projects")
      .select("title, tagline, cover_image")
      .eq("id", id)
      .single();
    if (projectError) throw projectError;
    const image = projectData?.cover_image || `${process.env.DOMAIN_NAME}/flamespark_banner_alt.png`;
    return {
      title: `Dashboard - ${projectData.title} | FlameSpark`,
      description: projectData.tagline || `Manage and make changes to your project on FlameSpark.`,
      robots: { index: false, follow: false },
      alternates: { canonical: `${process.env.DOMAIN_NAME}/project/${id}/dashboard` },
    };
  }
  catch (e) {
    console.error("Failed to fetch project metadata", e);
    return {
      title: "Project Dashboard - FlameSpark",
      robots: { index: false, follow: false },
    };
  }
}