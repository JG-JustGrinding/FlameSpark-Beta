import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faT, faImage, faPoll, faVolumeLow, faVideo, faLink, faLayerGroup, faImages } from '@fortawesome/free-solid-svg-icons';
import { timeAgo } from '@/lib/projectFunctions';

export default function OtherPost({ postContent, postId, postTitle, postDescription, projectId, projectTitle, projectIcon = "", postDate = null }) {

function GetIconFromPostType() {
    if (postContent?.length > 1)
    {
        //return faLayerGroup;
    }

    switch (postContent[0]?.contentType) {
        case "text":
            return faT;
        case "image":
            return faImage;
        case "poll":
            return faPoll;
        case "audio":
            return faVolumeLow;
        case "video":
            return faVideo;
        case "link":
            return faLink;
        default:
            return faLayerGroup;
    }
}

  return (
    <a href={`/project/${projectId}/post/${postId}`} className="other-post">
        <div className='info-and-date'>
            <div className="project-information">
                {projectIcon && <img className="project-icon-other pfp-shape" src={projectIcon} alt="Project Icon"/> }
                <span className="titleFont bold">{projectTitle}</span>
            </div>
            <span className="bodyFont label-color date">{timeAgo(postDate)}</span>
        </div>
        <div className="o-content">
            <div className="text">
                <h4 className="titleFont reset">{postTitle || ". . ."}</h4>
                <p className="bodyFont reset">{postDescription || ". . ."}</p>
            </div>
            <div className="other-post-content-display">
            {
            (postContent?.[0].contentType === "image")
                ? <img className="other-post-image" src={postContent?.[0].content[0]} alt="Post Image" />
                : (
                    <div className='icon-container' style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <FontAwesomeIcon className="icon" icon={GetIconFromPostType()} />
                    </div>
                )
            }
            </div>
        </div>
    </a>
  );
}
