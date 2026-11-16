import { useLanguage } from "../../i18n/useLanguage";

interface ChecklistProps {
  items: string[];
}

export function Checklist({ items }: ChecklistProps) {
  const { t } = useLanguage();

  return (
    <section className="awareness-section" id="checklist" aria-labelledby="checklist-title">
      <div className="awareness-section__inner">
        <div className="awareness-section__heading">
          <p className="awareness-eyebrow">{t("Start today")}</p>
          <h2 id="checklist-title">{t("Quick checklist")}</h2>
        </div>

        <ul className="awareness-checklist__list">
          {items.map((item) => (
            <li key={item}>{t(item)}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
