import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const metadata = {
  title: "Create a Project - FlameSpark",
  description: "Start a new project on FlameSpark: add a title, tagline, description, tags, and media to share your journey.",
  robots: {
    index: false,
    follow: true
  }
};

export default async function CreateLayout({ children }) {
  // check if user is logged in
  return children;
}
