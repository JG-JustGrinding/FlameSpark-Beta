"use client";

import { useRef, useState } from "react";
import PrimaryPageLayout from "@/components/PrimaryPageLayout";
import "@/styles/ExplorePage.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";

export default function ExplorePage() {
    return (
        <PrimaryPageLayout title="Explore" description="Encounter new projects by scrolling through posts">
            <div className="content">
                <div className="card-section">
                    <div className="card">

                    </div>

                    <div className="card main">

                    </div>

                    <div className="card">

                    </div>
                </div>
                <div className="options">
                    <FontAwesomeIcon className="icon no-select-pointer" icon={faArrowLeft} />
                    <FontAwesomeIcon className="icon no-select-pointer" icon={faArrowRight} />
                </div>
            </div>
        </PrimaryPageLayout>
    )
}