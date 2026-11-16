import { Link } from "react-router-dom";
import { useLanguage } from "../../i18n/useLanguage";
import "./AwarenessTeaser.css";

export function AwarenessTeaser() {
  const { t } = useLanguage();

  return (
    <section className="awareness-section" aria-labelledby="awareness-title">
      <div className="awareness-card">
        <div>
          <p className="awareness-card__eyebrow">{t("Knowledge is your first defense")}</p>
          <h2 id="awareness-title">{t("A safer digital world starts with awareness.")}</h2>
          <p>{t("Explore practical guidance for spotting risks and protecting yourself online.")}</p>
        </div>
        <Link className="awareness-card__link" to="/awareness">
          {t("Visit awareness center")} <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
