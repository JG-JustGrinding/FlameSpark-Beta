'use client';

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import Header from "@/components/Header";
import styles from "@/styles/account.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTag, faBook, faHeart } from "@fortawesome/free-solid-svg-icons";
import { getUser } from "@/lib/projectFunctions";

export default function AccountPageClient({ initialProfile, MAX_INTERESTS_COUNT = 5 }) {
    const [user, setUser] = useState(initialProfile);
    const [avatar, setAvatar] = useState(initialProfile?.avatar_url || null);
    const [username, setUsername] = useState(initialProfile?.username ?? "");
    const [bio, setBio] = useState(initialProfile?.bio ?? "");
    const [interestsField, setInterestsField] = useState("");
    const [interestsArray, setInterestsArray] = useState(initialProfile?.interests ?? []);
    const [savingInfo, setSavingInfo] = useState(false);
    const [savingEmails, setSavingEmails] = useState(false);
    const fileInputRef = useRef(null);
    const [newProfilePending, setNewProfilePending] = useState(false);
    const [newAvatarFile, setNewAvatarFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [profileError, setProfileError] = useState("");
    const [profileSuccess, setProfileSuccess] = useState("");
    const [profileInfoError, setProfileInfoError] = useState("");
    const [profileInfoSuccess, setProfileInfoSuccess] = useState("");
    const [emailPrefsError, setEmailPrefsError] = useState("");
    const [emailPrefsSuccess, setEmailPrefsSuccess] = useState("");
    const [emailDigestEnabled, setEmailDigestEnabled] = useState(
        initialProfile?.disable_email_digest !== undefined
            ? !initialProfile.disable_email_digest
            : initialProfile?.email_digest ?? true
    );
    const [emailImportantEnabled, setEmailImportantEnabled] = useState(
        initialProfile?.disable_email_important !== undefined
            ? !initialProfile.disable_email_important
            : initialProfile?.email_important ?? true
    );
    const [emailInteractionEnabled, setEmailInteractionEnabled] = useState(
        initialProfile?.disable_email_interaction !== undefined
            ? !initialProfile.disable_email_interaction
            : initialProfile?.email_interaction ?? true
    );
    const [emailNewsletterEnabled, setEmailNewsletterEnabled] = useState(
        initialProfile?.disable_email_newsletter !== undefined
            ? !initialProfile.disable_email_newsletter
            : initialProfile?.email_newsletter ?? true
    );
    const maxProfilePicSizeMB = 2;
    const maxUsernameLength = 50;
    const maxBioLength = 300;

    useEffect(() => {
        // get user metadata on load
        const getMetadata = async () => {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (currentUser) {
                const meta = currentUser.user_metadata || {};
                setEmailDigestEnabled(!(meta.disable_email_digest ?? user?.disable_email_digest ?? false));
                setEmailImportantEnabled(!(meta.disable_email_important ?? user?.disable_email_important ?? false));
                setEmailInteractionEnabled(!(meta.disable_email_interaction ?? user?.disable_email_interaction ?? false));
                setEmailNewsletterEnabled(!(meta.disable_email_newsletter ?? user?.disable_email_newsletter ?? false));
            }
        };
        getMetadata();
    }, []);

    useEffect(() => {
        // Listen for auth changes
        const { data: listener } = supabase.auth.onAuthStateChange((event, session) => async () => {

            if (event === "INITIAL_SESSION") {
                return;
            }

            const currentUserId = session?.user?.id || null;

            if (currentUserId) {
                try {
                    const currentUser = await getUser(currentUserId);
                    setUser(currentUser);

                    if (currentUser)
                    {
                        setAvatar(currentUser.avatar_url || "/profile_icon_colored.svg");
                        setUsername(currentUser.username || "");
                        setBio(currentUser.bio || "");
                        setInterestsArray(currentUser.interests || []);
                        const meta = session?.user?.user_metadata || {};
                        setEmailDigestEnabled(!(meta.disable_email_digest ?? currentUser.disable_email_digest ?? false));
                        setEmailImportantEnabled(!(meta.disable_email_important ?? currentUser.disable_email_important ?? false));
                        setEmailInteractionEnabled(!(meta.disable_email_interaction ?? currentUser.disable_email_interaction ?? false));
                        setEmailNewsletterEnabled(!(meta.disable_email_newsletter ?? currentUser.disable_email_newsletter ?? false));
                    }
                } catch (error) {
                    window.location.href = "/";
                }
            } else {
                window.location.href = "/";
            }
        });

        return () => listener.subscription.unsubscribe();
    }, []);

    async function onNewAvatarUploaded(event) {
        URL.revokeObjectURL(avatar);

        setNewProfilePending(true);

        const file = event.target.files[0];
        if (!file) return;
        const newUrl = URL.createObjectURL(file);
        setAvatar(newUrl);
        setProfileSuccess("");
        setProfileError("");
        setNewAvatarFile(file);
    }

    async function cancelNewAvatar() {
        setAvatar(user?.avatar_url || "/profile_icon_colored.svg");
        setNewProfilePending(false);
        fileInputRef.current.value = '';
        setProfileSuccess("");
        setNewAvatarFile(null);
    }

    async function uploadAvatar(event) {
        try {
            if (user == null) {
                return;
            }

            setUploading(true);
            setProfileError("");
            setProfileInfoSuccess("");
            setProfileSuccess("");

            const file = newAvatarFile;

            if (!file) return;

            if (file.size > maxProfilePicSizeMB * 1024 * 1024) { // 2MB limit
                setProfileError(`Error: File size exceeds ${maxProfilePicSizeMB}MB limit.`);
                fileInputRef.current.value = '';
                setNewAvatarFile(null);
                setAvatar(initialProfile?.avatar_url || "/profile_icon_colored.svg");
                return;
            }

            const oldAvatarUrl = initialProfile?.avatar_url;

            const fileExt = file.name.split(".").pop();
            const fileName = `${user.id}.${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            let { error: uploadError } = await supabase.storage
                .from("Avatars")
                .upload(filePath, file, { upsert: true });

            if (uploadError) {
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

            if (error) {
                setProfileError("Error: " + error.message);
                return;
            }

            if (oldAvatarUrl) {
                const url = new URL(oldAvatarUrl);
                const oldPath = url.pathname.split("/storage/v1/object/public/Avatars/")[1];
                if (oldPath) {
                    await supabase.storage.from("Avatars").remove([oldPath]);
                }
            }

            setProfileSuccess("Profile picture updated");
            setAvatar(publicUrl);
            fileInputRef.current.value = '';
        } catch (error) {
            setProfileError("Error: " + error.message);
            setAvatar(user?.avatar_url || "/profile_icon_colored.svg");
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

            if (username.trim().length === 0) {
                setProfileInfoError("Error: Username cannot be empty.");
                return;
            }

            if (username.length > maxUsernameLength) {
                setProfileInfoError(`Error: Username cannot exceed ${maxUsernameLength} characters.`);
                return;
            }

            if (bio.length > maxBioLength) {
                setProfileInfoError(`Error: Bio cannot exceed ${maxBioLength} characters.`);
                return;
            }

            const dataToUpdate = {};
            if (username !== undefined) dataToUpdate.username = username;
            if (bio !== undefined) dataToUpdate.bio = bio;
            if (interestsArray !== undefined) dataToUpdate.interests = interestsArray;

            const { data, error } = await supabase
                .from("profiles")
                .update(dataToUpdate)
                .eq("id", user.id);

            if (error) {
                setProfileInfoError("Error: " + error.message);
                return;
            }

            setProfileInfoSuccess("Profile updated");
        } catch (error) {
            setProfileInfoError("Error: " + error.message);
        } finally {
            setSavingInfo(false);
        }
    }

    async function saveEmailPreferences() {
        try {
            setSavingEmails(true);
            setEmailPrefsError("");
            setEmailPrefsSuccess("");

            if (!user) return;

            const dataToUpdate = {
                disable_email_digest: !emailDigestEnabled,
                disable_email_important: !emailImportantEnabled,
                disable_email_interaction: !emailInteractionEnabled,
                disable_email_newsletter: !emailNewsletterEnabled,
            };

            const { error } = await supabase.auth.updateUser({
                data: dataToUpdate,
            });

            if (error) {
                setEmailPrefsError("Error: " + error.message);
                return;
            }

            setEmailPrefsSuccess("Email preferences updated");
        } catch (error) {
            setEmailPrefsError("Error: " + error.message);
        } finally {
            setSavingEmails(false);
        }
    }

    useEffect(() => {
        if (!interestsField) {
            return;
        }

        if (interestsField.endsWith(',')) {
            addInterest();
        }
    }, [interestsField]);

    const addInterest = () => {
        let interest = interestsField.replace(/,/g, "");

        interest = interest.trim().replace(/\s+/g, " ");

        if (interest.length <= 0) {
            setInterestsField("");
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

            <main className={styles.mainContainer}>
                <div className={styles.sidePanel}>
                    <div className={styles.options}>
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
                <div className={styles.contentView}>
                    <div className={styles.profile}>
                        {false && <h1 className="titleFont">User Profile</h1>}
                        <div className={styles.profileContent}>
                            <div className={`${styles.card} ${styles.profilePicture}`}>
                                <img className="pfp-shape" src={avatar || "/profile_icon_colored.svg"} alt="profile picture" />
                                <div className={styles.right}>
                                    {profileError && <p className="error-message titleFont">{profileError}</p>}
                                    {profileSuccess && <p className="success-message titleFont">{profileSuccess}</p>}
                                    <h2 className="titleFont bold reset">Profile Picture</h2>
                                    <div className={`${styles.changeContainer} bodyFont`}>
                                        <p className={styles.label}>Change Image:</p>
                                        <div className={styles.options}>
                                            <input className={`${styles.changeButton} button-shape`} type="file" accept=".jpg,.jpeg,.png,.webp,.avif" ref={fileInputRef} onChange={onNewAvatarUploaded} disabled={uploading} />
                                            <div>
                                                <p className={`label-color ${styles.label}`}>Recommended size: 512x512px. Max size: 2MB.</p>
                                            </div>
                                            <div>
                                                {newProfilePending && <button className={`${styles.savePfpButton} button-shape`} disabled={uploading} onClick={uploadAvatar}>{uploading ? "Saving..." : "Save"}</button>}
                                                {newProfilePending && !uploading && <button className={`${styles.cancelPfpButton} button-shape`} onClick={cancelNewAvatar}>Cancel</button>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={`${styles.card} ${styles.userInfo}`}>
                                <h2 className="titleFont" style={{marginBottom: '0px'}}>Profile Information</h2>
                                {profileInfoError && <p className="error-message titleFont">{profileInfoError}</p>}
                                {profileInfoSuccess && <p className="success-message titleFont">{profileInfoSuccess}</p>}

                                <div className={styles.inputContainer}>
                                    <div className={styles.label}>
                                        <FontAwesomeIcon icon={faTag} />
                                        <p className="label-color bodyFont body-size">Username</p>
                                    </div>
                                    <input
                                        className="bodyFont input-field"
                                        type="text"
                                        placeholder="Enter text here..."
                                        value={username == null ? "" : username}
                                        onChange={(e) => {
                                            setUsername(e.target.value);
                                            setProfileInfoSuccess("");
                                            setProfileInfoError("");
                                        }}
                                        maxLength={maxUsernameLength}
                                    />
                                </div>
                                <div className={styles.inputContainer}>
                                    <div className={styles.label}>
                                        <FontAwesomeIcon icon={faBook} />
                                        <p className="label-color bodyFont body-size">Bio</p>
                                    </div>
                                    <textarea
                                        className="bodyFont input-field"
                                        type="text"
                                        placeholder="Enter text here..."
                                        value={bio == null ? "" : bio}
                                        onChange={(e) => {
                                            setBio(e.target.value);
                                            setProfileInfoSuccess("");
                                            setProfileInfoError("");
                                        }}
                                        maxLength={maxBioLength}
                                    />
                                </div>
                                <div className={styles.inputContainer}>
                                    <div className={styles.label}>
                                        <FontAwesomeIcon icon={faHeart} />
                                        <p className="label-color bodyFont body-size">Interests (comma separated, e.g. "Art, Gaming")</p>
                                    </div>
                                    <input
                                        className="bodyFont input-field"
                                        type="text"
                                        placeholder="Enter text here..."
                                        disabled={interestsArray.length >= MAX_INTERESTS_COUNT}
                                        value={interestsField == null ? "" : interestsField}
                                        onChange={(e) => {
                                            setInterestsField(e.target.value);
                                            setProfileInfoSuccess("");
                                            setProfileInfoError("");
                                        }}
                                        onKeyDown={(e) => e.key === "Enter" && addInterest()}
                                    />
                                    <div className={styles.interests}>
                                        {interestsArray.map((interest, i) => (
                                            <span key={i} className={`${styles.interest} bodyFont`}>
                                                {interest}
                                                <span className={`no-select-pointer bodyFont`} onClick={() => removeInterest(i)}>
                                                    ✕
                                                </span>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className={styles.saveButtonContainer}>
                                    <button className="button-shape bodyFont" onClick={saveProfileInfo} disabled={savingInfo}>{`${savingInfo ? "Saving..." : "Save"}`}</button>
                                </div>
                            </div>
                            <div className={`${styles.card} ${styles.emailSettings}`}>
                                <h2 className="titleFont" style={{marginBottom: '0px'}}>Email Preferences</h2>
                                {false && <p className={`${styles.description} bodyFont`}>Choose which emails you want to receive.</p>}
                                {emailPrefsError && <p className="error-message titleFont reset">{emailPrefsError}</p>}
                                {emailPrefsSuccess && <p className="success-message titleFont reset">{emailPrefsSuccess}</p>}

                                <div className={styles.toggles}>
                                    <div className={styles.toggleRow}>
                                        <div className={styles.label}>
                                            <p className="label-color bodyFont body-size"><strong>Important</strong> Notifications</p>
                                        </div>
                                        <label className="bodyFont">
                                            <input
                                                type="checkbox"
                                                checked={!!emailImportantEnabled}
                                                onChange={(e) => {
                                                    setEmailImportantEnabled(e.target.checked);
                                                    setEmailPrefsSuccess("");
                                                    setEmailPrefsError("");
                                                }}
                                            />
                                            <span> Project completions and major updates</span>
                                        </label>
                                    </div>

                                    <div className={styles.toggleRow}>
                                        <div className={styles.label}>
                                            <p className="label-color bodyFont body-size">Digest Emails</p>
                                        </div>
                                        <label className="bodyFont">
                                            <input
                                                type="checkbox"
                                                checked={!!emailDigestEnabled}
                                                onChange={(e) => {
                                                    setEmailDigestEnabled(e.target.checked);
                                                    setEmailPrefsSuccess("");
                                                    setEmailPrefsError("");
                                                }}
                                            />
                                            <span> Periodic updates on recent activity</span>
                                        </label>
                                    </div>

                                    <div className={styles.toggleRow}>
                                        <div className={styles.label}>
                                            <p className="label-color bodyFont body-size">Interaction Emails</p>
                                        </div>
                                        <label className="bodyFont">
                                            <input
                                                type="checkbox"
                                                checked={!!emailInteractionEnabled}
                                                onChange={(e) => {
                                                    setEmailInteractionEnabled(e.target.checked);
                                                    setEmailPrefsSuccess("");
                                                    setEmailPrefsError("");
                                                }}
                                            />
                                            <span> Comments, replies and other direct activity</span>
                                        </label>
                                    </div>

                                    <div className={styles.toggleRow}>
                                        <div className={styles.label}>
                                            <p className="label-color bodyFont body-size">Newsletter Emails</p>
                                        </div>
                                        <label className="bodyFont">
                                            <input
                                                type="checkbox"
                                                checked={!!emailNewsletterEnabled}
                                                onChange={(e) => {
                                                    setEmailNewsletterEnabled(e.target.checked);
                                                    setEmailPrefsSuccess("");
                                                    setEmailPrefsError("");
                                                }}
                                            />
                                            <span> FlameSpark news and updates</span>
                                        </label>
                                    </div>
                                </div>

                                <div className={styles.saveButtonContainer} style={{ marginTop: '20px' }}>
                                    <button className="button-shape bodyFont" onClick={saveEmailPreferences} disabled={savingEmails}>{`${savingEmails ? "Saving..." : "Save Email Preferences"}`}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
