import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/useLanguage";
import { Reveal } from "../components/ui/Reveal";
import "./pages.css";

const pillars = [
  { title: "Education", text: "Structured cybersecurity courses and practical learning." },
  { title: "Community", text: "Mentors, instructors, collaboration, and knowledge sharing." },
  { title: "Security services", text: "Authorized penetration testing, vulnerability assessments, and security consulting." },
];

export function About() {
  const { t } = useLanguage();

  return (
    <main className="page">
      <div className="page-head">
        <h1>{t("About Spark Security")}</h1>
        <p>
          {t("Spark Security is a cybersecurity education and security services organization committed to developing practical cybersecurity skills and helping organizations improve their digital security.")}
        </p>
      </div>
      <Reveal>
        <div className="grid-3">
          {pillars.map((p) => (
            <article className="card" key={p.title}>
              <h3>{t(p.title)}</h3>
              <p>{t(p.text)}</p>
            </article>
          ))}
        </div>
      </Reveal>
      <Reveal>
        <section className="card">
          <h3>{t("Our approach")}</h3>
          <p>
            {t("We teach through hands-on exercises in controlled labs, with instructor feedback. All security testing is performed only with proper authorization.")}
          </p>
          <p style={{ marginTop: "var(--space-md)" }}>
            <Link to="/#courses">{t("Explore courses")}</Link> {t("or")}{" "}
            <Link to="/contact">{t("contact us")}</Link>.
          </p>
        </section>
      </Reveal>
    </main>
  );
}
