import ProjectPageClient from "./ProjectPageClient";
import CompletedProject from "@/components/CompletedProject";
import ErrorPage from "@/components/error.jsx";
import Header from "@/components/Header";
import { getProject, isUserJoined, getUser, fetchRandomProjects, fetchPosts } from "@/lib/projectFunctions";
import { supabaseServerClient } from "@/lib/supabaseServerClient.js";

export default async function ProjectPage({ params }) {
    const { id } = await params;
    let project = null;
    let otherProjects = [];
    let isOwner = false;
    let hasJoined = false;
    const pageSize = 10;
    const filters = ["Recent", "Oldest", "Top"];

    let initialPosts = [];

    let owner = null;
    let allowIgnoreComplete = false;
    let ignoreComplete = false;

    if (!id) {
        return <ErrorPage />;
    }

    try {
        project = await getProject(id);
        const supabase = await supabaseServerClient();

        if (!project) {
            return <ErrorPage />;
        }

        if (project?.is_completed) {

            const { data } = await getUser(project.owner_id);

            owner = data;

            return (
                <>
                    <Header/>
                    <CompletedProject project={{id, title: project?.title, icon: project?.icon}} creator={{id: project?.owner_id, username: owner?.username, avatar_url: owner?.avatar_url}} messageTitle={project?.completion_message_title} messageBody={project?.completion_message} links={project?.completion_links} allowIgnoreComplete={allowIgnoreComplete}/>
                </>
            );
        }

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (user && project.owner_id === user.id) {
            isOwner = true;
        }

        if (user) {
            hasJoined = await isUserJoined(user.id, id);
        }

        otherProjects = await fetchRandomProjects(10, [id]);

        initialPosts = await fetchPosts(id, 0, pageSize, filters[0]);

        return (
            <>
                <ProjectPageClient
                    project={project}
                    isOwner={isOwner}
                    hasJoined={hasJoined}
                    otherProjects={otherProjects}
                    pageSize={pageSize}
                    filters={filters}
                    initialPosts={initialPosts}
                />
            </>
        );
    } catch (e) {
        return <ErrorPage />;
    }
}

export async function generateMetadata({ params }) {
    const { id } = await params;
    try {
        const project = await getProject(id);
        if (!project) throw new Error("Project not found");

        return {
            title: `${project.title} - FlameSpark`,
            description: project.tagline || project.description?.slice(0, 160) || `Check out the project '${project.title}' on FlameSpark.`,
            openGraph: {
                title: `${project.title} - FlameSpark`,
                description: project.tagline || project.description?.slice(0, 160) || `Check out the project '${project.title}' on FlameSpark.`,
                type: "website",
                url: `${process.env.DOMAIN_NAME}/project/${id}`,
                images: [{ url: project.cover_image || project.icon || `${process.env.DOMAIN_NAME}/flamespark_banner_alt.png` }],
                width: 1200,
                height: 630,
            },
            twitter: {
                card: "summary_large_image",
                title: `${project.title} - FlameSpark`,
                description: project.tagline || project.description?.slice(0, 160) || `Check out the project '${project.title}' on FlameSpark.`,
                images: [project.cover_image || project.icon || `${process.env.DOMAIN_NAME}/flamespark_banner_alt.png`],
            },
            alternates: {
                canonical: `${process.env.DOMAIN_NAME}/project/${id}`,
            },
        };
    } catch {
        return {
            title: "Project - FlameSpark",
            description: "View this project on FlameSpark.",
            robots: { index: false, follow: true }
        };
    }
}