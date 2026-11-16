import { features } from "../../data/features";
import { useLanguage } from "../../i18n/useLanguage";
import "./Features.css";

export function Features() {
  const { t } = useLanguage();

  return (
    <section className="features-section" aria-labelledby="features-title">
      <div className="features-section__heading">
        <p className="features-section__eyebrow">{t("Learn • Secure • Innovate")}</p>
        <h2 id="features-title">{t("More than a course. A community.")}</h2>
      </div>
      <div className="feature-grid">
        {features.map((feature) => (
          <article className="feature-card" key={feature.number}>
            <div className="feature-card__topline">
              <span className="feature-card__icon" aria-hidden="true">
                {["⌘", "◎", "◇", "▣"][Number(feature.number) - 1]}
              </span>
              <span className="feature-card__number">{feature.number}</span>
            </div>
            <h3>{t(feature.title)}</h3>
            <p>{t(feature.description)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
