import { useState } from "react";
import { useLanguage } from "../../i18n/useLanguage";
import { faqs } from "../../data/faqs";
import type { Faq as FaqItem } from "../../types/faq";
import "./Faq.css";

interface FaqProps {
  items?: FaqItem[];
  loadError?: boolean;
}

export function Faq({
  items = faqs.map(({ question, answer }) => ({ q: question, a: answer })),
  loadError = false,
}: FaqProps) {
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);
  const { t } = useLanguage();

  return (
    <section className="faq-section" aria-labelledby="faq-title">
      <div className="faq-section__container">
        <div className="faq-section__heading">
          <p className="faq-section__eyebrow">{t("Good questions")}</p>
          <h2 id="faq-title">{t("Frequently asked.")}</h2>
        </div>
        {loadError && (
          <p role="alert">{t("Some site content could not be loaded. Please try again later.")}</p>
        )}
        <div className="faq-list">
          {items.map((faq, index) => {
            const isOpen = openQuestion === faq.q;
            const answerId = `faq-answer-${index}`;

            return (
              <article className="faq-item" key={faq.q}>
                <button
                  className="faq-item__question"
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  onClick={() =>
                    setOpenQuestion(isOpen ? null : faq.q)
                  }
                >
                  {t(faq.q)}
                </button>
                <div
                  className="faq-item__answer"
                  id={answerId}
                  hidden={!isOpen}
                >
                  <p>{t(faq.a)}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
