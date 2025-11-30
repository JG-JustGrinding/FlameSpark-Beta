"use client";
import { useState } from "react";
import BlogArticle from "@/components/BlogArticle";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram, faTiktok, faTwitch, faYoutube } from "@fortawesome/free-brands-svg-icons";
import { faDice } from "@fortawesome/free-solid-svg-icons";

export default function HowTraditionalSocialMediaKillsIdeas() {
  const article = {
    title: "How Traditional Social Media Kills Ideas",
    coverImage: "/Thumbnail_Fail.png",
    author: "FlameSpark",
    authorImage: "/FLAMESPARK_WITHBG_CIRCULAR.svg",
    date: "2025-11-30",
    readTime: "5 min read",
    tags: ["Social Media", "Revelation"],
    likes: 0,
    showDate: false,
    }

  return (
        <BlogArticle blogId="how-traditional-social-media-kills-ideas" article={article} related={{
            title: "The Story of FlameSpark: Where the Go-Getters Grow",
            description: "Get to know the inspiration and vision behind FlameSpark.",
            href: "/blog/the-story-of-flamespark",
            coverImage: "/Thumbnail_Future.png"
        }}>
        <p>
            <b>Social media</b> seems to promise a place in which everyone has the chance to share things to the world; a place where even ordinary people can simply create a channel, get posting, and suddenly be heard by hundreds of thousands or even <i>millions</i>  of people. But… What if I told you that this idea of social media is merely a façade? What if I were to show you the truth of social media, and how rather than uplifting creators, it creates a <b>harsh landscape</b> where only those who can claw their way to the top survive? Traditional social media isn’t built to help ideas grow. Instead, it’s built to use creators as a backbone to ultimately serve its own interests.      
        </p>

        <h2 className="titleFont">Who Cares About the Vision? Focus On the Metrics</h2>
        <p>
            When attempting to spread your ideas on a social media platform, you quickly realize that it’s not about what you have to say, but rather how well you can sugarcoat your message to impress an <b>algorithm</b>. It’s hard to get any idea across, no matter how amazing it may be, if the algorithm punishes your content for not being immediately clickable. Traditional platforms reduce your vision to simple statistics that represent how profitable your work is to them: <b>Click-through rate</b>, <b>watch time</b>, <b>retention</b>, etc. These short-sighted statistics ultimately determine whether you will get a crumb of attention, or thrown into the void. If your work doesn’t immediately overload the dopamine meter, it gets discarded.
            This creates a system in which creators are frustrated and, rather than focusing on turning their idea into a reality, try to crack the algorithm in a way that gives them even the slightest amount of attention.
        </p>

        <p><strong>How are ideas supposed to thrive in such an environment?</strong></p>

        <h2 className="titleFont">The Top 1% Get All the Attention</h2>
        <p>
            Traditional social media doesn’t actually want to give newer creators a <b>chance</b>, it wants to keep going with what already works. Creators with high follower counts get most of the attention because they’re considered <i>“safe”</i>  in the algorithm’s eyes.
Because of this, new creators, no matter how special, enter a <b>rigged game</b>. They start at the bottom, and have to fight endlessly or get exceptionally lucky for a chance to shine. 
As a result, the few creators at the top get an absurd share of the attention, leaving everyone else fighting for scraps. Even those with immense talent and potential get ignored because traditional social media doesn’t prioritize giving everyone a chance to shine, but instead focuses on concentrating traffic to the already familiar faces. <b>Virality</b> on social media is more of an idealistic dream than a genuine opportunity for most creators.
        </p>

        <h3 className="titleFont">Some Facts About Social Media:</h3>
        <FactsCarousel />

        <h2>Social Media Doesn’t Care About Creators</h2>
        <p>
            At the end of the day, traditional social media platforms are <b>businesses</b>. Their main goal is to keep users engaged for as long as possible so they can show them more ads and make more money. Creators are just a means to an end. If a creator’s content isn’t <b>profitable enough</b>, they get pushed aside regardless of how amazing their ideas may be. This creates a toxic cycle where creators are forced to prioritize what the algorithm wants over what they truly want to create. 
            Instead of focusing on their vision, they have to focus on <b>metrics</b> and <b>trends</b>, which ultimately destroys creativity and innovation in exchange for algorithmic appeal. When a new creator doesn’t get the chance they truly deserve to shine, it’s social media’s way to say <i>“you don’t serve us how we want you to.”</i>  It’s their way of trying to force you into a box for a slim chance of getting a shred of attention. It’s why they’d rather you compete in an endless abyss of hope than to give unrecognized potential its chance at the spotlight…
        </p>
        
        {false && <><h3 className="titleFont">A Fun Fact About Social Media</h3>
        <p>Infinite scroll and other “endless feed” mechanics were inspired by the psychological effects of slot machines, which were designed to keep users hooked and coming back for more.</p></>}
        
        <p className="label-color"><b><i>...And that's why there's flameSpark.</i></b></p>

        <div className="article-cta">
            <a href="/create" className="cta-button button-shape">Share Your First Project</a>
            <a href="/discover" className="cta-button button-shape secondary">Discover Projects</a>
        </div>
    </BlogArticle>
  );
}

function FactsCarousel() {
    const facts = [
        {
            title: "YouTube:",
            icon: faYoutube,
            text: "About 91% of YouTube videos never reach 1,000 views, and only 0.77% of all YouTube videos ever reach 100,000 views."
        },
        {
            title: "Instagram:",
            icon: faInstagram,
            text: "Only 0.1% of Instagram Users Have Over 1 Million Followers. This means your odds of becoming a mega influencer are about the same as making it to the NBA."
        },
        {
            title: "TikTok:",
            icon: faTiktok,
            text: "On TikTok, it is estimated that the top 1% of creators receive over 50% of all views. TikTok wants every user to think they have a shot at going viral, so they artificially boost one of your early videos to get you hooked on making content."
        },
        {
            title: "Twitch:",
            icon: faTwitch,
            text: "On Twitch, approximately 70% of streamers have fewer than 10 average viewers, while the top 5 streamers can get 100k+ viewers each."
        },
        {
            title: "General Social Media:",
            icon: faDice,
            text: "Going viral is extremely rare. Statistically, it's even more unlikely than being struck by lightning!"
        }
    ];

    const [index, setIndex] = useState(0);

    const prev = () => setIndex((i) => (i - 1 + facts.length) % facts.length);
    const next = () => setIndex((i) => (i + 1) % facts.length);

    const current = facts[index];

    return (
        <div className="facts-carousel">
            <div className="fact-card card">
                <div className="fact-header">
                    <div className="fact-icon">
                        <FontAwesomeIcon icon={current.icon} />
                    </div>
                    <h4 className="titleFont">{current.title}</h4>
                </div>
                <p className="bodyFont">{current.text}</p>
            </div>
            <div className="fact-nav">
                <button className="button-shape slim caption-size bodyFont blue-color" onClick={prev} aria-label="Previous fact">Back</button>
                <div className="fact-dots">
                    {facts.map((_, i) => (
                        <span key={i} className={`fact-dot${i === index ? " active" : ""}`} />
                    ))}
                </div>
                <button className="button-shape slim caption-size bodyFont red-color" onClick={next} aria-label="Next fact">Next</button>
            </div>
        </div>
    );
}