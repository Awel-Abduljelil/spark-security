import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/useLanguage";
import { useAppSite } from "../hooks/useAppSite";
import { MentorCarousel, type MentorProfile } from "../components/mentors/MentorCarousel";
import "./pages.css";

export function Mentors() {
  const { t } = useLanguage();
  const { data: site, status } = useAppSite();
  const profiles: MentorProfile[] = site
    ? site.mentors.map((mentor) => ({
        id: String(mentor.id),
        name: mentor.name,
        role: mentor.role,
        bio: mentor.bio,
        specialties: mentor.specialties,
        achievements: mentor.achievements,
        photo: mentor.photo ?? undefined,
        links: [
          ...(mentor.linkedin ? [{ label: "LinkedIn", url: mentor.linkedin }] : []),
          ...(mentor.github ? [{ label: "GitHub", url: mentor.github }] : []),
        ],
      }))
    : [];

  return (
    <main className="page">
      <div className="page-head">
        <h1>{t("Mentors and instructors")}</h1>
        <p>{t("Learn from practitioners who guide you through the labs and give feedback.")}</p>
      </div>
      {status === "loading" ? (
        <p role="status">{t("Loading mentors...")}</p>
      ) : status === "error" ? (
        <p className="notice" role="alert">{t("Mentor profiles are temporarily unavailable. Please try again later.")}</p>
      ) : profiles.length === 0 ? (
        <div className="empty-state">
          <h3>{t("Mentor profiles are coming soon.")}</h3>
          <p className="notice">
            {t("Real photos and biographies will appear here once they are published. Want to teach?")}{" "}
            <Link to="/contact">{t("Get in touch")}</Link>.
          </p>
        </div>
      ) : (
        <MentorCarousel mentors={profiles} />
      )}
    </main>
  );
}
