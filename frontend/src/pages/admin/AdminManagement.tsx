import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { NavLink, useParams } from "react-router-dom";
import {
  changeAdminPassword,
  deleteFaq,
  deleteMessage,
  deleteMentor,
  deletePaymentMethod,
  disableAdminTotp,
  enableAdminTotp,
  getLegacyAdminInfo,
  getLegacySettings,
  listAuditEntries,
  listFaqs,
  listMessages,
  listMentors,
  listPaymentMethods,
  markMessageRead,
  saveFaq,
  saveMentor,
  savePaymentMethod,
  setupAdminTotp,
  updateLegacySettings,
  uploadImage,
  type LegacyAuditEntry,
  type LegacyFaq,
  type LegacyMessage,
  type LegacyMentor,
  type LegacyPaymentMethod,
  type LegacySettings,
  type TotpSetup,
} from "../../lib/adminApi";
import { adminUrl } from "../../lib/adminPath";

type Section = "website" | "mentors" | "faqs" | "payments" | "messages" | "security" | "audit";

const sections: Array<{ id: Section; label: string }> = [
  { id: "website", label: "Website content" },
  { id: "mentors", label: "Mentors" },
  { id: "faqs", label: "FAQs" },
  { id: "payments", label: "Payment methods" },
  { id: "messages", label: "Messages" },
  { id: "security", label: "Security" },
  { id: "audit", label: "Audit log" },
];

function messageOf(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <header className="admin-topbar">
      <div className="admin-heading">
        <p className="admin-eyebrow">Spark Academy</p>
        <h1>{title}</h1>
      </div>
      {children}
    </header>
  );
}

