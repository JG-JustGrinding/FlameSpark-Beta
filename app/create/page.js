"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from "next/link";
import Header from "@/components/Header";
import styles from "@/styles/create.module.css";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function CreatePage() {
  const router = useRouter();

  const MAX_TITLE_LENGTH = 30;
  const MAX_Tagline_LENGTH = 75;
  const MAX_DESCRIPTION_LENGTH = 1500;
  const MAX_TAG_COUNT = 5;

  const MAX_PREVIEW_IMAGES = 5;

  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");

  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  const [coverImage, setCoverImage] = useState(null);
  const [iconImage, setIconImage] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);

  const [coverUpload, setCoverUpload] = useState(null);
  const [iconUpload, setIconUpload] = useState(null);
  const [previewUpload, setPreviewUpload] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // user
  const [user, setUser] = useState(null);
    useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data }) => {
      const currentUser = data.session?.user || null;
      setUser(currentUser);
    });

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
    });

    return () => listener.subscription.unsubscribe();
  });
  //

  const handleAddTag = () => {
    if (tagInput && tags.length < MAX_TAG_COUNT) {
      setTags([...tags, tagInput]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleCoverChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCoverImage(URL.createObjectURL(e.target.files[0]));
      setCoverUpload(e.target.files[0]);
    } else {
      setCoverImage(null);
      setCoverUpload(null); 
    }
  };

  const handleIconChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setIconImage(URL.createObjectURL(e.target.files[0]));
      setIconUpload(e.target.files[0]);
    } else {
      setIconImage(null);
      setIconUpload(null);
    }
  };

  const handlePreviewChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const newUrls = newFiles.map((file) => URL.createObjectURL(file));

      const combined = [...previewImages, ...newUrls].slice(0, MAX_PREVIEW_IMAGES);
      const combinedFiles = [...previewUpload, ...newFiles].slice(0, MAX_PREVIEW_IMAGES);

      setPreviewImages(combined);
      setPreviewUpload(combinedFiles);
    }
  };

  const handleRemovePreviewImage = (index) => {
    URL.revokeObjectURL(previewImages[index]);

    setPreviewImages(previewImages.filter((_, i) => i !== index));
    setPreviewUpload(previewUpload.filter((_, i) => i !== index));
  }

  const uploadFile = async (bucket, path, file) => {
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      upsert: true,
    });
    if (error) throw error;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };

    const handleSubmit = async () => {
    setError(null);
    setSuccess(false);
    let uploadedFiles = [];
    let projectId = null;

    // Basic validation
    if (!title || !tagline || !description || !coverImage || !iconImage) {
      setError("Please fill in all required fields.");
      return;
    }

    const id = user?.id;

    if (id == null)
    {
      setError("You must be logged in to create a project")
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      // 1. Insert project row
      const { data: project, error: insertError } = await supabase
        .from("projects")
        .insert({
          title,
          tagline,
          description,
          tags,
          owner_id: user.id,
        })
        .select()
        .single();

      if (insertError){
        throw insertError;
      }

      projectId = project.id;

      // 2. Upload files
      const coverUrl = await uploadFile(
        "project-covers",
        `${projectId}/cover.png`,
        coverUpload
      );
      uploadedFiles.push({ bucket: "project-covers", path: `${projectId}/cover.png` });

      const iconUrl = await uploadFile(
        "project-icons",
        `${projectId}/icon.png`,
        iconUpload
      );
      uploadedFiles.push({ bucket: "project-icons", path: `${projectId}/icon.png` });

      const previewUrls = [];
      if (previewUpload != null)
      {
        for (let i = 0; i < previewUpload.length; i++) {
          const file = previewUpload[i];
          const path = `${projectId}/preview-${i}.png`;
          const url = await uploadFile(
            "project-media",
            path,
            file
          );
          uploadedFiles.push({ bucket: "project-media", path });
          previewUrls.push(url);

          // store metadata in project_media table
          await supabase.from("project_media").insert({
            project_id: projectId,
            type: "image",
            url,
            is_preview: true,
            order_index: i,
          });
        }
      }

      // 3. Update project with cover/icon URLs
      const { error: updateError } = await supabase
        .from("projects")
        .update({
          cover_image: coverUrl,
          icon: iconUrl,
        })
        .eq("id", projectId);

      if (updateError) throw updateError;

      setSuccess(true);
      router.push(`/project/${projectId}`)
    } catch (err) {
      for (let f of uploadedFiles) {
        const { data, error } = await supabase.storage.from(f.bucket).remove([f.path]);
      }

      if (projectId) {
          const { data: deletedData, error: deleteError } = await supabase
            .from("projects")
            .delete()
            .eq("id", projectId);
          }
      
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header forceAuthRedirect={true}/>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
          <h1 className={`${styles.title} titleFont`}>Create A Project</h1>
            <p className={`${styles.subtitle} bodyFont label-color`}>The Journey Starts Here!</p>
          </div>

          <div className={styles.field}>
            <label className="bodyFont">Project Title</label>
            <input
              maxLength={MAX_TITLE_LENGTH}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter text here..."
              className="bodyFont input-field"
            />
            <span className={`${styles.counter} bodyFont label-color`}>{title.length}/{MAX_TITLE_LENGTH}</span>
          </div>

          <div className={styles.field}>
            <label className="bodyFont">Project Tagline</label>
            <input
              maxLength={MAX_Tagline_LENGTH}
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="A shortened description (Ex: A video game about creating a new country)"
              className="bodyFont input-field"
            />
            <span className={`${styles.counter} bodyFont label-color`}>{tagline.length}/{MAX_Tagline_LENGTH}</span>
          </div>

          <div className={styles.field}>
            <label className="bodyFont">Project Description</label>
            <textarea
              maxLength={MAX_DESCRIPTION_LENGTH}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="The project's full description"
              className="bodyFont input-field"
            />
            <span className={`${styles.counter} bodyFont label-color`}>{description.length}/{MAX_DESCRIPTION_LENGTH}</span>
          </div>

          <div className={styles.field}>
            <label className="bodyFont">Project Tags (max {MAX_TAG_COUNT})</label>
            <div className={styles.tagInputRow}>
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Enter text here..."
                className="bodyFont input-field"
              />
              <button type="button" className="button-shape bodyFont" onClick={handleAddTag}>
                Add
              </button>
            </div>
          <div className={styles.tags}>
              {tags.map((tag, i) => (
                <span key={i} className={`${styles.tag} bodyFont`}>
                  {tag}
                  <span
                    className={`${styles.removeTag} bodyFont`}
                    onClick={() => handleRemoveTag(i)}
                  >
                    ✕
                  </span>
                </span>
              ))}
            </div>
          </div>

          <div className={`${styles.field} ${styles.mb}`}>
            <label className="bodyFont">Cover Image (16:9)</label>
              <div className={styles.fileAndImage}>
                <input type="file" accept="image/*" onChange={handleCoverChange}
                        className="bodyFont input-field" />
                <img src={coverImage} className={`${styles.displayImage} ${styles.sixteennine} ${coverImage ? styles.solid : styles.dashed}`}/>
              </div>

            <label className={`${styles.mt} bodyFont`}>Project Logo</label>
              <div className={`${styles.fileAndImage}`}>
                <input type="file" accept="image/*" onChange={handleIconChange}
                        className="bodyFont input-field"/>
                <img src={iconImage} className={`${styles.displayImage} ${styles.squareRatio} ${iconImage ? styles.solid : styles.dashed} ${styles.profileIcon}`}/>
              </div>

            <label className={`${styles.mt} bodyFont`}>Preview Images (up to {MAX_PREVIEW_IMAGES})</label>
            {previewImages.length > 0 && <span className="label-color">{previewImages.length} {previewImages.length != 1 ? "Images" : "Image"}</span>}
            <input type="file" accept="image/*" className="bodyFont input-field" multiple  onChange={handlePreviewChange} />
            <div className={styles.previewImages}>
              {previewImages.map((img, i) => (
                <div key={i} className={styles.previewImageContainer}>
                  <img src={img} alt={`Preview ${i}`} className={`${styles.previewImage} ${styles.sixteennine}`} />
                  <button className="bodyFont button-shape" onClick={() => handleRemovePreviewImage(i)}>Remove</button>
                </div>
              ))}
            </div>
          </div>
          
          {error && <span className="error-message bodyFont body-size">{error}</span>}

          <button className={`${styles.submit} button-shape bodyFont`} onClick={handleSubmit} disabled={loading}> {loading ? "Creating Project..." : "Create Project"}</button>
        </div>
      </div>
    </>
  );
}