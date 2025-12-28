"use client";

import { useState, useEffect, Suspense } from "react";
import PrimaryPageLayout from "@/components/PrimaryPageLayout";
import PrimaryProject from "@/components/PrimaryProject";
import "@/styles/SearchPage.css";
import { search } from "@/lib/projectFunctions";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/lib/useUser";
import { Paginator } from "@/lib/infinitePostFeed";
import "@/styles/content.css";

function SearchClient() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const query = searchParams.get("q") || "";
    const [searchQuery, setSearchQuery] = useState(query);
    const [loading, setLoading] = useState(false);
    const [itemCount, setItemCount] = useState("0");
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        if (typeof document !== "undefined") {
            document.title = `Search Results for '${searchQuery}' - FlameSpark`;
        }
    }, [searchQuery]);

    // Keep local state in sync if the URL query changes
    useEffect(() => {
        setSearchQuery(query);
    }, [query]);

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
                                    <img src={item.avatar_url || "/profile_icon_colored.svg"} className="searchUserAvatar" alt="profile-picture"/>
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

export default function Search() {
    return (
        <Suspense fallback={<PrimaryPageLayout title="Loading Search..." description="Loading search results..."></PrimaryPageLayout>}>
            <SearchClient />
        </Suspense>
    );
}