export function AdminManagement() {
  const { section = "website" } = useParams();
  const activeSection = sections.some((item) => item.id === section)
    ? section as Section
    : "website";

  return (
    <main className="admin-page">
      <PageHeader title={sections.find((item) => item.id === activeSection)?.label ?? "Management"} />
      <nav className="admin-management-nav" aria-label="Management sections">
        {sections.map((item) => (
          <NavLink
            key={item.id}
            to={adminUrl(`/settings/${item.id}`)}
            end
            aria-current={activeSection === item.id ? "page" : undefined}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      {activeSection === "website" && <WebsiteContent />}
      {activeSection === "mentors" && <MentorsSection />}
      {activeSection === "faqs" && <FaqsSection />}
      {activeSection === "payments" && <PaymentsSection />}
      {activeSection === "messages" && <MessagesSection />}
      {activeSection === "security" && <SecuritySection />}
      {activeSection === "audit" && <AuditSection />}
    </main>
  );
}

const contentFields: Array<{ key: keyof LegacySettings; label: string; multiline?: boolean }> = [
  { key: "hero_title", label: "Hero headline" },
  { key: "hero_text", label: "Hero description", multiline: true },
  { key: "about_text", label: "About section", multiline: true },
  { key: "mission", label: "Mission statement", multiline: true },
  { key: "cta_title", label: "Call-to-action title" },
  { key: "cta_text", label: "Call-to-action text", multiline: true },
  { key: "contact_email", label: "Contact email" },
  { key: "contact_phone", label: "Contact phone" },
  { key: "telegram", label: "Telegram username" },
  { key: "linkedin", label: "LinkedIn URL" },
  { key: "github", label: "GitHub URL" },
  { key: "youtube", label: "YouTube URL" },
  { key: "footer_text", label: "Footer text" },
  { key: "payment_reference", label: "Payment reference instruction", multiline: true },
  { key: "group_instructions", label: "Private-group instructions for approved students", multiline: true },
];

function WebsiteContent() {
  const [values, setValues] = useState<LegacySettings | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    getLegacySettings()
      .then((result) => { if (active) setValues(result); })
      .catch((requestError: unknown) => { if (active) setError(messageOf(requestError, "Could not load website settings.")); });
    return () => { active = false; };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!values) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await updateLegacySettings(values);
      setNotice("Website content saved.");
    } catch (requestError) {
      setError(messageOf(requestError, "Could not save website settings."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <p className="admin-management-help">Update public site text, contact links, and student payment or group instructions.</p>
      {error && <p className="admin-error" role="alert">{error}</p>}
      {notice && <p className="admin-success" role="status">{notice}</p>}
      {values === null ? <p className="admin-loading" role="status">Loading website content...</p> : (
        <form className="admin-management-form" onSubmit={(event) => void submit(event)}>
          <div className="admin-management-fields">
            {contentFields.map((field) => (
              <label className="admin-field" key={field.key}>
                {field.label}
                {field.multiline ? (
                  <textarea value={values[field.key] ?? ""} onChange={(event) => setValues({ ...values, [field.key]: event.currentTarget.value })} />
                ) : (
                  <input value={values[field.key] ?? ""} onChange={(event) => setValues({ ...values, [field.key]: event.currentTarget.value })} />
                )}
              </label>
            ))}
          </div>
          <button type="submit" className="admin-management-primary" disabled={saving}>{saving ? "Saving..." : "Save website content"}</button>
        </form>
      )}
    </section>
  );
}

interface CrudColumn<T> {
  label: string;
  render: (row: T) => ReactNode;
}

interface CrudSectionProps<T extends { id: number }, Draft> {
  title: string;
  columns: CrudColumn<T>[];
  createDraft: (row?: T) => Draft;
  renderFields: (draft: Draft, setDraft: (draft: Draft) => void) => ReactNode;
  onLoad: () => Promise<T[]>;
  onSave: (id: number | null, draft: Draft) => Promise<unknown>;
  onDelete: (id: number) => Promise<unknown>;
  emptyText: string;
}

function CrudSection<T extends { id: number }, Draft>({
  title, columns, createDraft, renderFields, onLoad, onSave, onDelete, emptyText,
}: CrudSectionProps<T, Draft>) {
  const [items, setItems] = useState<T[] | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setError("");
    try {
      setItems(await onLoad());
    } catch (requestError) {
      setError(messageOf(requestError, `Could not load ${title.toLowerCase()}.`));
    }
  }

  useEffect(() => {
    let active = true;
    onLoad()
      .then((result) => { if (active) setItems(result); })
      .catch((requestError: unknown) => { if (active) setError(messageOf(requestError, `Could not load ${title.toLowerCase()}.`)); });
    return () => { active = false; };
  }, [onLoad, title]);

  function startCreate() {
    setEditingId(null);
    setDraft(createDraft());
    setError("");
  }

  function startEdit(row: T) {
    setEditingId(row.id);
    setDraft(createDraft(row));
    setError("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (draft === null) return;
    setSaving(true);
    setError("");
    try {
      await onSave(editingId, draft);
      setDraft(null);
      await load();
    } catch (requestError) {
      setError(messageOf(requestError, `Could not save ${title.toLowerCase()}.`));
    } finally {
      setSaving(false);
    }
  }

  async function remove(row: T) {
    if (!window.confirm(`Delete this ${title.toLowerCase().replace(/s$/, "")}? This cannot be undone.`)) return;
    setError("");
    try {
      await onDelete(row.id);
      await load();
    } catch (requestError) {
      setError(messageOf(requestError, `Could not delete ${title.toLowerCase()}.`));
    }
  }

  return (
    <section>
      <div className="admin-management-section-heading">
        <p className="admin-management-help">{title} are managed here and changes are written to the audit log.</p>
        <button type="button" className="admin-management-primary" onClick={startCreate}>Add {title.replace(/s$/, "")}</button>
      </div>
      {error && <p className="admin-error" role="alert">{error}</p>}
      {draft !== null && (
        <form className="admin-management-form admin-management-editor" onSubmit={(event) => void submit(event)}>
          <h2>{editingId === null ? `Add ${title.replace(/s$/, "")}` : `Edit ${title.replace(/s$/, "")}`}</h2>
          {renderFields(draft, setDraft)}
          <div className="admin-row-actions">
            <button type="submit" className="admin-management-primary" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
            <button type="button" className="admin-management-secondary" onClick={() => setDraft(null)}>Cancel</button>
          </div>
        </form>
      )}
      {items === null ? <p className="admin-loading" role="status">Loading {title.toLowerCase()}...</p> : items.length === 0 ? (
        <p className="admin-empty">{emptyText}</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr>{columns.map((column) => <th key={column.label}>{column.label}</th>)}<th>Actions</th></tr></thead>
            <tbody>{items.map((row) => (
              <tr key={row.id}>
                {columns.map((column) => <td key={column.label} data-label={column.label}>{column.render(row)}</td>)}
                <td data-label="Actions"><div className="admin-row-actions">
                  <button type="button" className="admin-management-secondary" onClick={() => startEdit(row)}>Edit</button>
                  <button type="button" className="danger" onClick={() => void remove(row)}>Delete</button>
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </section>
  );
}

interface MentorDraft {
  name: string; role: string; bio: string; specialties: string; achievements: string;
  photo: string; linkedin: string; github: string; published: boolean; sort: string;
}

const mentorDraft = (row?: LegacyMentor): MentorDraft => ({
  name: row?.name ?? "", role: row?.role ?? "", bio: row?.bio ?? "",
  specialties: row?.specialties?.join("\n") ?? "", achievements: row?.achievements?.join("\n") ?? "",
  photo: row?.photo ?? "", linkedin: row?.linkedin ?? "", github: row?.github ?? "",
  published: !!row?.published, sort: String(row?.sort ?? 0),
});

function MentorsSection() {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const renderFields = (draft: MentorDraft, update: (next: MentorDraft) => void) => (
    <div className="admin-management-fields">
      <label className="admin-field">Full name<input required maxLength={120} value={draft.name} onChange={(event) => update({ ...draft, name: event.currentTarget.value })} /></label>
      <label className="admin-field">Professional role<input maxLength={120} value={draft.role} onChange={(event) => update({ ...draft, role: event.currentTarget.value })} /></label>
      <label className="admin-field admin-management-field--full">Biography<textarea maxLength={2000} value={draft.bio} onChange={(event) => update({ ...draft, bio: event.currentTarget.value })} /></label>
      <label className="admin-field">Specialties (one per line)<textarea value={draft.specialties} onChange={(event) => update({ ...draft, specialties: event.currentTarget.value })} /></label>
      <label className="admin-field">Verified achievements (one per line)<textarea value={draft.achievements} onChange={(event) => update({ ...draft, achievements: event.currentTarget.value })} /></label>
      <label className="admin-field admin-management-field--full">Photo URL or uploaded image<input maxLength={300} value={draft.photo} onChange={(event) => update({ ...draft, photo: event.currentTarget.value })} /><input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={(event) => {
        const file = event.currentTarget.files?.[0];
        if (!file) return;
        setUploading(true);
        setUploadError("");
        void uploadImage(file).then(({ url }) => update({ ...draft, photo: url }))
          .catch((uploadRequestError: unknown) => setUploadError(messageOf(uploadRequestError, "Could not upload the photo.")))
          .finally(() => setUploading(false));
      }} />{uploading && <small role="status">Uploading photo...</small>}{uploadError && <small className="admin-error" role="alert">{uploadError}</small>}</label>
      <label className="admin-field">LinkedIn HTTPS URL<input type="url" value={draft.linkedin} onChange={(event) => update({ ...draft, linkedin: event.currentTarget.value })} /></label>
      <label className="admin-field">GitHub HTTPS URL<input type="url" value={draft.github} onChange={(event) => update({ ...draft, github: event.currentTarget.value })} /></label>
      <label className="admin-field">Sort order<input type="number" min="0" step="1" value={draft.sort} onChange={(event) => update({ ...draft, sort: event.currentTarget.value })} /></label>
      <label className="admin-checkbox"><input type="checkbox" checked={draft.published} onChange={(event) => update({ ...draft, published: event.currentTarget.checked })} /> Published publicly</label>
    </div>
  );
  return (
    <CrudSection
      title="Mentors"
      columns={[
        { label: "Mentor", render: (row) => <><strong>{row.name}</strong><small>{row.role}</small></> },
        { label: "Published", render: (row) => row.published ? "Yes" : "No" },
        { label: "Order", render: (row) => row.sort },
      ]}
      createDraft={mentorDraft}
      renderFields={renderFields}
      onLoad={listMentors}
      onSave={(id, draft) => saveMentor(id, {
        name: draft.name, role: draft.role, bio: draft.bio,
        specialties: draft.specialties.split("\n").map((value) => value.trim()).filter(Boolean),
        achievements: draft.achievements.split("\n").map((value) => value.trim()).filter(Boolean),
        photo: draft.photo, linkedin: draft.linkedin, github: draft.github,
        published: draft.published ? 1 : 0, sort: Number(draft.sort) || 0,
      })}
      onDelete={deleteMentor}
      emptyText="No mentor profiles yet."
    />
  );
}

interface FaqDraft { question: string; answer: string; published: boolean; sort: string }
const faqDraft = (row?: LegacyFaq): FaqDraft => ({
  question: row?.question ?? "", answer: row?.answer ?? "", published: row ? !!row.published : true, sort: String(row?.sort ?? 0),
});

function FaqsSection() {
  return (
    <CrudSection
      title="FAQs"
      columns={[
        { label: "Question", render: (row) => row.question },
        { label: "Published", render: (row) => row.published ? "Yes" : "No" },
        { label: "Order", render: (row) => row.sort },
      ]}
      createDraft={faqDraft}
      renderFields={(draft, update) => (
        <div className="admin-management-fields">
          <label className="admin-field admin-management-field--full">Question<input required maxLength={300} value={draft.question} onChange={(event) => update({ ...draft, question: event.currentTarget.value })} /></label>
          <label className="admin-field admin-management-field--full">Answer<textarea required maxLength={3000} value={draft.answer} onChange={(event) => update({ ...draft, answer: event.currentTarget.value })} /></label>
          <label className="admin-field">Sort order<input type="number" min="0" step="1" value={draft.sort} onChange={(event) => update({ ...draft, sort: event.currentTarget.value })} /></label>
          <label className="admin-checkbox"><input type="checkbox" checked={draft.published} onChange={(event) => update({ ...draft, published: event.currentTarget.checked })} /> Published publicly</label>
        </div>
      )}
      onLoad={listFaqs}
      onSave={(id, draft) => saveFaq(id, {
        question: draft.question, answer: draft.answer,
        published: draft.published ? 1 : 0, sort: Number(draft.sort) || 0,
      })}
      onDelete={deleteFaq}
      emptyText="No FAQs yet."
    />
  );
}

interface PaymentDraft { type: string; bank: string; holder: string; number: string; notes: string; active: boolean; sort: string }
const paymentDraft = (row?: LegacyPaymentMethod): PaymentDraft => ({
  type: row?.type ?? "", bank: row?.bank ?? "", holder: row?.holder ?? "", number: row?.number ?? "",
  notes: row?.notes ?? "", active: row ? !!row.active : true, sort: String(row?.sort ?? 0),
});

function PaymentsSection() {
  return (
    <CrudSection
      title="Payment methods"
      columns={[
        { label: "Method", render: (row) => <><strong>{row.type}</strong><small>{row.bank}</small></> },
        { label: "Account holder", render: (row) => row.holder },
        { label: "Account / phone", render: (row) => row.number },
        { label: "Shown to students", render: (row) => row.active ? "Yes" : "No" },
      ]}
      createDraft={paymentDraft}
      renderFields={(draft, update) => (
        <div className="admin-management-fields">
          <label className="admin-field">Payment type<input required maxLength={60} value={draft.type} onChange={(event) => update({ ...draft, type: event.currentTarget.value })} /></label>
          <label className="admin-field">Bank name<input maxLength={80} value={draft.bank} onChange={(event) => update({ ...draft, bank: event.currentTarget.value })} /></label>
          <label className="admin-field">Account holder<input maxLength={120} value={draft.holder} onChange={(event) => update({ ...draft, holder: event.currentTarget.value })} /></label>
          <label className="admin-field">Account or phone number<input maxLength={60} value={draft.number} onChange={(event) => update({ ...draft, number: event.currentTarget.value })} /></label>
          <label className="admin-field admin-management-field--full">Notes<textarea maxLength={300} value={draft.notes} onChange={(event) => update({ ...draft, notes: event.currentTarget.value })} /></label>
          <label className="admin-field">Sort order<input type="number" min="0" step="1" value={draft.sort} onChange={(event) => update({ ...draft, sort: event.currentTarget.value })} /></label>
          <label className="admin-checkbox"><input type="checkbox" checked={draft.active} onChange={(event) => update({ ...draft, active: event.currentTarget.checked })} /> Show to students</label>
        </div>
      )}
      onLoad={listPaymentMethods}
      onSave={(id, draft) => savePaymentMethod(id, {
        type: draft.type, bank: draft.bank, holder: draft.holder, number: draft.number,
        notes: draft.notes, active: draft.active ? 1 : 0, sort: Number(draft.sort) || 0,
      })}
      onDelete={deletePaymentMethod}
      emptyText="No payment methods configured."
    />
  );
}

function MessagesSection() {
  const [messages, setMessages] = useState<LegacyMessage[] | null>(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      setMessages(await listMessages());
      setError("");
    } catch (requestError) {
      setError(messageOf(requestError, "Could not load messages."));
    }
  }
  useEffect(() => {
    let active = true;
    listMessages()
      .then((result) => { if (active) setMessages(result); })
      .catch((requestError: unknown) => { if (active) setError(messageOf(requestError, "Could not load messages.")); });
    return () => { active = false; };
  }, []);

  async function markRead(id: number) {
    try { await markMessageRead(id); await load(); }
    catch (requestError) { setError(messageOf(requestError, "Could not mark message as read.")); }
  }
  async function remove(message: LegacyMessage) {
    if (!window.confirm(`Delete the message from ${message.name}?`)) return;
    try { await deleteMessage(message.id); await load(); }
    catch (requestError) { setError(messageOf(requestError, "Could not delete message.")); }
  }

  return (
    <section>
      {error && <p className="admin-error" role="alert">{error}</p>}
      {messages === null ? <p className="admin-loading" role="status">Loading messages...</p> : messages.length === 0 ? (
        <p className="admin-empty">No messages yet.</p>
      ) : <div className="admin-management-messages">{messages.map((message) => (
        <article className={`admin-management-message${message.read ? "" : " is-unread"}`} key={message.id}>
          <header><div><strong>{message.name}</strong> · <a href={`mailto:${message.email}`}>{message.email}</a></div>
            <time dateTime={new Date(message.created_at).toISOString()}>{new Date(message.created_at).toLocaleString()}</time></header>
          <p>{message.body}</p>
          <div className="admin-row-actions">
            {!message.read && <button type="button" className="admin-management-secondary" onClick={() => void markRead(message.id)}>Mark read</button>}
            <button type="button" className="danger" onClick={() => void remove(message)}>Delete</button>
          </div>
        </article>
      ))}</div>}
    </section>
  );
}

function SecuritySection() {
  const [info, setInfo] = useState<{ email: string; totp: boolean } | null>(null);
  const [setup, setSetup] = useState<TotpSetup | null>(null);
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [disablePassword, setDisablePassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    getLegacyAdminInfo()
      .then((result) => { if (active) setInfo(result); })
      .catch((requestError: unknown) => { if (active) setError(messageOf(requestError, "Could not load security settings.")); });
    return () => { active = false; };
  }, []);

  async function submitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(""); setNotice(""); setBusy(true);
    try {
      await changeAdminPassword(passwords);
      setPasswords({ current: "", next: "", confirm: "" });
      setNotice("Password updated. Other active sessions have been signed out.");
    } catch (requestError) { setError(messageOf(requestError, "Could not change password.")); }
    finally { setBusy(false); }
  }

  async function startTotp() {
    setError(""); setNotice(""); setBusy(true);
    try { setSetup(await setupAdminTotp()); }
    catch (requestError) { setError(messageOf(requestError, "Could not set up two-factor authentication.")); }
    finally { setBusy(false); }
  }

  async function confirmTotp() {
    setError(""); setNotice(""); setBusy(true);
    try {
      await enableAdminTotp(code);
      setInfo((current) => current ? { ...current, totp: true } : current);
      setSetup(null); setCode(""); setNotice("Two-factor authentication enabled.");
    } catch (requestError) { setError(messageOf(requestError, "Could not enable two-factor authentication.")); }
    finally { setBusy(false); }
  }

  async function turnOffTotp() {
    setError(""); setNotice(""); setBusy(true);
    try {
      await disableAdminTotp(disablePassword);
      setInfo((current) => current ? { ...current, totp: false } : current);
      setDisablePassword(""); setNotice("Two-factor authentication disabled.");
    } catch (requestError) { setError(messageOf(requestError, "Could not disable two-factor authentication.")); }
    finally { setBusy(false); }
  }

  return (
    <section>
      {error && <p className="admin-error" role="alert">{error}</p>}
      {notice && <p className="admin-success" role="status">{notice}</p>}
      {info === null ? <p className="admin-loading" role="status">Loading security settings...</p> : (
        <div className="admin-management-security">
          <section className="admin-panel">
            <h2>Admin account</h2>
            <p>{info.email}</p>
            <form className="admin-management-form" onSubmit={(event) => void submitPassword(event)}>
              <label className="admin-field">Current password<input type="password" autoComplete="current-password" required value={passwords.current} onChange={(event) => setPasswords({ ...passwords, current: event.currentTarget.value })} /></label>
              <label className="admin-field">New password<input type="password" autoComplete="new-password" required value={passwords.next} onChange={(event) => setPasswords({ ...passwords, next: event.currentTarget.value })} /></label>
              <label className="admin-field">Confirm new password<input type="password" autoComplete="new-password" required value={passwords.confirm} onChange={(event) => setPasswords({ ...passwords, confirm: event.currentTarget.value })} /></label>
              <p className="admin-management-help">At least 10 characters, including uppercase, lowercase, and a number.</p>
              <button className="admin-management-primary" type="submit" disabled={busy}>Update password</button>
            </form>
          </section>
          <section className="admin-panel">
            <h2>Two-factor authentication</h2>
            <p>Status: <strong>{info.totp ? "Enabled" : "Off"}</strong></p>
            {!info.totp && !setup && <button type="button" className="admin-management-primary" disabled={busy} onClick={() => void startTotp()}>Set up authenticator</button>}
            {setup && (
              <div className="admin-management-form">
                <p>Add this key to your authenticator app, then verify the six-digit code.</p>
                <code className="admin-management-secret">{setup.secret}</code>
                <a href={setup.uri}>Open authenticator app</a>
                <label className="admin-field">Authentication code<input inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(event) => setCode(event.currentTarget.value)} /></label>
                <div className="admin-row-actions">
                  <button type="button" className="admin-management-primary" disabled={busy || code.length === 0} onClick={() => void confirmTotp()}>Enable 2FA</button>
                  <button type="button" className="admin-management-secondary" onClick={() => setSetup(null)}>Cancel</button>
                </div>
              </div>
            )}
            {info.totp && (
              <div className="admin-management-form">
                <label className="admin-field">Confirm your password to disable<input type="password" autoComplete="current-password" value={disablePassword} onChange={(event) => setDisablePassword(event.currentTarget.value)} /></label>
                <button type="button" className="danger" disabled={busy || !disablePassword} onClick={() => void turnOffTotp()}>Disable 2FA</button>
              </div>
            )}
          </section>
        </div>
      )}
    </section>
  );
}

function AuditSection() {
  const [entries, setEntries] = useState<LegacyAuditEntry[] | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    listAuditEntries()
      .then((result) => { if (active) setEntries(result); })
      .catch((requestError: unknown) => { if (active) setError(messageOf(requestError, "Could not load audit log.")); });
    return () => { active = false; };
  }, []);

  return (
    <section>
      {error && <p className="admin-error" role="alert">{error}</p>}
      {entries === null ? <p className="admin-loading" role="status">Loading audit log...</p> : entries.length === 0 ? (
        <p className="admin-empty">No audit activity yet.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Time</th><th>Admin</th><th>Action</th><th>Entity / details</th><th>IP</th></tr></thead>
            <tbody>{entries.map((entry, index) => (
              <tr key={`${entry.created_at}-${entry.action}-${index}`}>
                <td data-label="Time">{new Date(entry.created_at).toLocaleString()}</td>
                <td data-label="Admin">{entry.email}</td>
                <td data-label="Action">{entry.action}</td>
                <td data-label="Entity / details">{entry.entity || entry.detail}</td>
                <td data-label="IP">{entry.ip}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </section>
  );
}
