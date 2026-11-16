import { useLanguage } from "../../i18n/useLanguage";

interface RecoveryProps {
  steps: string[];
}

export function Recovery({ steps }: RecoveryProps) {
  const { t } = useLanguage();

  return (
    <section className="awareness-section" id="recovery" aria-labelledby="recovery-title">
      <div className="awareness-section__inner">
        <div className="awareness-section__heading">
          <p className="awareness-eyebrow">{t("If something went wrong")}</p>
          <h2 id="recovery-title">{t("What to do next")}</h2>
        </div>

        <ol className="awareness-recovery__list">
          {steps.map((step, index) => (
            <li key={step}>
              <span className="awareness-recovery__number">{index + 1}</span>
              <p>{t(step)}</p>
            </li>
          ))}
        </ol>

        <p className="awareness-recovery__note">
          {t("Contact your bank or mobile money provider and the relevant authorities as soon as possible. Keep screenshots, messages, and transaction details to help with the report.")}
        </p>
      </div>
    </section>
  );
}
