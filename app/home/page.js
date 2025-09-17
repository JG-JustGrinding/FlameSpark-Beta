"use client";

import { useRef, useState } from "react";
import PrimaryPageLayout from "@/components/PrimaryPageLayout";
import "@/styles/ProjectPost.css";
import "@/styles/Home.css";
import HomePagePost from "@/components/HomePagePost";
import { fetchHomePagePosts } from "@/lib/projectFunctions";
import { Paginator } from "@/lib/infinitePostFeed";
import { useUser } from "@/lib/useUser";

export default function Home() {
    const { user, userSet } = useUser();
    const seedRef = useRef(Math.floor(Math.random() * 1000000)); // random integer seed
    const seed = seedRef.current;
    const [noItems, setNoItems] = useState(false);

    function PostTypeClass(postType, contentLength) {
        if (contentLength > 1) {
            return "multi-content-post";
        }

        return postType;
    }

  return (
    <PrimaryPageLayout title="Home" description="Get updates on followed projects">
        <div className="home-content">
            
            {((userSet && !user) || noItems) && <div className="nothing-container">
                <div className="nothing-here-message">
                    <div className="text">
                        <h1 className="nothing-title titleFont bold">Nothing Here... Yet</h1>
                        <span className="body bodyFont">Join some projects to support them and see their latest updates here!</span>
                    </div>
                    <a href="/"><button className="button-shape discover-button bodyFont">Go to Discover Page</button></a>
                </div>
            </div>}
                
            {(userSet && user && !noItems) &&
             <div className="post-row">
                <Paginator fetchFunction={fetchHomePagePosts} updateNoItems={setNoItems} limit={6} filter={seed} projectId={user?.id} noneFoundMessage=""
                noMoreObject={
                                <div className="bodyFont bold paginator-no-more" style={{ padding: "20px", textAlign: "center" }}>
                                    {"No more posts. Join more projects or wait for more updates for more!"}
                                    <a href="/"><button className="button-shape discover-button bodyFont">Go to Discover Page</button></a>
                                </div>
                            }
                renderItem={(post, idx) => (
                    <HomePagePost key={idx || post.post_id} className={PostTypeClass(post.post_content[0]?.contentType, post.post_content?.length)} title={post.post_title} description={post.post_description} postContent={post.post_content} projectIcon={post.project_icon} projectName={post.project_title} projectId={post.project_ide || post.project_id} dateCreated={post.post_created_at}></HomePagePost>  
                )} />
            </div>
}
        </div>
    </PrimaryPageLayout>
  );
}
