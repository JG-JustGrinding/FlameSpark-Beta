"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import Header from "@/components/Header";
import "../../styles/account.css";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/useUser";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTag, faBook, faHeart } from "@fortawesome/free-solid-svg-icons";

export default function AccountPage() {
  const router = useRouter();
  const [avatar, setAvatar] = useState(null);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [interestsField, setInterestsField] = useState("");
  const [interestsArray, setInterestsArray] = useState([]);
  const [savingInfo, setSavingInfo] = useState(false);
  const { user, userSet, avatar: current_avatar, username: currentUsername, bio: currentBio, interests: currentInterests, setAvatar: setCurrentAvatar } = useUser();
  const fileInputRef = useRef(null);
  const [newProfilePending, setNewProfilePending] = useState(false);
  const [newAvatarFile, setNewAvatarFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileInfoError, setProfileInfoError] = useState("");
  const [profileInfoSuccess, setProfileInfoSuccess] = useState("");

  const MAX_INTERESTS_COUNT = 5;

  useEffect(() => {
    if (userSet && !user) {
      router.push("/login");
    }
  }, [userSet, user, router]);

  useEffect(() => {

    if (user) {
      if (userSet && !newProfilePending)
      {
        setAvatar(current_avatar || "/profile_icon_colored.svg");
      }
      setUsername(currentUsername || "No Username");
      setBio(currentBio || "");
      setInterestsArray(currentInterests || []);
    } else {
      setAvatar(null);
      setUsername(null);
      setBio(null);
      setInterestsArray([]);
    }
    }, [user, userSet, current_avatar, currentUsername, currentBio, currentInterests]);

    async function onNewAvatarUploaded(event) {
      URL.revokeObjectURL(avatar);

      setNewProfilePending(true);

      const file = event.target.files[0];
      if (!file) return;
      const newUrl = URL.createObjectURL(file);
      setAvatar(newUrl);
      setProfileSuccess("");
      setNewAvatarFile(file);
    }

    async function cancelNewAvatar(){
      setAvatar(current_avatar || "/profile_icon_colored.svg");
      setNewProfilePending(false);
      fileInputRef.current.value = '';
      setProfileSuccess("");
      setNewAvatarFile(null);
    }

    async function uploadAvatar(event) {
    try {

    if (user == null){
        return;
    }

      setUploading(true);
      setProfileError("");
      setProfileInfoSuccess("");
      setProfileSuccess("");

      const file = newAvatarFile;

      if (!file) return;

        const oldAvatarUrl = current_avatar;

        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}.${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

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

        const dataToUpdate = { avatar_url: publicUrl };

        const { data, error } = await supabase
        .from("profiles")
        .update(dataToUpdate)
        .eq("id", user.id);

        if (error)
        {
            setProfileError("Error: " + error.message);
            return;
        }

        // Delete old avatar
        if (oldAvatarUrl) {
          const url = new URL(oldAvatarUrl);
          const oldPath = url.pathname.split("/storage/v1/object/public/Avatars/")[1];
          if (oldPath) {
            await supabase.storage.from("Avatars").remove([oldPath]);
          }
        }

      setProfileSuccess("Profile picture updated");
      setCurrentAvatar(publicUrl);
      fileInputRef.current.value = '';
    } catch (error) {
        setProfileError("Error: " + error.message);
        setAvatar(current_avatar || "/profile_icon_colored.svg");
        fileInputRef.current.value = '';
        setNewAvatarFile(null);
    } finally {
      setUploading(false);
      setNewProfilePending(false);
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
      if (interestsArray !== undefined) dataToUpdate.interests = interestsArray;

      const { data, error } = await supabase
      .from("profiles")
      .update(dataToUpdate)
      .eq("id", user.id);

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

  useEffect(() => {
    if (!interestsField)
    {
      return;
    }

    if (interestsField.endsWith(','))
    {
      addInterest();
    }

  }, [interestsField])

  const addInterest = () => {
    let interest = interestsField.replace(/,/g, "");

    interest = interest.trim().replace(/\s+/g, " ");

    if (interest.length <= 0)
    {
      setTagInput("");
      return;
    }

    if (interest && interestsArray.length < MAX_INTERESTS_COUNT) {
      setInterestsArray([...interestsArray, interest]);
      setInterestsField("");
    }
  };

  const removeInterest = (index) => {
    setInterestsArray(interestsArray.filter((_, i) => i !== index));
  };

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
                            {profileSuccess && <p className="success-message titleFont">{profileSuccess}</p>}
                            <span className="bodyFont bold">Profile Picture</span>
                            <div className="change-container bodyFont">
                                <p className="label">Change Image:</p>
                                <div className="options">
                                  <input className="button-shape changeButton" type="file" accept="image/*" ref={fileInputRef} onChange={onNewAvatarUploaded} disabled={uploading}/>
                                  {newProfilePending && <button className="button-shape save-pfp-button" disabled={uploading} onClick={uploadAvatar}>{uploading ? "Saving..." : "Save"}</button> }
                                  {(newProfilePending && !uploading) && <button className="button-shape cancel-pfp-button" onClick={cancelNewAvatar}>Cancel</button> }
                                </div>
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
                            <input className="bodyFont input-field" type="text" placeholder="Enter text here..." disabled={interestsArray.length >= MAX_INTERESTS_COUNT}
                             value={interestsField == null ? "" : interestsField} 
                             onChange={(e) => {
                                              setInterestsField(e.target.value);
                                              setProfileInfoSuccess("");
                                              setProfileInfoError("");
                                              }}    
                              onKeyDown={(e) => e.key === "Enter" && addInterest()} 
                              />
                            <div className="interests">
                                {interestsArray.map((interest, i) => (
                                  <span key={i} className="interest bodyFont">
                                    {interest}
                                    <span
                                      className={`no-select-pointer bodyFont`}
                                      onClick={() => removeInterest(i)}
                                    >
                                      ✕
                                    </span>
                                  </span>
                                ))}
                              </div>
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
