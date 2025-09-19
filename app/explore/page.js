"use client";

import { useRef, useEffect, useState } from "react";
import PrimaryPageLayout from "@/components/PrimaryPageLayout";
import "@/styles/ExplorePage.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";

export default function ExplorePage() {
  const carouselRef = useRef(null);
    const [currentCard, setCurrentCard] = useState(0);

    const scrollLeft = () => {
            const carousel = carouselRef.current;
    if (!carousel) return;

      carousel.scrollBy({ left: -carousel.clientWidth, behavior: 'smooth' });
    };

    const scrollRight = () => {
            const carousel = carouselRef.current;
    if (!carousel) return;

      carousel.scrollBy({ left: carousel.clientWidth, behavior: 'smooth' });
    };

  useEffect(() => {
  const carousel = carouselRef.current;

  const setActiveCard = () => {
    const cards = Array.from(carousel.children);
    const center = carousel.scrollLeft + carousel.clientWidth / 2;
    cards.forEach(card => card.classList.remove('active'));

    // find card whose center is closest to container center
    let closest = cards[0];
    let closestDistance = Math.abs((cards[0].offsetLeft + cards[0].offsetWidth/2) - center);

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(cardCenter - center);
      if (distance < closestDistance) {
        closest = card;
        closestDistance = distance;
        setCurrentCard(i);
      }
    }

    closest.classList.add('active');
  };

  setActiveCard();
  carousel.addEventListener('scroll', setActiveCard);

  return () => carousel.removeEventListener('scroll', setActiveCard);
}, []);

    return (
        <PrimaryPageLayout useTitle={false} noContainerPadding={true} title="Explore" description="Encounter new projects by scrolling through posts">
        <div className="carousel-container">
            {currentCard !== 0 && <button className="nav left" onClick={scrollLeft}>&#8249;</button>}
            <div className="carousel" ref={carouselRef}>
                <div className="card">
                    <img src="https://picsum.photos/400/300?random=1" alt="Post" />
                    <h2>Post Title 1</h2>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                    <div className="actions">
                    <button>Like</button>
                    <button>Comment</button>
                    </div>
                </div>
                <div className="card">
                    <img src="https://picsum.photos/400/300?random=2" alt="Post" />
                    <h2>Post Title 2</h2>
                    <p>Another interesting caption here.</p>
                    <div className="actions">
                    <button>Like</button>
                    <button>Comment</button>
                    </div>
                </div>
                <div className="card">
                    <img src="https://picsum.photos/400/300?random=3" alt="Post" />
                    <h2>Post Title 3</h2>
                    <p>This is a card in the carousel.</p>
                    <div className="actions">
                    <button>Like</button>
                    <button>Comment</button>
                    </div>
                </div>
                <div className="card">
                    <img src="https://picsum.photos/400/300?random=4" alt="Post" />
                    <h2>Post Title 4</h2>
                    <p>This is the a in the carousel.</p>
                    <div className="actions">
                    <button>Like</button>
                    <button>Comment</button>
                    </div>
                </div>
                <div className="card">
                    <img src="https://picsum.photos/400/300?random=5" alt="Post" />
                    <h2>Post Title 5</h2>
                    <p>This is a card in the carousel.</p>
                    <div className="actions">
                    <button>Like</button>
                    <button>Comment</button>
                    </div>
                </div>
            </div>
            <button className="nav right" onClick={scrollRight}>&#8250;</button>
        </div>
        </PrimaryPageLayout>
    )
}