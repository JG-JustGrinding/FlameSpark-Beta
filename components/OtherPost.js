import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faT, faImage, faPoll, faVolumeLow, faVideo, faLink, faLayerGroup, faImages } from '@fortawesome/free-solid-svg-icons';
import { timeAgo } from '@/lib/projectFunctions';

export default function OtherPost({ postContent, postId, postTitle, postDescription, projectId, projectTitle, projectIcon = "", postDate = null, isSkeleton = false, styles }) {

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

  const handleSkeletonClick = (e) => {
    if (isSkeleton) {
      e.preventDefault();
    }
  };

  return (
    <a href={isSkeleton ? "#" : `/project/${projectId}/post/${postId}`} onClick={handleSkeletonClick} className={`${styles.otherPost}${isSkeleton ? " skeleton" : ""}`}>
        <div className={styles.infoAndDate}>
            <div className={styles.projectInformation}>
                {projectIcon && !isSkeleton && <img className={`${styles.projectIconOther} pfp-shape`} src={projectIcon} alt="Project Icon"/> }
                <span className={`titleFont bold${isSkeleton ? " skeleton" : ""}`}>{isSkeleton ? "" : projectTitle}</span>
            </div>
            <span className={`bodyFont label-color date${isSkeleton ? " skeleton" : ""}`}>{isSkeleton ? "" : timeAgo(postDate)}</span>
        </div>
        <div className={styles.oContent}>
            <div className={styles.text}>
                <h4 className={`titleFont reset${isSkeleton ? " skeleton" : ""}`}>{isSkeleton ? "" : (postTitle || ". . .")}</h4>
                <p className={`bodyFont reset${isSkeleton ? " skeleton" : ""}`}>{isSkeleton ? "" : (postDescription || ". . .")}</p>
            </div>
            <div className={styles.otherPostContentDisplay}>
            {
            (!isSkeleton && postContent?.[0].contentType === "image")
                ? <img className={`${styles.otherPostImage}`} src={postContent?.[0].content[0]} alt="Post Image" />
                : (
                    <div className={`${styles.iconContainer}${isSkeleton ? " skeleton" : ""}`} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {!isSkeleton && <FontAwesomeIcon className={styles.icon} icon={GetIconFromPostType()} />}
                    </div>
                )
            }
            </div>
        </div>
    </a>
  );
}
