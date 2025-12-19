"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getUser } from "./projectFunctions";

export function useUser() {
  const [user, setUser] = useState(null);
  const [userSet, setUserSet] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [username, setUsername] = useState(null);
  const [bio, setBio] = useState(null);
  const [interests, setInterests] = useState(null);
  const router = useRouter();

  // Initial fetch
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const currentUser = data.session?.user || null;
      setUser(currentUser);
      setUserSet(true);

      if (currentUser) {
       fetchProfile(currentUser.id || "");
      }
    });

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      setUserSet(true);

      if (currentUser) {
       fetchProfile(currentUser.id || "");
      } else {
        setAvatar(null);
        setUsername(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

    const fetchProfile = async (userId) => {
    const { data, error } = await getUser(userId);

    if (error) {
      setUsername("Error");
      setAvatar("/profile_icon_colored.svg");
      return;
    }

    setUsername(data?.username || "No Username");
    setBio(data?.bio || "");
    setInterests(data?.interests || "");
    setAvatar(data?.avatar_url || "/profile_icon_colored.svg");
  };

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
    bio,
    interests,
    setAvatar,
    handleLogout,
  };
}