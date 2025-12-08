"use client";
import Header from "@/components/Header";
import styles from "@/styles/ErrorPage.module.css";

export default function ErrorPage() {
  return (
    <div className={styles.container}>
      <Header />

      <main className={styles.main}>
        <div className={`${styles.warningBanner} ${styles.red}`}>
          <span aria-hidden="true" className="titleFont">!</span>
        </div>

        <div className={styles.warningBody}>
          <h1 className="titleFont">HUH!? Sorry!</h1>
          <p className="bodyFont">
            We're sorry, but the page you're looking for doesn't exist.<br />
            It might have been moved or deleted.<br />
            Please check the URL for errors or return to our discover page to continue browsing.
          </p>
          <button className="bodyFontBold">Go to Discover</button>
        </div>
      </main>
    </div>
  );
}