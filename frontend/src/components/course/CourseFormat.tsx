import type { CourseWithDetail } from "../../types/course";
import { useLanguage } from "../../i18n/useLanguage";
import "./CourseFormat.css";

interface CourseFormatProps {
  course: CourseWithDetail;
}

export function CourseFormat({ course }: CourseFormatProps) {
  const { t } = useLanguage();
  const details = [
    { label: "Platform", value: course.platform },
    { label: "Schedule", value: course.schedule },
    { label: "Start date", value: course.startDate },
    { label: "Duration", value: course.duration },
    { label: "Language", value: course.language },
    ...(course.cohortsPerYear !== undefined
      ? [{ label: "Cohorts per year", value: String(course.cohortsPerYear) }]
      : []),
  ].filter(({ value }) => value !== undefined && value !== "");

  return (
    <section className="course-section course-format" aria-labelledby="format-title">
      <h2 id="format-title">{t("How it runs")}</h2>
      <dl className="course-format__details">
        {details.map(({ label, value }) => (
          <div className="course-format__item" key={label}>
            <dt>{t(label)}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
