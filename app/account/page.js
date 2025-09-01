"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Header from "@/components/Header";
import "../../styles/account.css";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTag, faBook, faHeart } from "@fortawesome/free-solid-svg-icons";

export default function AccountPage() {
  const router = useRouter();
  const [avatar, setAvatar] = useState(null);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState("");
  const [savingInfo, setSavingInfo] = useState(false);
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileInfoError, setProfileInfoError] = useState("");
  const [profileInfoSuccess, setProfileInfoSuccess] = useState("");

  useEffect(() => {
      const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user == null) {
          router.push("/login");
      }
      };
      checkUser();
  }, [router, supabase]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const currentUser = data.session?.user || null;
      setUser(currentUser);

      if (currentUser) {
        setAvatar(currentUser.user_metadata?.avatar_url || "/profile_icon_colored.svg");
        setUsername(currentUser.user_metadata?.username || "No Username");
        setBio(currentUser.user_metadata?.bio || "");
        setInterests(currentUser.user_metadata?.interests || "");
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);

      if (currentUser) {
        setAvatar(currentUser.user_metadata?.avatar_url || "/profile_icon_colored.svg");
        setUsername(currentUser.user_metadata?.username || "No Username");
        setBio(currentUser.user_metadata?.bio || "");
        setInterests(currentUser.user_metadata?.interests || "");
      } else {
        setAvatar(null);
        setUsername(null);
        setBio(null);
        setInterests(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

    async function uploadAvatar(event) {
    try {

    if (user == null){
        return;
    }

      setUploading(true);
      setProfileError("");
      setProfileInfoSuccess("");

      const file = event.target.files[0];
      if (!file) return;

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `${fileName}`;

      // Delete old avatar
      const oldAvatarUrl = user.user_metadata?.avatar_url;
      if (oldAvatarUrl) {
        const url = new URL(oldAvatarUrl);
        const oldPath = url.pathname.split("/storage/v1/object/public/Avatars/")[1];
        if (oldPath) {
          await supabase.storage.from("Avatars").remove([oldPath]);
        }
      }

      // Upload to Supabase Storage
      let { error: uploadError } = await supabase.storage
        .from("Avatars")
        .upload(filePath, file, { upsert: true });

        if (uploadError)
        {
            setProfileError("Error: " + uploadError.message);
            return;
        }

        const { data: publicUrlData } = supabase.storage
        .from("Avatars")
        .getPublicUrl(filePath);

        const publicUrl = publicUrlData.publicUrl;

        const { data, error } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
        });

        if (error)
        {
            setProfileError("Error: " + error.message);
            return;
        }

    } catch (error) {
        setProfileError("Error: " + error.message);
    } finally {
      setUploading(false);
    }
  }

  async function saveProfileInfo() {
    try {
      setSavingInfo(true);
      setProfileInfoError("");
      setProfileInfoSuccess("");

      if (!user) return;

      const dataToUpdate = {};
      if (username !== undefined) dataToUpdate.username = username;
      if (bio !== undefined) dataToUpdate.bio = bio;
      if (interests !== undefined) dataToUpdate.interests = interests;

      const { data, error } = await supabase.auth.updateUser({
        data: dataToUpdate
      });

      if (error)
      {
        setProfileInfoError("Error: " + error.message);
        return;
      }

      setProfileInfoSuccess("Profile updated");
    } catch (error) {
      setProfileInfoError("Error: " + error.message);
    } finally {
      setSavingInfo(false)
    }
  }
  
  return (
    <>
      <Header />

      <main className="main-container">
        <div className="side-panel">
            <div className="options">
                <div>
                    <p className="bodyFont">Profile</p>
                </div>
                <div>
                    <p className="bodyFont">Account</p>
                </div>
                <div>
                    <p className="bodyFont">Management</p>
                </div>
            </div>
        </div>
        <div className="content-view">
            <div className="profile">
                <h1 className="titleFont">User Profile</h1>
                <div className="profile-content">
                    <div className="card profile-picture">
                        <img className="pfp-shape" src={avatar} alt="profile picture"/>
                        <div className="right">
                            {profileError && <p className="error-message titleFont">{profileError}</p>}
                            <span className="bodyFont bold">Profile Picture</span>
                            <div className="change-container">
                                <p className="label bodyFont">Change Image:</p>
                                <input className="bodyFont button-shape changeButton" type="file" accept="image/*" onChange={uploadAvatar} disabled={uploading}/>
                            </div>
                        </div>
                    </div>
                    <div className="card user-info">
                        {profileInfoError && <p className="error-message titleFont">{profileInfoError}</p>}
                        {profileInfoSuccess && <p className="success-message titleFont">{profileInfoSuccess}</p>}

                        <div className="input-container">
                            <div className="label">
                                <FontAwesomeIcon icon={faTag}/>
                                <p className="label-color bodyFont body-size">Username</p>
                            </div>
                            <input className="bodyFont input-field" type="text" placeholder="Enter text here..." value={username == null ? "" : username}onChange={(e) => {
                                                                                                                                                    setUsername(e.target.value);
                                                                                                                                                    setProfileInfoSuccess("");
                                                                                                                                                    setProfileInfoError("");
                                                                                                                                                  }} />
                        </div>
                        <div className="input-container">
                            <div className="label">
                                <FontAwesomeIcon icon={faBook}/>
                                <p className="label-color bodyFont body-size">Bio</p>
                            </div>
                            <textarea className="bodyFont input-field" type="text" placeholder="Enter text here..." value={bio == null ? "" : bio} onChange={(e) => {
                                                                                                                                                    setBio(e.target.value);
                                                                                                                                                    setProfileInfoSuccess("");
                                                                                                                                                    setProfileInfoError("");
                                                                                                                                                  }}/>
                        </div>
                        <div className="input-container">
                            <div className="label">
                                <FontAwesomeIcon icon={faHeart}/>
                                <p className="label-color bodyFont body-size">Interests (comma separated, e.g. "Art, Gaming")</p>
                            </div>
                            <input className="bodyFont input-field" type="text" placeholder="Enter text here..." value={interests == null ? "" : interests} onChange={(e) => {
                                                                                                                                                    setInterests(e.target.value);
                                                                                                                                                    setProfileInfoSuccess("");
                                                                                                                                                    setProfileInfoError("");
                                                                                                                                                  }} />
                        </div>
                        <div className="save-button-container">
                            <button className="button-shape bodyFont" onClick={saveProfileInfo} disabled={savingInfo}>{`${savingInfo ? "Saving..." : "Save"}`}</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </main>
    </>
  );
}
