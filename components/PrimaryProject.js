const PrimaryProject = ({project}) => {
    return (
        <a href={`project/${project?.id}/preview`} className="project">
            <div className="cover-image-wrapper">
                <img className="cover-image" src={project?.cover_image} alt="Cover image"></img>
            </div>
            <span className="bodyFont tagline label"><i>{project?.tagline}</i></span>
            <div className="project-info">
                <img className="project-icon" src={project?.icon} alt="Project Icon"></img>
                <div className="project-nameandtags">
                    <span className="project-name titleFont bold">{project?.title}</span>
                    <div className="tags bodyFont label caption-size">
                    <span className="text">{project?.tags?.join(", ")}</span>
                    </div>
                </div>
            </div>
        </a>
    )
}

export default PrimaryProject;