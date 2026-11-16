import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AdminApiError,
  createCourse,
  getCourse,
  uploadImage,
  updateCourse,
  type AdminCourse,
  type AdminCourseContent,
  type AdminCourseInput,
  type AdminCourseLevel,
  type AdminCourseStatus,
  type CourseLanguage,
  type AdminValidationIssue,
} from "../../lib/adminApi";

interface EditorValues {
  slug: string;
  status: AdminCourseStatus;
  sortOrder: string;
  title: string;
  level: AdminCourseLevel;
  duration: string;
  sessions: string;
  labs: string;
  platform: string;
  language: CourseLanguage;
  cohortsPerYear: string;
  tag: string;
  description: string;
  cover: string;
  instructorPhoto: string;
  skills: string;
  content: string;
}

const templateContent: AdminCourseContent = {
  outcomes: [
    "Explain the legal and ethical boundaries of authorized security work.",
    "Identify common security risks and recommend practical mitigations.",
  ],
  weeks: [
    {
      title: "Ethics, consent, and scope",
      topics: [
        "Authorization and responsible practice",
        "Rules of engagement",
      ],
    },
    {
      title: "Security foundations",
      topics: [
        "Confidentiality, integrity, and availability",
        "Threats, vulnerabilities, and risk",
      ],
    },
  ],
  requirements: [
    "A laptop or desktop computer and a reliable internet connection.",
    "A willingness to follow the course ethics and lab-safety rules.",
  ],
  audience: [
    "You are new to cybersecurity and want a guided starting point.",
    "You are building a foundation before choosing a technical specialty.",
  ],
  instructors: [
    {
      name: "Instructor Name",
      role: "Lead instructor",
      bio: "Guides the cohort through security fundamentals, responsible practice, and clear reporting.",
    },
  ],
};

function createInitialValues(): EditorValues {
  return {
    slug: "",
    status: "draft",
    sortOrder: "0",
    title: "",
    level: "Beginner",
    duration: "",
    sessions: "0",
    labs: "0",
    platform: "",
    language: "en",
    cohortsPerYear: "",
    tag: "",
    description: "",
    cover: "",
    instructorPhoto: "",
    skills: "",
    content: JSON.stringify(templateContent, null, 2),
  };
}

function valuesFromCourse(course: AdminCourse): EditorValues {
  return {
    slug: course.slug,
    status: course.status,
    sortOrder: String(course.sortOrder),
    title: course.title,
    level: course.level,
    duration: course.duration,
    sessions: String(course.sessions),
    labs: String(course.labs),
    platform: course.platform ?? "",
    language: course.language,
    cohortsPerYear:
      course.cohortsPerYear === null ? "" : String(course.cohortsPerYear),
    tag: course.tag ?? "",
    description: course.description,
    cover: course.cover ?? "",
    instructorPhoto: course.content.instructors[0]?.photo ?? "",
    skills: course.skills.join(", "),
    content: JSON.stringify(course.content, null, 2),
  };
}

function parseContent(value: string): AdminCourseContent {
  const parsed: unknown = JSON.parse(value);
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("Course content must be a JSON object.");
  }
  return parsed as AdminCourseContent;
}

