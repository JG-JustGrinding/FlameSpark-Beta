import React from 'react';
import './CompletedProject.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faLink } from '@fortawesome/free-solid-svg-icons';

export default function CompletedProject({
  project = {}, // { id, title, icon }
  creator = {}, // { id, username, avatar_url }
  messageTitle = 'Project Completed',
  messageBody = '',
  links = [], // [{ url, label }]
  onViewProject = null,
  onDiscover = null,
  allowIgnoreComplete = false
}) {
  const viewProjectHref = project?.id ? `/project/${project.id}?ignore_complete=true` : '#';
  const discoverHref = '/';

  return (
    <div className="completed-project bodyFont">
      <div className="header">
        <img className="project-logo pfp-shape" src={project?.icon || '/profile_icon.svg'} alt="project logo" />
        <h2 className="completed-title titleFont">{project?.title ? `${project.title} Has Been Completed!` : 'Project Has Been Completed!'}</h2>
      </div>

      <div className={`card completion-card`}>

        {(messageTitle && messageBody) && <div className="creator-row">
            <a href={`/user/${creator.id}`} className='creator-avatar pfp-shape'><img className="pfp-shape" src={creator?.avatar_url || '/profile_icon_colored.svg'} alt="creator avatar" /></a>
            <div className="completion-message">
                <h3 className="message-title titleFont">{messageTitle}</h3>
                <p className="message-body bodyFont">{messageBody}</p>
            </div>
        </div>}

        {links && links.length > 0 && (
          <div className="completion-links">
            <h4 className="links-title">{creator?.username} has attached some links with the completion of their project. Check them out to support their launch!</h4>
            <ul>
              {links.map((l, i) => (
                <li key={i}><a href={l.url} target="_blank" rel="noopener noreferrer"><FontAwesomeIcon icon={faLink}/> <span>{l.text || l.url}</span></a></li>
              ))}
            </ul>
          </div>
        )}

        <div className="actions">
          {onViewProject ? (
            <>{allowIgnoreComplete && <button className="button-shape outlined" onClick={() => onViewProject(project)}>View Project Anyway</button>}</>
          ) : (
            <>{allowIgnoreComplete && <a className="button-shape outlined" href={viewProjectHref}>View Project Anyway</a>}</>
          )}

          {onDiscover ? (
            <button className="button-shape red-color" onClick={onDiscover}>Go to Discover</button>
          ) : (
            <a className="button-shape red-color" href={discoverHref}>Go to Discover</a>
          )}
        </div>
      </div>
    </div>
  );
}
