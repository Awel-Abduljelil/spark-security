import { useState, type FormEvent } from "react";
import { submitContact } from "../lib/api";
import { siteConfig } from "../data/siteConfig";
import { useAppSite } from "../hooks/useAppSite";
import { useLanguage } from "../i18n/useLanguage";
import "./pages.css";

export function Contact() {
  const { t } = useLanguage();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const { data: site, status: siteStatus } = useAppSite();
  const email = site?.settings.contact_email || siteConfig.email;
  const telegram = site?.settings.telegram || siteConfig.telegram;
  const linkedin = site?.settings.linkedin || siteConfig.linkedin;
  const github = site?.settings.github || siteConfig.github;
  const youtube = site?.settings.youtube || siteConfig.youtube;
  const phone = site?.settings.contact_phone;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formElement = e.currentTarget;
    const f = new FormData(formElement);
    const name = String(f.get("name") ?? "").trim();
    const from = String(f.get("email") ?? "").trim();
    const message = String(f.get("message") ?? "").trim();
    const next: Record<string, string> = {};
    if (name.length < 2) next.name = t("Enter your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(from)) next.email = t("Enter a valid email address.");
    if (message.length < 10) next.message = t("Write at least 10 characters.");
    setErrors(next);
    if (Object.keys(next).length) return;
    setSending(true);
    try {
      await submitContact({ name, email: from, message });
      formElement.reset();
      setSent(true);
    } catch (requestError) {
      setErrors({
        form: requestError instanceof Error
          ? requestError.message
          : t("Your message could not be sent. Please try again later."),
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="page">
      <div className="page-head">
        <h1>{t("Contact us")}</h1>
        <p>{t("Questions about courses, enrollment, or a security assessment? Send a message.")}</p>
      </div>
      <div className="contact-grid">
        <form className="contact-form" onSubmit={onSubmit} noValidate>
          <label>{t("Name")}<input name="name" autoComplete="name" /><span className="field-error">{errors.name}</span></label>
          <label>{t("Email")}<input name="email" type="email" autoComplete="email" /><span className="field-error">{errors.email}</span></label>
          <label>{t("Message")}<textarea name="message" /><span className="field-error">{errors.message}</span></label>
          {errors.form && <p className="field-error" role="alert">{errors.form}</p>}
          <button type="submit" disabled={sending}>
            {sending ? t("Sending...") : t("Send message")}
          </button>
          {sent && <p className="notice" role="status">{t("Your message has been sent.")}</p>}
        </form>
        <aside className="card">
          <h3>{t("Other ways to reach us")}</h3>
          <ul className="contact-list">
            {phone && <li><a href={`tel:${phone}`}>{phone}</a></li>}
            {email && <li><a href={`mailto:${email}`}>{email}</a></li>}
            {telegram && <li><a href={`https://t.me/${telegram}`} target="_blank" rel="noreferrer noopener">Telegram: @{telegram}</a></li>}
            {linkedin && <li><a href={linkedin} target="_blank" rel="noreferrer noopener">LinkedIn</a></li>}
            {github && <li><a href={github} target="_blank" rel="noreferrer noopener">GitHub</a></li>}
            {youtube && <li><a href={youtube} target="_blank" rel="noreferrer noopener">YouTube</a></li>}
            {!email && !telegram && !linkedin && !github && !youtube && <li className="notice">{t("Contact channels will be listed here.")}</li>}
          </ul>
          {siteStatus === "error" && (
            <p className="notice" role="alert">{t("Contact details are temporarily unavailable.")}</p>
          )}
          <p className="notice" style={{ marginTop: "var(--space-md)" }}>
            {t("Security testing is performed only with proper written authorization.")}
          </p>
        </aside>
      </div>
    </main>
  );
}
