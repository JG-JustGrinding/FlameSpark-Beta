"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/lib/useUser';
import { getProject, getUser } from '@/lib/projectFunctions';
import '@/styles/complete.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import Header from '@/components/Header';
import NotFound from '@/components/ErrorComponent';

export default function ProjectCompletePage() {
	const router = useRouter();
	const { id: projectId } = useParams();

	const [project, setProject] = useState(null);
	const [owner, setOwner] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		async function load() {
			if (!projectId) {
				setError('No project specified');
				setLoading(false);
				return;
			}

			try {
				const p = await getProject(projectId);
				setProject(p);
				const { data: ownerData } = await getUser(p.owner_id);
				if (ownerData) setOwner(ownerData);
			} catch (err) {
				setError(err.message || 'Failed to load project');
			} finally {
				setLoading(false);
			}
		}

		load();
	}, [projectId]);

	//if (loading) return <div className="complete-page"><div className="card">Loading…</div></div>;
	if (error) return <NotFound></NotFound>;

	return (
		<main className='complete-main-wrapper'>
		<Header/>
		<div className="complete-page">
			<div className={`complete-card card${loading ? " skeleton" : ""}`}>
				<div className="icon-wrap">
					<FontAwesomeIcon icon={faCheckCircle} className="complete-icon" />
				</div>
				<h1 className="title titleFont">Congrats!</h1>
				<p className="subtitle bodyFont"><strong>{project?.title ? ` ${project.title}` : ''}</strong> has been completed! All of your supporters have been notified (and will be able to click the link you have attached to your completion).</p>
				<span className="note reset bodyFont label-color"><strong><i>Wishing you the best on your journey ahead. May your dreams take you to the most amazing places!</i></strong></span>

				<div className="actions">
					<a className="button-shape bodyFont outlined" href={`/project/${projectId}`}>View Project</a>
					<a className="button-shape bodyFont red-color" href={`/`}>Return to Discover</a>
				</div>
			</div>
		</div>
		</main>
	);
}

