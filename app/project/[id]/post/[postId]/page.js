import PostPageClient from "./PostPageClient.jsx";
import ErrorPage from "@/components/error.jsx";
import { getPost, getProject, fetchProjectPageOtherPosts, getPostRating } from "@/lib/projectFunctions";

export default async function PostPage({ params }) {
    const { id, postId } = await params;
    let post = null;
    let project = null;
    let otherPosts = [];
    let seed = 0;

    if (!id || !postId) {
        return <ErrorPage />;
    }

    try {
        project = await getProject(id);
        post = await getPost(postId);

        if (!project || !post || post.project_id !== project.id) {
            return <ErrorPage />;
        }

        // Random seed per request; passed to client to remain stable during session
        seed = Math.random() * 2 - 1;
        otherPosts = await fetchProjectPageOtherPosts(postId, id, 0, 5, seed);

        return (
            <>
                <PostPageClient id={id} postId={postId} post={post} project={project} seed={seed} otherPostsState={otherPosts} />
            </>
        );
    } catch (e) {
        return <ErrorPage />;
    }
}

export async function generateMetadata({ params }) {
    const { id, postId } = await params;
    try {
        const post = await getPost(postId);
        const project = await getProject(id);
        if (!post) throw new Error("Post not found");

        if (!project || post.project_id !== project.id)
            throw new Error("Post not found");
        return {
            title: `${post.title || "Untitled Post"} - ${project.title} | FlameSpark`,
            description: post.description?.slice(0, 160) || `View ${(post?.title ? `'${post.title}'` : "this post")} on FlameSpark.`,
            openGraph: {
                title: `${post.title || "Untitled Post"} - ${project.title} | FlameSpark`,
                description: post.description?.slice(0, 160) || `View ${(post?.title ? `'${post.title}'` : "this post")} on FlameSpark.`,
                type: "article",
                url: `${process.env.DOMAIN_NAME}/project/${id}/post/${postId}`,
                images: [{ url: project.cover_image || project.icon || `${process.env.DOMAIN_NAME}/flamespark_banner_alt.png` }],
                width: 1200,
                height: 630,
            },
                twitter: {
                card: "summary_large_image",
                title: `${post.title || "Untitled Post"} - ${project.title} | FlameSpark`,
                description: post.description?.slice(0, 160) || `View ${(post?.title ? `'${post.title}'` : "this post")} on FlameSpark.`,
                images: [project.cover_image || project.icon || `${process.env.DOMAIN_NAME}/flamespark_banner_alt.png`],
            },
            alternates: {
                canonical: `${process.env.DOMAIN_NAME}/project/${id}/post/${postId}`,
            },
        };
    } catch {
        return {
            title: "Post Not Found | FlameSpark",
            description: "The requested post could not be found :(",
            robots: { index: false, follow: true },
        };
    }
}