"use client";
import Header from "@/components/Header";
import styles from "@/styles/ErrorPage.module.css";

export default function Unauthorized() {
  return (
    <div className={styles.container}>
      <Header />

      <main className={styles.main}>
        <div className={`${styles.warningBanner} ${styles.yellow}`}>
          <span aria-hidden="true" className="titleFont">!</span>
        </div>

        <div className={styles.warningBody}>
          <h1 className="titleFont">HUH!? Sorry!</h1>
          <p className="bodyFont">
            You don't have permission to access this page.<br/>
            If you believe this is an error, please try checking the URL or contacting us.<br/>
            In the meantime, you can go back to our discover page or to another section of FlameSpark.
          </p>
          <button className="bodyFontBold">Go to Discover</button>
        </div>
      </main>
    </div>
  );
}