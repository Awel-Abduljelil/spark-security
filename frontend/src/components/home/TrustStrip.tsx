import { trustFacts } from "../../data/homeContent";
import { useLanguage } from "../../i18n/useLanguage";
import "./TrustStrip.css";

export function TrustStrip() {
  const { t } = useLanguage();
  return (
    <section className="trust-strip" aria-label={t("Our learning principles")}>
      <div className="trust-strip__items">
        {trustFacts.map((fact) => (
          <p className="trust-strip__item" key={fact}>
            <span aria-hidden="true">+</span>{t(fact)}
          </p>
        ))}
      </div>
    </section>
  );
}
