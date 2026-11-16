import type { CourseWithDetail } from "../../types/course";
import { useLanguage } from "../../i18n/useLanguage";
import "./LearningOutcomes.css";

interface LearningOutcomesProps {
  outcomes: CourseWithDetail["outcomes"];
}

export function LearningOutcomes({ outcomes }: LearningOutcomesProps) {
  const { t } = useLanguage();
  return (
    <section className="course-section course-outcomes" aria-labelledby="outcomes-title">
      <h2 id="outcomes-title">{t("What you’ll learn")}</h2>
      <ul className="course-outcomes__list">
        {outcomes.map((outcome) => (
          <li key={outcome}>{outcome}</li>
        ))}
      </ul>
    </section>
  );
}
