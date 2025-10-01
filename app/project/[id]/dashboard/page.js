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
import CappedInput from "@/components/CappedInput";

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

    // details
    const [projectTitle, setProjectTitle] = useState("");

    function PushItem(name, icon, itemArray, fullName = undefined) {
        itemArray.push({name, icon, fullName});
    }

    PushItem("Details", faPencil, items, "Project Details");
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

      // set project values
      setProjectTitle(project?.title);

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
            <div className="container">
                <aside className="sidebar bodyFont">
                    <ul>
                        <li className="project-display">
                            <a href={`/project/${project?.id}`}>
                                <img className="pfp-shape" src={project?.icon} alt="Project icon"/>
                                <h2 className="reset titleFont">{project?.title}</h2>
                            </a>
                        </li>
                        
                        <li className="line-break"><span/></li>

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
                <div className="container-content">
                    <Header isDashboardHeader={true} />

                    <main className="main-content">
                        {selectedIndex < items.length && <h1 className="titleFont">{items[selectedIndex].fullName || items[selectedIndex].name}</h1>}
                        {selectedIndex == 0 && 
                        <div className="content-section details">
                            <CappedInput value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} maxLength={30} label="Project Title" id="project-title"></CappedInput>
                        </div>
                        }
                        {selectedIndex == 1 && 
                        <div className="content-section analytics">
                            <span className="bodyFont">Views</span>
                        </div>
                        }
                    </main>
                </div>
            </div>
        </>
    )
}