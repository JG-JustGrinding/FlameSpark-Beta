import { supabaseServerClient } from "@/lib/supabaseServerClient";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Log In - FlameSpark",
  description: "Log in to your FlameSpark account to follow projects and support upcoming ideas and creations.",
  alternates: {
    canonical: `${process.env.DOMAIN_NAME}/login`,
  },
  robots: {
    index: false,
    follow: false,
  },/*
  openGraph: {
    title: "Log In - FlameSpark",
    description: "Log in to your FlameSpark account to follow projects and support upcoming ideas and creations.",
    url: `${process.env.DOMAIN_NAME}/login`,
    siteName: "FlameSpark",
    type: "website",
  },
  twitter: {
    title: "Log In - FlameSpark",
    description: "Log in to your FlameSpark account to follow projects and support upcoming ideas and creations.",
  },*/
};

export default async function LoginLayout({ children }) {
  const supabase = await supabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    redirect("/");
  }

  return children;
}