export function AdminCourseEditor({ isNew = false }: { isNew?: boolean }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [values, setValues] = useState(createInitialValues);
  const [baseline, setBaseline] = useState(() => JSON.stringify(createInitialValues()));
  const [loadedSlug, setLoadedSlug] = useState<string | null>(null);
  const [loadErrorState, setLoadErrorState] = useState<{
    slug: string;
    message: string;
  } | null>(null);
  const [pageError, setPageError] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [issues, setIssues] = useState<AdminValidationIssue[]>([]);
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<"cover" | "instructorPhoto" | null>(null);
  const dirty = isNew
    ? JSON.stringify(values) !== baseline
    : loadedSlug === slug && JSON.stringify(values) !== baseline;
  const loadError =
    loadErrorState && loadErrorState.slug === slug
      ? loadErrorState.message
      : "";

  useEffect(() => {
    if (isNew || !slug) return;
    let active = true;
    getCourse(slug)
      .then((course) => {
        if (!active) return;
        setLoadErrorState(null);
        const nextValues = valuesFromCourse(course);
        setValues(nextValues);
        setBaseline(JSON.stringify(nextValues));
        setLoadedSlug(slug);
      })
      .catch((error: unknown) => {
        if (active) {
          setLoadErrorState({
            slug,
            message:
              error instanceof Error ? error.message : "Could not load course.",
          });
          setLoadedSlug(slug);
        }
      });
    return () => {
      active = false;
    };
  }, [isNew, slug]);

  useEffect(() => {
    if (!dirty) return;
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [dirty]);

  function update<K extends keyof EditorValues>(key: K, value: EditorValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setSuccess("");
  }

  async function handleImageUpload(
    field: "cover" | "instructorPhoto",
    file: File | undefined,
  ) {
    if (!file) return;
    setPageError("");
    setUploadingImage(field);
    try {
      const { url } = await uploadImage(file);
      update(field, url);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "Could not upload image.");
    } finally {
      setUploadingImage(null);
    }
  }

  function formatContent() {
    try {
      update("content", JSON.stringify(parseContent(values.content), null, 2));
      setJsonError("");
    } catch (error) {
      setJsonError(error instanceof Error ? error.message : "Invalid JSON.");
    }
  }

  function loadTemplate() {
    if (values.content.trim() && !window.confirm("Replace the current content JSON with the template?")) {
      return;
    }
    update("content", JSON.stringify(templateContent, null, 2));
    setJsonError("");
    setIssues([]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPageError("");
    setJsonError("");
    setIssues([]);
    setSuccess("");

    let content: AdminCourseContent;
    try {
      content = parseContent(values.content);
      if (content.instructors[0]) {
        content.instructors[0] = {
          ...content.instructors[0],
          photo: values.instructorPhoto.trim() || null,
        };
      }
    } catch (error) {
      setJsonError(error instanceof Error ? error.message : "Invalid JSON.");
      return;
    }

    const payload: AdminCourseInput = {
      slug: values.slug.trim(),
      status: values.status,
      sortOrder: Number(values.sortOrder),
      title: values.title.trim(),
      level: values.level,
      duration: values.duration.trim(),
      sessions: Number(values.sessions),
      labs: Number(values.labs),
      platform: values.platform.trim() || null,
      language: values.language,
      cohortsPerYear: values.cohortsPerYear.trim()
        ? Number(values.cohortsPerYear)
        : null,
      ...(values.tag.trim() ? { tag: values.tag.trim() } : {}),
      description: values.description.trim(),
      cover: values.cover.trim() || null,
      skills: values.skills.split(",").map((skill) => skill.trim()).filter(Boolean),
      content,
    };

    setSaving(true);
    try {
      if (isNew) {
        const created = await createCourse(payload);
        setSuccess("Course created.");
        navigate(`/admin/courses/${encodeURIComponent(created.slug)}`, { replace: true });
      } else if (slug) {
        await updateCourse(slug, {
          status: payload.status,
          sortOrder: payload.sortOrder,
          title: payload.title,
          level: payload.level,
          duration: payload.duration,
          sessions: payload.sessions,
          labs: payload.labs,
          platform: payload.platform ?? null,
          language: payload.language,
          cohortsPerYear: payload.cohortsPerYear ?? null,
          tag: payload.tag ?? null,
          description: payload.description,
          cover: payload.cover ?? null,
          skills: payload.skills,
          content: payload.content,
        });
        setSuccess("Course saved.");
        setBaseline(JSON.stringify(values));
      }
    } catch (error) {
      if (error instanceof AdminApiError && error.issues.length) {
        setIssues(error.issues);
      } else {
        setPageError(error instanceof Error ? error.message : "Could not save course.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (!isNew && loadedSlug !== slug) {
    return <p className="admin-loading" role="status">Loading course...</p>;
  }
  if (loadError) {
    return <p className="admin-error" role="alert">{loadError}</p>;
  }

  return (
    <main className="admin-page">
      <header className="admin-topbar">
        <div className="admin-heading">
          <p className="admin-eyebrow">Spark Academy</p>
          <h1>{isNew ? "New course" : "Edit course"}</h1>
        </div>
        <Link className="admin-link-button" to="/admin/courses">Back to courses</Link>
      </header>
      {pageError && <p className="admin-error" role="alert">{pageError}</p>}
      {success && <p className="admin-success" role="status">{success}</p>}
      <form className="admin-panel admin-course-form" onSubmit={handleSubmit}>
        <div className="admin-course-fields">
          <label className="admin-field">
            Slug
            <input
              required
              minLength={3}
              maxLength={60}
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              disabled={!isNew}
              value={values.slug}
              onChange={(event) => update("slug", event.currentTarget.value)}
              placeholder="ethical-hacking-foundations"
            />
            {isNew && <small>Lowercase letters, numbers, and single hyphens.</small>}
          </label>
          <label className="admin-field">
            Title
            <input required minLength={3} maxLength={100} value={values.title} onChange={(event) => update("title", event.currentTarget.value)} />
          </label>
          <label className="admin-field">
            Level
            <select value={values.level} onChange={(event) => update("level", event.currentTarget.value as AdminCourseLevel)}>
              <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
            </select>
          </label>
          <label className="admin-field">
            Status
            <select value={values.status} onChange={(event) => update("status", event.currentTarget.value as AdminCourseStatus)}>
              <option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option>
            </select>
          </label>
          <label className="admin-field">
            Sort order
            <input type="number" min="0" max="999" required value={values.sortOrder} onChange={(event) => update("sortOrder", event.currentTarget.value)} />
          </label>
          <label className="admin-field">
            Duration
            <input required maxLength={40} value={values.duration} onChange={(event) => update("duration", event.currentTarget.value)} />
          </label>
          <label className="admin-field">
            Sessions
            <input type="number" min="0" max="200" required value={values.sessions} onChange={(event) => update("sessions", event.currentTarget.value)} />
          </label>
          <label className="admin-field">
            Labs
            <input type="number" min="0" max="200" required value={values.labs} onChange={(event) => update("labs", event.currentTarget.value)} />
          </label>
          <label className="admin-field">
            Platform
            <input maxLength={120} value={values.platform} onChange={(event) => update("platform", event.currentTarget.value)} />
          </label>
          <label className="admin-field">
            Language
            <select
              required
              value={values.language}
              onChange={(event) => update("language", event.currentTarget.value as CourseLanguage)}
            >
              <option value="en">English</option>
              <option value="om">Afaan Oromoo</option>
              <option value="am">አማርኛ</option>
            </select>
          </label>
          <label className="admin-field">
            Cohorts per year
            <input type="number" min="1" max="52" value={values.cohortsPerYear} onChange={(event) => update("cohortsPerYear", event.currentTarget.value)} />
          </label>
          <label className="admin-field">
            Tag
            <input maxLength={30} value={values.tag} onChange={(event) => update("tag", event.currentTarget.value)} />
          </label>
          <label className="admin-field">
            Skills (comma separated)
            <input value={values.skills} onChange={(event) => update("skills", event.currentTarget.value)} />
          </label>
          <label className="admin-field admin-course-description">
            Description
            <textarea required minLength={10} maxLength={400} value={values.description} onChange={(event) => update("description", event.currentTarget.value)} />
          </label>
          <label className="admin-field">
            Course cover image URL
            <input maxLength={500} type="text" inputMode="url" value={values.cover} onChange={(event) => update("cover", event.currentTarget.value)} placeholder="https://... or upload below" />
            <small>Use an HTTPS image URL or a path returned by image upload.</small>
          </label>
          <label className="admin-field">
            Upload course cover
            <input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploadingImage !== null} onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              event.currentTarget.value = "";
              void handleImageUpload("cover", file);
            }} />
            {uploadingImage === "cover" && <small role="status">Uploading course cover...</small>}
          </label>
          {values.cover && (
            <img className="admin-course-image-preview" src={values.cover} alt="Course cover preview" />
          )}
          <label className="admin-field">
            Lead instructor photo URL
            <input maxLength={500} type="text" inputMode="url" value={values.instructorPhoto} onChange={(event) => update("instructorPhoto", event.currentTarget.value)} placeholder="https://... or upload below" />
            <small>Applies to the first instructor in the course content.</small>
          </label>
          <label className="admin-field">
            Upload lead instructor photo
            <input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploadingImage !== null} onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              event.currentTarget.value = "";
              void handleImageUpload("instructorPhoto", file);
            }} />
            {uploadingImage === "instructorPhoto" && <small role="status">Uploading instructor photo...</small>}
          </label>
          {values.instructorPhoto && (
            <img className="admin-course-image-preview admin-course-image-preview--instructor" src={values.instructorPhoto} alt="Lead instructor photo preview" />
          )}
        </div>
        <section className="admin-course-content">
          <div className="admin-course-content__heading">
            <label className="admin-field" htmlFor="course-content-json">Course content (JSON)</label>
            <div>
              <button className="invert" type="button" onClick={formatContent}>Format JSON</button>
              <button className="invert" type="button" onClick={loadTemplate}>Load template</button>
            </div>
          </div>
          <textarea
            id="course-content-json"
            className="admin-course-json"
            required
            spellCheck={false}
            value={values.content}
            onChange={(event) => update("content", event.currentTarget.value)}
          />
          {jsonError && <p className="admin-error" role="alert">{jsonError}</p>}
          {issues.length > 0 && (
            <ul className="admin-error admin-validation-issues" role="alert">
              {issues.map((issue, index) => (
                <li key={`${issue.path}-${index}`}><strong>{issue.path || "content"}</strong>: {issue.message}</li>
              ))}
            </ul>
          )}
        </section>
        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : isNew ? "Create course" : "Save course"}
        </button>
        {dirty && <span className="admin-dirty-indicator">Unsaved changes</span>}
      </form>
    </main>
  );
}