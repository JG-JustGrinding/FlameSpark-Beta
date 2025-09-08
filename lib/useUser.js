"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export function useUser() {
  const [user, setUser] = useState(null);
  const [userSet, setUserSet] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [username, setUsername] = useState(null);
  const router = useRouter();

  // Initial fetch
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const currentUser = data.session?.user || null;
      setUser(currentUser);
      setUserSet(true);

      if (currentUser) {
        setAvatar(currentUser.user_metadata?.avatar_url || "/profile_icon_colored.svg");
        setUsername(currentUser.user_metadata?.username || "No Username");
      }
    });

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      setUserSet(true);

      if (currentUser) {
        setAvatar(currentUser.user_metadata?.avatar_url || "/profile_icon_colored.svg");
        setUsername(currentUser.user_metadata?.username || "No Username");
      } else {
        setAvatar(null);
        setUsername(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  };

  return {
    user,
    userSet,
    avatar,
    username,
    handleLogout,
  };
}