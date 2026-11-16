import { Link } from "react-router-dom";
import { useLanguage } from "../../i18n/useLanguage";
import "./FinalCta.css";

export function FinalCta() {
  const { t } = useLanguage();

  return (
    <section className="final-cta" aria-labelledby="final-cta-title">
      <div className="final-cta__inner">
        <div>
          <h2 id="final-cta-title">
            {t("Together for a")} <span>{t("more secure digital world.")}</span>
          </h2>
        </div>
        <Link className="final-cta__link" to="/enroll">
          {t("Get Started")} <span aria-hidden="true">→</span>
        </Link>
        <p className="final-cta__description">
          {t("Join a community that learns, builds, and protects.")}
        </p>
      </div>
    </section>
  );
}
