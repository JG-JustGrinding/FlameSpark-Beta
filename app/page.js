import Image from "next/image";
import styles from "./page.module.css";
import Header from "@/components/Header";

export default function Home() {
  return (
    <div>
      <Header />

      <main>
        <h1>Welcome to My Social Media MVP!</h1>
      </main>
    </div>
  );
}
