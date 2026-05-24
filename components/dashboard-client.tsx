/* eslint-disable @next/next/no-img-element */
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { LogOut, Save, Trash2, UploadCloud, Video, X } from "lucide-react";
import { categories } from "@/lib/categories";
import { hasSupabaseConfig, supabase } from "@/lib/supabase";

type DashboardWorker = {
  id: string;
  user_id: string;
  name: string;
  category: string;
  category_slug: string;
  experience_years: number;
  rating: number;
  review_count: number;
  location: string;
  city: string;
  phone: string;
  whatsapp: string;
  profile_photo: string;
  short_description: string;
  bio: string;
  service_details: string[];
  gallery?: string[];
  available_today: boolean;
  starting_price: number;
};

type WorkPostRow = {
  id: string;
  media_url: string;
  media_type: "image" | "video";
  caption: string;
  created_at: string;
};

type WorkDraft = {
  file: File;
  objectUrl: string;
  mediaType: "image" | "video";
  zoom: number;
  offsetX: number;
  offsetY: number;
};

type CropDraft = {
  file: File;
  objectUrl: string;
  zoom: number;
  offsetX: number;
  offsetY: number;
};

const emptyProfile: DashboardWorker = {
  id: "",
  user_id: "",
  name: "",
  category: "Electrician",
  category_slug: "electrician",
  experience_years: 1,
  rating: 0,
  review_count: 0,
  location: "",
  city: "",
  phone: "",
  whatsapp: "",
  profile_photo: "",
  short_description: "",
  bio: "",
  service_details: [],

  available_today: true,
  starting_price: 299
};

function slugifyFileName(fileName: string) {
  return fileName.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
}

function loadBrowserImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function prepareWorkImageFile(workDraft: WorkDraft) {
  const image = await loadBrowserImage(workDraft.objectUrl);
  const outputWidth = 1400;
  const outputHeight = 788;
  const previewWidth = 560;
  const previewHeight = 315;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) return workDraft.file;

  const coverScale = Math.max(previewWidth / image.width, previewHeight / image.height) * workDraft.zoom;
  const displayedWidth = image.width * coverScale;
  const displayedHeight = image.height * coverScale;
  const left = (previewWidth - displayedWidth) / 2 + workDraft.offsetX;
  const top = (previewHeight - displayedHeight) / 2 + workDraft.offsetY;
  const sourceX = Math.max(0, Math.min(image.width - previewWidth / coverScale, -left / coverScale));
  const sourceY = Math.max(0, Math.min(image.height - previewHeight / coverScale, -top / coverScale));
  const sourceWidth = Math.min(image.width - sourceX, previewWidth / coverScale);
  const sourceHeight = Math.min(image.height - sourceY, previewHeight / coverScale);

  canvas.width = outputWidth;
  canvas.height = outputHeight;
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, outputWidth, outputHeight);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88));

  if (!blob) return workDraft.file;

  return new File([blob], workDraft.file.name.replace(/\.[^.]+$/, ".jpg"), {
    type: "image/jpeg"
  });
}
async function prepareProfileImageFile(crop: CropDraft) {
  const image = await loadBrowserImage(crop.objectUrl);
  const outputSize = 900;
  const previewSize = 360;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) return crop.file;

  const coverScale = Math.max(previewSize / image.width, previewSize / image.height) * crop.zoom;
  const displayedWidth = image.width * coverScale;
  const displayedHeight = image.height * coverScale;
  const left = (previewSize - displayedWidth) / 2 + crop.offsetX;
  const top = (previewSize - displayedHeight) / 2 + crop.offsetY;
  const sourceX = Math.max(0, Math.min(image.width - previewSize / coverScale, -left / coverScale));
  const sourceY = Math.max(0, Math.min(image.height - previewSize / coverScale, -top / coverScale));
  const sourceSize = Math.min(image.width - sourceX, image.height - sourceY, previewSize / coverScale);

  canvas.width = outputSize;
  canvas.height = outputSize;
  context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, outputSize, outputSize);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));

  if (!blob) return crop.file;

  return new File([blob], crop.file.name.replace(/\.[^.]+$/, ".jpg"), {
    type: "image/jpeg"
  });
}

