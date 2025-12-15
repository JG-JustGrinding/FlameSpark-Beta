import SkeletonImage from "./SkeletonImage";

const PrimaryProject = ({project}) => {
    return (
        <article className="project">
            <a href={`project/${project?.id}/preview`} aria-label={`Preview ${project?.title}`}>
                <SkeletonImage src={project?.cover_image} alt={`${project?.title} cover image`} className="cover-image-wrapper" imageClassName="cover-image" />
            </a>
            <p className="bodyFont tagline label"><i>{project?.tagline}</i></p>
            <div className="project-info">
                <img className="project-icon" src={project?.icon} alt={`${project?.title} icon`} />
                <div className="project-nameandtags">
                    <h3 className="project-name titleFont bold reset">
                        <a href={`project/${project?.id}/preview`} className="unstyled-link">{project?.title}</a>
                    </h3>
                    {project?.tags?.length > 0 && (
                        <div className="tags bodyFont label caption-size" role="list" aria-label="Project tags">
                            {project.tags.map((tag, i) => (
                                <span className="text" role="listitem" key={i}>{tag}{i < project.tags.length - 1 ? ", " : ""}</span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </article>
    )
}

export default PrimaryProject;