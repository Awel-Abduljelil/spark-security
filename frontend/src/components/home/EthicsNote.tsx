import "./EthicsNote.css";
import { useLanguage } from "../../i18n/useLanguage";

export function EthicsNote() {
  const { t } = useLanguage();

  return (
    <section className="ethics-note" aria-label={t("Responsible learning")}>
      <span className="ethics-note__icon" aria-hidden="true">!</span>
      <p>
        {t("Learn to secure, not to harm. All techniques must be used legally and only on systems you own or have explicit authorization to test.")}
      </p>
    </section>
  );
}
