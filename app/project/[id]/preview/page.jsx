import Header from "@/components/Header";
import { getUser } from "@/lib/projectFunctions";
import PreviewClient from "./PreviewClient.jsx";
import ErrorPage from "@/components/error.jsx";
import { supabase } from "@/lib/supabaseClient.js";

export async function generateMetadata({ params }) {
  const { id } = await params;
  
  if (!id) {
    return {
      title: "Project Preview - FlameSpark",
      robots: { index: false, follow: true },
    };
  }

  try {
    const { data: project } = await supabase
      .from("projects")
      .select("title, tagline, description, cover_image")
      .eq("id", id)
      .single();

    const title = project?.title
      ? `${project.title} - Preview | FlameSpark`
      : "Project Preview - FlameSpark";
    const descSource = project?.tagline || project?.description || "Preview this project on FlameSpark.";
    const description = typeof descSource === "string" ? descSource.slice(0, 160) : "Preview this project on FlameSpark.";
    const image = project?.cover_image || project?.icon || `${process.env.DOMAIN_NAME}/flamespark_banner_alt.png`;

    return {
      title,
      description,
      robots: { index: true, follow: true },
      alternates: { canonical: `${process.env.DOMAIN_NAME}/project/${id}/preview` },
      openGraph: {
        title,
        description,
        type: "article",
        url: `${process.env.DOMAIN_NAME}/project/${id}/preview`,
        images: [{ url: image }],
        width: 1200,
        height: 630,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [image],
      },
    };
  } catch {
    return {
      title: "Project Preview - FlameSpark",
      robots: { index: false, follow: true },
    };
  }
}

export default async function ProjectPreview({ params }){
  const { id } = await params;
  let project = null;
  let previewMedia = [];
  let creatorInfo = null;

  if (!id) {
      return (
        <>
          <ErrorPage />
        </>
      );
  }

      try {
        const { supabase } = await import("@/lib/supabaseClient");
        const { data: projectData, error: projectError } = await supabase
          .from("projects")
          .select("id, owner_id, title, tagline, description, tags, cover_image, icon")
          .eq("id", id)
          .single();
        if (projectError) throw projectError;

        project = projectData;

        const { data: mediaData, error: mediaError } = await supabase
          .from("project_media")
          .select("url, type, order_index")
          .eq("project_id", id)
          .eq("is_preview", true)
          .order("order_index", { ascending: true });
        if (mediaError) throw mediaError;

        const mainItem = { url: projectData.cover_image };
        previewMedia = [mainItem, ...(mediaData || [])];

        const { data: userData, error: userError } = await getUser(projectData.owner_id);
        if (userError) throw userError;
        creatorInfo = userData;
      } catch (err) {
        return (
          <>
            <ErrorPage />
          </>
        );
      }

    return (
        <>
            <Header />
            <PreviewClient id={id} project={project} previewMedia={previewMedia} creatorInfo={creatorInfo} />
        </>
    );
}

