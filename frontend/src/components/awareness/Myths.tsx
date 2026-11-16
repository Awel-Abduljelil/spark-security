import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../../i18n/useLanguage";

interface MythFact {
  myth: string;
  fact: string;
}

interface MythsProps {
  items: MythFact[];
}

export function Myths({ items }: MythsProps) {
  const { t } = useLanguage();
  const [selectedMyth, setSelectedMyth] = useState<MythFact | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!selectedMyth || !dialog || dialog.open) return;

    dialog.showModal();
  }, [selectedMyth]);

  return (
    <section
      className="awareness-section"
      id="myths"
      aria-labelledby="myths-title"
    >
      <div className="awareness-section__inner">
        <div className="awareness-section__heading">
          <p className="awareness-eyebrow">{t("Straight answers")}</p>
          <h2 id="myths-title">{t("Myth vs fact")}</h2>
        </div>

        <div className="awareness-myths__list">
          {items.map((item) => (
            <article className="awareness-myth" key={item.myth}>
              <button
                className="awareness-myth__toggle"
                type="button"
                aria-haspopup="dialog"
                onClick={() => setSelectedMyth(item)}
              >
                <span>{t(item.myth)}</span>
                <span className="awareness-myth__prompt">{t("View fact")}</span>
              </button>
            </article>
          ))}
        </div>
      </div>
      {selectedMyth && (
        <dialog
          className="awareness-detail-dialog"
          ref={dialogRef}
          aria-labelledby="awareness-myth-dialog-title"
          onClose={() => setSelectedMyth(null)}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              dialogRef.current?.close();
            }
          }}
        >
          <article className="awareness-detail-dialog__panel">
            <button
              className="awareness-detail-dialog__close"
              type="button"
              aria-label={t("Close myth and fact")}
              onClick={() => dialogRef.current?.close()}
            >
              ×
            </button>
            <h3 id="awareness-myth-dialog-title">{t("Myth vs fact")}</h3>
            <div className="awareness-myth-dialog__section">
              <h4>{t("Myth")}</h4>
              <p>{t(selectedMyth.myth)}</p>
            </div>
            <div className="awareness-myth-dialog__section">
              <h4>{t("Fact")}</h4>
              <p>{t(selectedMyth.fact)}</p>
            </div>
          </article>
        </dialog>
      )}
    </section>
  );
}
