// pages/index.js
import Head from "next/head";
import "@/styles/landing.css";

export default function Home() {
  return (
    <>
      <Head>
        <title>FlameSpark | Learn More</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="bdr" />

      <header className="header-area">
        <div className="container-fluids">
          <div className="header__grid pding">
            <div className="header__text">
              <div className="logo top">
                <img src="/Logo_NoPadding_Transparent.png" alt="logo" />
              </div>
              <h1>Introducing FlameSpark</h1>
              <p>
                A revolutionary new platform where ideas can shine. See how
                FlameSpark helps ideas flourish and creations get the recognition
                they deserve.
              </p>
              <div className="btn__group">
                <a className="active" href="#footer">Join the Community</a>
                <a href="#about">Learn More</a>
              </div>
            </div>

            <div className="header__image">
              <img src="/landing/lightbulb_colored.png" alt="" />
            </div>
          </div>
        </div>
      </header>

      <section id="about" className="about__area_max">
        <div className="about__area">
          <div className="container-fluids">
            <div className="about__grid pding">
              <div className="about__left">
                <img src="/FLAMESPARK_WITHBG_CIRCULAR.svg" alt="about" />
              </div>

              <div className="about__right">
                <h1>About FlameSpark</h1>
                <p>
                  FlameSpark is an upcoming social media platform that highlights the
                  hard work of turning ideas into creations.
                </p>
                <p>
                  We understand that acquiring an audience is among the most
                  difficult tasks for anyone who puts work into creating something.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="work-area pding">
        <div className="container-fluids">
          <div className="work-area-header">
            <img src="/assets/images/logo.svg" alt="" />
            <h1>How It Works</h1>
          </div>

          <div className="work-card-area">
            <div className="work-card">
              <div className="work-card-img">
                <img src="/assets/images/w1.png" alt="" />
              </div>
              <div className="work-card-text">
                <h2>Create</h2>
                <p>It all starts with the creation of your project.</p>
              </div>
            </div>

            <div className="work-card">
              <div className="work-card-img">
                <img src="/assets/images/w2.png" alt="" />
              </div>
              <div className="work-card-text">
                <h2>Post</h2>
                <p>Post updates to grow your audience organically.</p>
              </div>
            </div>

            <div className="work-card">
              <div className="work-card-img">
                <img src="/assets/images/w3.png" alt="" />
              </div>
              <div className="work-card-text">
                <h2>Complete</h2>
                <p>Mark your project complete and notify supporters.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer id="footer" className="footer-area">
        <div className="container-fluids">
          <div className="footer__content_grid">
            <div className="footer_left">
              <div className="work-area-header">
                <img src="/assets/images/logo.svg" alt="" />
                <h1>
                  <span>Join the</span> FlameSpark Community
                </h1>
              </div>
              <h5>Where the Go-Getters Grow</h5>
            </div>

            <div className="footer_right">
              <div className="footer__support">
                <button disabled>Support FlameSpark's Development Below</button>
                <div className="footer__list_item">
                  <a href="https://discord.gg/nbjzkgjFMT" target="_blank">
                    <div className="item__flex">
                      <div className="item_img">
                        <img src="/assets/images/discord_svg.svg" alt="discord" />
                      </div>
                      <div className="item__content">
                        <h3>Join the FlameSpark Discord Community</h3>
                        <span>Continue</span>
                      </div>
                    </div>
                  </a>

                  <a href="https://www.patreon.com/FlameSpark" target="_blank">
                    <div className="item__flex">
                      <div className="item_img">
                        <img src="/assets/images/patreon_svg.svg" alt="patreon" />
                      </div>
                      <div className="item__content">
                        <h3>Join the FlameSpark Patreon Community</h3>
                        <span>Continue</span>
                      </div>
                    </div>
                  </a>

                  <div className="item__flex item__flex_new">
                    <div className="item__content_flex">
                      <h3>Sign up for the FlameSpark Newsletter for updates!</h3>
                    </div>
                    <form
                      action="https://assets.mailerlite.com/jsonp/1180282/forms/138221124403070766/subscribe"
                      method="post"
                      target="_blank"
                    >
                      <div className="input-container">
                        <input
                          type="email"
                          placeholder="Your email here..."
                          className="email-input"
                          name="fields[email]"
                        />
                        <button className="subscribe-button">Subscribe</button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>

            <div className="mail">
              <a href="mailto:flamespark.business@gmail.com">
                <img src="/assets/images/gmail.svg" alt="gmail" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