export function DashboardClient() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<DashboardWorker>(emptyProfile);
  const [servicesText, setServicesText] = useState("");
  const [workCaption, setWorkCaption] = useState("");
  const [workDraft, setWorkDraft] = useState<WorkDraft | null>(null);
  const [workPosts, setWorkPosts] = useState<WorkPostRow[]>([]);
  const [workUploading, setWorkUploading] = useState(false);
  const [status, setStatus] = useState("Loading dashboard...");
  const [saving, setSaving] = useState(false);
  const [cropDraft, setCropDraft] = useState<CropDraft | null>(null);
  const [cropSaving, setCropSaving] = useState(false);

  const publicProfileUrl = useMemo(() => {
    return profile.id ? `/workers/${profile.id}` : "";
  }, [profile.id]);

  useEffect(() => {
    async function load() {
      if (!hasSupabaseConfig || !supabase) {
        setStatus("Add Supabase keys to .env.local to enable the dashboard.");
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const currentSession = sessionData.session;
      setSession(currentSession);

      if (!currentSession) {
        setStatus("Please login to manage your worker profile.");
        return;
      }

      const { data, error } = await supabase
        .from("workers")
        .select("id,user_id,name,category,category_slug,experience_years,rating,review_count,location,city,phone,whatsapp,profile_photo,short_description,bio,service_details,available_today,starting_price")
        .eq("user_id", currentSession.user.id)
        .maybeSingle();

      if (error) {
        setStatus(error.message);
        return;
      }

      const nextProfile = data
        ? (data as DashboardWorker)
        : {
            ...emptyProfile,
            id: crypto.randomUUID(),
            user_id: currentSession.user.id
          };

      setProfile(nextProfile);
      setServicesText(nextProfile.service_details.join("\n"));
      if (data) {
        const { data: postData } = await supabase
          .from("work_posts")
          .select("id, media_url, media_type, caption, created_at")
          .eq("worker_id", nextProfile.id)
          .order("created_at", { ascending: false });
        setWorkPosts((postData as WorkPostRow[]) ?? []);
      }
      setStatus(data ? "Profile loaded." : "Create your first worker profile.");
    }

    load();
  }, []);

  const cropObjectUrl = cropDraft?.objectUrl;

  useEffect(() => {
    return () => {
      if (cropObjectUrl) URL.revokeObjectURL(cropObjectUrl);
    };
  }, [cropObjectUrl]);

  function updateField<Key extends keyof DashboardWorker>(key: Key, value: DashboardWorker[Key]) {
    setProfile((current) => ({ ...current, [key]: value }));
  }

  function updateCategory(slug: string) {
    const selected = categories.find((category) => category.slug === slug) ?? categories[0];
    setProfile((current) => ({
      ...current,
      category: selected.name,
      category_slug: selected.slug
    }));
  }

  async function uploadFile(file: File, folder: "profile" | "work") {
    if (!supabase || !session) {
      setStatus("Login before uploading images.");
      return "";
    }

    const path = `${session.user.id}/${folder}/${Date.now()}-${slugifyFileName(file.name)}`;
    const { error } = await supabase.storage.from("worker-images").upload(path, file, {
      cacheControl: "3600",
      upsert: true
    });

    if (error) {
      setStatus(error.message);
      return "";
    }

    const { data } = supabase.storage.from("worker-images").getPublicUrl(path);
    return data.publicUrl;
  }

  function onProfilePhotoChange(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;

    setCropDraft((current) => {
      if (current) URL.revokeObjectURL(current.objectUrl);
      return {
        file,
        objectUrl: URL.createObjectURL(file),
        zoom: 1,
        offsetX: 0,
        offsetY: 0
      };
    });
    setStatus("Adjust your profile photo, then upload it.");
  }

  async function uploadAdjustedProfilePhoto() {
    if (!cropDraft) return;

    try {
      setCropSaving(true);
      setStatus("Uploading adjusted profile photo...");
      const processedFile = await prepareProfileImageFile(cropDraft);
      const publicUrl = await uploadFile(processedFile, "profile");

      if (publicUrl) {
        updateField("profile_photo", publicUrl);
        setStatus("Profile photo uploaded.");
        URL.revokeObjectURL(cropDraft.objectUrl);
        setCropDraft(null);
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Profile photo upload failed. Please try again.");
    } finally {
      setCropSaving(false);
    }
  }

  function onWorkPostMediaChange(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;

    setWorkDraft((current) => {
      if (current) URL.revokeObjectURL(current.objectUrl);
      const mediaType = file.type.startsWith("video/") ? "video" : "image";
      return {
        file,
        mediaType,
        objectUrl: URL.createObjectURL(file),
        zoom: 1,
        offsetX: 0,
        offsetY: 0
      };
    });
    setStatus("Preview your work update, then upload it.");
  }

  async function uploadWorkDraft() {
    if (!workDraft) {
      setStatus("Choose a work photo or video first.");
      return;
    }

    if (!profile.id) {
      setStatus("Save your profile before adding work updates.");
      return;
    }

    if (!supabase || !session) {
      setStatus("Login before uploading work updates.");
      return;
    }

    try {
      setWorkUploading(true);
      setStatus("Uploading work update...");
      const uploadableFile = workDraft.mediaType === "image" ? await prepareWorkImageFile(workDraft) : workDraft.file;
      const publicUrl = await uploadFile(uploadableFile, "work");

      if (!publicUrl) return;

      const { data, error } = await supabase
        .from("work_posts")
        .insert({
          worker_id: profile.id,
          user_id: session.user.id,
          media_url: publicUrl,
          media_type: workDraft.mediaType,
          caption: workCaption || `${profile.category} work update`
        })
        .select("id, media_url, media_type, caption, created_at")
        .single();

      if (error) {
        setStatus(error.message);
        return;
      }

      setWorkPosts((current) => [data as WorkPostRow, ...current]);
      setWorkCaption("");
      URL.revokeObjectURL(workDraft.objectUrl);
      setWorkDraft(null);
      setStatus("Work update uploaded. It is now visible on your public profile.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Work update upload failed. Please try again.");
    } finally {
      setWorkUploading(false);
    }
  }

  async function deleteWorkPost(postId: string) {
    if (!supabase || !session) return;

    const confirmDelete = window.confirm("Delete this work update from your public profile?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("work_posts").delete().eq("id", postId).eq("user_id", session.user.id);

    if (error) {
      setStatus(error.message);
      return;
    }

    setWorkPosts((current) => current.filter((post) => post.id !== postId));
    setStatus("Work update deleted.");
  }
  async function saveProfile() {
    if (!supabase || !session) {
      setStatus("Please login before saving.");
      return;
    }

    setSaving(true);
    const serviceDetails = servicesText
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);


    const payload = {
      id: profile.id,
      user_id: session.user.id,
      name: profile.name,
      category: profile.category,
      category_slug: profile.category_slug,
      experience_years: profile.experience_years,
      location: profile.location,
      city: profile.city,
      phone: profile.phone || `+${profile.whatsapp}`,
      whatsapp: profile.whatsapp,
      short_description: profile.short_description,
      bio: profile.bio,
      service_details: serviceDetails,
      profile_photo:
        profile.profile_photo ||
        "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=600&q=80",
      available_today: profile.available_today,
      starting_price: profile.starting_price
    };

    const { error } = await supabase.from("workers").upsert(payload, { onConflict: "user_id" });
    setSaving(false);

    if (error) {
      setStatus(error.message);
      return;
    }

    setProfile((current) => ({ ...current, ...payload }));
    setStatus("Your registration is successful.");
    alert("Your registration is successful.");
    router.push(`/workers/${payload.id}`);
  }

  async function logout() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSession(null);
    setStatus("Logged out.");
  }

  if (!hasSupabaseConfig) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="text-2xl font-black text-ink">Supabase setup needed</h2>
        <p className="mt-3 text-slate-600">Add your Supabase URL and anon key to `.env.local`, then restart the dev server.</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="text-2xl font-black text-ink">Login required</h2>
        <p className="mt-3 text-slate-600">{status}</p>
        <Link
          href="/auth"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-brand px-5 text-sm font-bold text-white"
        >
          Login or sign up
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void saveProfile();
          }}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-soft"
        >
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-brand">Worker dashboard</p>
              <h1 className="mt-1 text-3xl font-black text-ink">Manage your profile</h1>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name">
              <input value={profile.name} onChange={(event) => updateField("name", event.target.value)} className="input" required />
            </Field>
            <Field label="Category">
              <select value={profile.category_slug} onChange={(event) => updateCategory(event.target.value)} className="input">
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Experience in years">
              <input
                type="number"
                min="0"
                value={profile.experience_years || ""}
                onChange={(event) => updateField("experience_years", event.target.value === "" ? 0 : Number(event.target.value))}
                className="input"
              />
            </Field>
            <Field label="Starting price">
              <input
                type="number"
                min="0"
                value={profile.starting_price || ""}
                onChange={(event) => updateField("starting_price", event.target.value === "" ? 0 : Number(event.target.value))}
                className="input"
              />
            </Field>
            <Field label="Area / location">
              <input value={profile.location} onChange={(event) => updateField("location", event.target.value)} className="input" required />
            </Field>
            <Field label="City">
              <input value={profile.city} onChange={(event) => updateField("city", event.target.value)} className="input" required />
            </Field>
            <Field label="WhatsApp number">
              <input value={profile.whatsapp} onChange={(event) => updateField("whatsapp", event.target.value)} className="input" required />
            </Field>
            <Field label="Call number">
              <input value={profile.phone} onChange={(event) => updateField("phone", event.target.value)} className="input" />
            </Field>
          </div>

          <Field label="Short card description">
            <input
              value={profile.short_description}
              onChange={(event) => updateField("short_description", event.target.value)}
              className="input"
              required
            />
          </Field>
          <Field label="About section">
            <textarea value={profile.bio} onChange={(event) => updateField("bio", event.target.value)} className="textarea" rows={4} required />
          </Field>
          <Field label="Service details, one per line">
            <textarea value={servicesText} onChange={(event) => setServicesText(event.target.value)} className="textarea" rows={4} />
          </Field>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <UploadBox label="Upload profile photo" icon={<UploadCloud className="h-5 w-5" />} onChange={onProfilePhotoChange} />
          </div>

          <div className="mt-5 rounded-xl bg-slate-50 p-4">
            <p className="text-sm font-black text-ink">Work photo / video update</p>
            <p className="mt-1 text-sm text-slate-600">Pehle preview dekho, phir upload karo. Ye public profile feed me dikhega.</p>
            <input
              value={workCaption}
              onChange={(event) => setWorkCaption(event.target.value)}
              className="mt-3 h-11 w-full rounded-lg bg-white px-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-teal-100"
              placeholder="Caption, example: Bathroom plumbing repair completed"
            />
            <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-white p-4 text-sm font-bold text-slate-700 shadow-sm transition hover:text-brand">
              <Video className="h-5 w-5" aria-hidden="true" />
              Choose work photo or video
              <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp,video/mp4,video/webm" onChange={(event) => onWorkPostMediaChange(event.target.files)} className="sr-only" />
            </label>

            {workDraft ? (
              <div className="mt-4 rounded-xl bg-white p-3 shadow-sm">
                <p className="mb-2 text-sm font-bold text-ink">Preview before upload</p>
                {workDraft.mediaType === "video" ? (
                  <video src={workDraft.objectUrl} controls playsInline className="aspect-video w-full rounded-lg bg-black object-cover" />
                ) : (
                  <div className="aspect-video w-full overflow-hidden rounded-lg bg-slate-100">
                    <img
                      src={workDraft.objectUrl}
                      alt="Work update preview"
                      className="h-full w-full object-cover"
                      style={{
                        transform: `translate(${workDraft.offsetX}px, ${workDraft.offsetY}px) scale(${workDraft.zoom})`,
                        transformOrigin: "center"
                      }}
                    />
                  </div>
                )}
                {workDraft.mediaType === "image" ? (
                  <div className="mt-4 space-y-3">
                    <CropSlider label="Zoom" min={1} max={3} step={0.05} value={workDraft.zoom} onChange={(value) => setWorkDraft({ ...workDraft, zoom: value })} />
                    <CropSlider label="Left / Right" min={-160} max={160} step={1} value={workDraft.offsetX} onChange={(value) => setWorkDraft({ ...workDraft, offsetX: value })} />
                    <CropSlider label="Up / Down" min={-120} max={120} step={1} value={workDraft.offsetY} onChange={(value) => setWorkDraft({ ...workDraft, offsetY: value })} />
                  </div>
                ) : null}
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => void uploadWorkDraft()}
                    disabled={workUploading}
                    className="inline-flex h-11 items-center justify-center rounded-lg bg-brand px-4 text-sm font-bold text-white disabled:opacity-70"
                  >
                    {workUploading ? "Uploading..." : "Upload update"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      URL.revokeObjectURL(workDraft.objectUrl);
                      setWorkDraft(null);
                    }}
                    className="inline-flex h-11 items-center justify-center rounded-lg bg-slate-100 px-4 text-sm font-bold text-ink"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}

            {workPosts.length > 0 ? (
              <div className="mt-5 space-y-3">
                <p className="text-sm font-black text-ink">Uploaded work updates</p>
                {workPosts.map((post) => (
                  <div key={post.id} className="flex gap-3 rounded-lg bg-white p-3 shadow-sm">
                    <div className="h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      {post.media_type === "video" ? (
                        <video src={post.media_url} className="h-full w-full object-cover" />
                      ) : (
                        <img src={post.media_url} alt={post.caption} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-bold text-ink">{post.caption}</p>
                      <p className="mt-1 text-xs text-slate-500">Visible on public profile</p>
                      <button
                        type="button"
                        onClick={() => void deleteWorkPost(post.id)}
                        className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-rose-600"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand px-6 text-sm font-bold text-white transition hover:bg-teal-800 disabled:opacity-70 sm:w-auto"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              {saving ? "Saving..." : "Save profile"}
            </button>
          </div>
        </form>

        <aside className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-soft">
            <Link
              href={publicProfileUrl || "/dashboard"}
              className="relative block aspect-[4/3] overflow-hidden rounded-lg bg-white outline-none focus-visible:outline-none focus-visible:ring-0"
            >
              {profile.profile_photo ? (
                <Image src={profile.profile_photo} alt={profile.name || "Worker profile"} fill className="object-cover" sizes="340px" />
              ) : null}
            </Link>
            <h2 className="mt-4 text-xl font-black text-ink">{profile.name || "Your name"}</h2>
            <p className="mt-1 text-sm font-semibold text-brand">{profile.category}</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">{profile.short_description || "Your profile preview appears here."}</p>
            {publicProfileUrl ? (
              <Link
                href={publicProfileUrl}
                className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-lg border border-slate-200 text-sm font-bold text-ink"
              >
                View public profile
              </Link>
            ) : null}
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
            <p className="font-bold text-ink">Status</p>
            <p className="mt-2">{status}</p>
            <button type="button" onClick={logout} className="mt-5 inline-flex items-center gap-2 font-bold text-brand">
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Logout
            </button>
          </div>
        </aside>
      </div>

      {cropDraft ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/65 px-3 py-4 sm:px-4 sm:py-6">
          <div className="max-h-[94vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-4 shadow-2xl sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-ink">Adjust profile photo</h2>
                <p className="mt-1 text-sm text-slate-600">Face ko square ke andar set karo, phir upload karo.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  URL.revokeObjectURL(cropDraft.objectUrl);
                  setCropDraft(null);
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                aria-label="Close photo adjust"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="mx-auto mt-5 aspect-square w-full max-w-[280px] overflow-hidden rounded-xl bg-slate-100 sm:max-w-[360px]">
              <Image
                src={cropDraft.objectUrl}
                alt="Profile photo preview"
                width={280}
                height={280}
                unoptimized
                className="h-full w-full object-cover"
                style={{
                  transform: `translate(${cropDraft.offsetX}px, ${cropDraft.offsetY}px) scale(${cropDraft.zoom})`,
                  transformOrigin: "center"
                }}
              />
            </div>

            <div className="mt-5 space-y-4">
              <CropSlider label="Zoom" min={1} max={3} step={0.05} value={cropDraft.zoom} onChange={(value) => setCropDraft({ ...cropDraft, zoom: value })} />
              <CropSlider label="Left / Right" min={-120} max={120} step={1} value={cropDraft.offsetX} onChange={(value) => setCropDraft({ ...cropDraft, offsetX: value })} />
              <CropSlider label="Up / Down" min={-120} max={120} step={1} value={cropDraft.offsetY} onChange={(value) => setCropDraft({ ...cropDraft, offsetY: value })} />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setCropDraft({ ...cropDraft, zoom: 1, offsetX: 0, offsetY: 0 })}
                className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 text-sm font-bold text-ink"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => void uploadAdjustedProfilePhoto()}
                disabled={cropSaving}
                className="inline-flex h-11 items-center justify-center rounded-lg bg-brand px-5 text-sm font-bold text-white disabled:opacity-70"
              >
                {cropSaving ? "Uploading..." : "Upload photo"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mt-4 block">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

function UploadBox({
  label,
  icon,
  multiple,
  onChange
}: {
  label: string;
  icon: React.ReactNode;
  multiple?: boolean;
  onChange: (files: FileList | null) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-sm font-bold text-slate-700 transition hover:border-brand">
      {icon}
      {label}
      <input type="file" accept="image/*" multiple={multiple} onChange={(event) => onChange(event.target.files)} className="sr-only" />
    </label>
  );
}

function CropSlider({
  label,
  min,
  max,
  step,
  value,
  onChange
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 w-full accent-teal-700"
      />
    </label>
  );
}



















