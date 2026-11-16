import { Link } from "react-router-dom";
import { useLanguage } from "../../i18n/useLanguage";
import "./Mission.css";

const missionPillars = [
  {
    icon: "01",
    title: "Education & training",
    description: "Learn at your own pace.",
  },
  {
    icon: "02",
    title: "Mentorship & guidance",
    description: "Grow with the community.",
  },
  {
    icon: "03",
    title: "Responsible practice",
    description: "Build skills the right way.",
  },
];

export function Mission() {
  const { t } = useLanguage();

  return (
    <section className="mission-section" aria-labelledby="mission-title">
      <div className="mission-section__copy">
        <p className="mission-section__eyebrow">{t("Our mission")}</p>
        <h2 id="mission-title">{t("Build skilled cybersecurity professionals.")}</h2>
        <p>
          {t("We go beyond the tools. Spark Security helps people grow practical skills, make responsible choices, and contribute to a safer digital world.")}
        </p>
        <Link className="mission-section__link" to="/about">
          {t("About Spark Security")} <span aria-hidden="true">→</span>
        </Link>
      </div>
      <div className="mission-section__pillars">
        {missionPillars.map((pillar) => (
          <article className="mission-pillar" key={pillar.title}>
            <span className="mission-pillar__icon" aria-hidden="true">
              {pillar.icon}
            </span>
            <div>
              <h3>{t(pillar.title)}</h3>
              <p>{t(pillar.description)}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="mission-section__visual" aria-hidden="true">
        <div className="mission-section__server">
          <span />
          <span />
          <span />
          <span />
          <strong>S</strong>
        </div>
      </div>
    </section>
  );
}
