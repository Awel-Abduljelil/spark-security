import { useEffect, useRef, useState } from "react";
import type { Threat } from "../../types/awareness";
import { useLanguage } from "../../i18n/useLanguage";
import { ThreatCard } from "./ThreatCard";

interface ThreatListProps {
  threats: Threat[];
}

export function ThreatList({ threats }: ThreatListProps) {
  const { t } = useLanguage();
  const [selectedThreat, setSelectedThreat] = useState<Threat | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!selectedThreat || !dialog || dialog.open) return;

    dialog.showModal();
  }, [selectedThreat]);

  return (
    <section
      className="awareness-section"
      id="threats"
      aria-labelledby="threats-title"
    >
      <div className="awareness-section__inner">
        <div className="awareness-section__heading">
          <p className="awareness-eyebrow">{t("Most common risks")}</p>
          <h2 id="threats-title">{t("Top threats to watch for")}</h2>
        </div>

        <div className="awareness-threats__grid">
          {threats.map((threat) => (
            <ThreatCard
              key={threat.slug}
              threat={threat}
              onViewDetails={setSelectedThreat}
            />
          ))}
        </div>
      </div>
      {selectedThreat && (
        <dialog
          className="awareness-detail-dialog"
          ref={dialogRef}
          aria-labelledby="awareness-threat-dialog-title"
          onClose={() => setSelectedThreat(null)}
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
              aria-label={t("Close threat details")}
              onClick={() => dialogRef.current?.close()}
            >
              ×
            </button>
            <h3 id="awareness-threat-dialog-title">
              {t(selectedThreat.title)}
            </h3>
            <p className="awareness-threat__summary">
              {t(selectedThreat.summary)}
            </p>
            <blockquote className="awareness-threat__example">
              “{t(selectedThreat.example)}”
            </blockquote>
            <div className="awareness-threat__group">
              <h4>{t("Red flags")}</h4>
              <ul>
                {selectedThreat.redFlags.map((flag) => (
                  <li key={flag}>{t(flag)}</li>
                ))}
              </ul>
            </div>
            <div className="awareness-threat__group">
              <h4>{t("What to do")}</h4>
              <ul>
                {selectedThreat.whatToDo.map((item) => (
                  <li key={item}>{t(item)}</li>
                ))}
              </ul>
            </div>
          </article>
        </dialog>
      )}
    </section>
  );
}
