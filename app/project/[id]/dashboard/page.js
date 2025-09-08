"use client"
import Header from "@/components/Header";
import Unauthorized from "@/components/Unauthorized";
import ErrorComponent from "@/components/ErrorComponent"
import { useUser } from "@/lib/useUser";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import "@/styles/dashboard.css"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faPencil, faChartBar, faLayerGroup, faPaintBrush, faList, faNoteSticky, faHeart, faGlobe } from '@fortawesome/free-solid-svg-icons'

export default function ProjectPage(){
    const { id } = useParams();
    const { user, userSet } = useUser();
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [unauthorized, setUnauthorized] = useState(false);
    const items = [];
    const unlockableItems = [];

    function PushItem(name, icon, itemArray) {
        itemArray.push({name, icon});
    }

    PushItem("Details", faPencil, items);
    PushItem("Analytics", faChartBar, items);
    PushItem("Posts", faLayerGroup, items);

    PushItem("Theme", faPaintBrush, unlockableItems);
    PushItem("To-Do List", faList, unlockableItems);
    PushItem("Stickers", faNoteSticky, unlockableItems);
    PushItem("Reactions", faHeart, unlockableItems);
    PushItem("Community", faGlobe, unlockableItems);

    if (user == null)
    {

    }

    useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      // fetch project by ID
      const { data: project, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !project) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      // check authorization
      if (userSet)
      {
        if (!user || user.id !== project.owner_id) {
            setUnauthorized(true);
            setProject(project);
            setLoading(false);
            return;
        }
      }

      setProject(project);
      setLoading(false);
    };

    fetchProject();
  }, [id, user, userSet]);

    if (loading || !userSet) return (
        <>
        </>
    )
    if (notFound) return <ErrorComponent />;
    if (unauthorized) return <Unauthorized />;

    return (
        <>
            <Header isDashboardHeader={true} />
            <div className="container">
                <aside className="sidebar bodyFont">
                    <ul>
                        <li className="item create-post-button">
                            <FontAwesomeIcon icon={faPlus}/> 
                            Create New Post
                        </li>
                        {items.map((item, index) => (
                            <li key={index} className={`item ${selectedIndex == index ? "selected" : ""}`} onClick={() => {setSelectedIndex(index)}}>
                            <FontAwesomeIcon icon={item.icon} />
                            <span>{item.name}</span>
                            </li>
                        ))}

                        <li className="line-break"><span/></li>

                        {unlockableItems.map((item, index) => (
                            <li key={index} className={`item ${selectedIndex == (index + items.length) ? "selected" : ""}`} onClick={() => {setSelectedIndex(index + items.length)}}>
                            <FontAwesomeIcon icon={item.icon} />
                            <span>{item.name}</span>
                            </li>
                        ))}
                    </ul>
                </aside>
                <main className="main-content">
                    <h1>Main Content</h1>
                    <p>Some content goes here...</p>
                    <p>More content...</p>
                </main>
            </div>
        </>
    )
}