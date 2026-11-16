import { learningSteps } from "../../data/homeContent";
import { useLanguage } from "../../i18n/useLanguage";
import "./HowItWorks.css";

export function HowItWorks() {
  const { t } = useLanguage();

  return (
    <section className="how-it-works" aria-labelledby="steps-title">
      <div className="how-it-works__container">
        <div className="how-it-works__heading">
          <p className="how-it-works__eyebrow">{t("Your next steps")}</p>
          <h2 id="steps-title">{t("Learn at your own pace.")}</h2>
          <p>{t("A simple, guided route from first principles to confident practice.")}</p>
        </div>
        <ol className="steps-grid">
          {learningSteps.map((step) => (
            <li className="step-card" key={step.number}>
              <span className="step-card__number">{step.number}</span>
              <h3>{t(step.title)}</h3>
              <p>{t(step.description)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
