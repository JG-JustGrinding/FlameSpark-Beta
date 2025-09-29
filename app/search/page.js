"use client";

import { useState } from "react";
import PrimaryPageLayout from "@/components/PrimaryPageLayout";
import PrimaryProject from "@/components/PrimaryProject";
import "@/styles/SearchPage.css";
import { search } from "@/lib/projectFunctions";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/lib/useUser";
import { Paginator } from "@/lib/infinitePostFeed";

export default function Search() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const query = searchParams.get("q") || "";
    const [searchQuery, setSearchQuery] = useState(query);
    const [loading, setLoading] = useState(false);
    const [itemCount, setItemCount] = useState("0");
    const [filter, setFilter] = useState("all");
    
    if (!query)
    {
        //router.push("/");
    }
  
    return (
        <PrimaryPageLayout title={`Search Results for '${searchQuery}'`} description={loading ? "Loading..." : `${itemCount} Result${itemCount != 1 ? "s" : ""}`} searchFieldText={query}>
            <div className="search">
                <div className="filters">
                    <select className="search-filter bodyFont" id="filter"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}>
                        <option value="all">All</option>
                        <option value="users">Users</option>
                        <option value="projects">Projects</option>
                    </select>
                </div>

                <div className="content">
                    <Paginator fetchFunction={search} updateItemCount={setItemCount} limit={20} projectId={searchQuery} filter={filter} noneFoundMessage="No Results Found."
                        renderItem={(item, idx) => (
                            item.type === "project" ? (
                            <PrimaryProject key={idx} project={item} />
                            ) : item.type === "user" ? (
                            <a href={`/user/${item.id}`} key={idx} className="project user">
                                <div className="cover-image-wrapper">
                                    <img src={item.avatar_url || "/profile_icon_colored.svg"} alt="profile-picture"/>
                                </div>
                                <span className="bodyFont bold">{item.username || "No Username"}</span>
                                {item.bio && <span className="bodyFont label-color bio-snippet">{item.bio}</span>}
                            </a>
                            ) : <></>
                        )}
                    ></Paginator>
                </div>
            </div>
        </PrimaryPageLayout>
    )
}