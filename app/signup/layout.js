import { supabaseServerClient } from "@/lib/supabaseServerClient";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Sign Up - FlameSpark",
  description: "Sign up for FlameSpark to enter a world where ideas can get the recognition they deserve.",
  alternates: {
    canonical: `${process.env.DOMAIN_NAME}/signup`,
  },
  robots: {
    index: false,
    follow: false,
  },/*
  openGraph: {
    title: "Sign Up - FlameSpark",
    description: "Sign up for FlameSpark to enter a world where ideas can get the recognition they deserve.",
    url: `${process.env.DOMAIN_NAME}/signup`,
    siteName: "FlameSpark",
    type: "website",
  },
  twitter: {
    title: "Sign Up - FlameSpark",
    description: "Sign up for FlameSpark to enter a world where ideas can get the recognition they deserve.",
  },*/
};

export default async function SignUpLayout({ children }) {
  const supabase = await supabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    redirect("/");
  }

  return children;
}
