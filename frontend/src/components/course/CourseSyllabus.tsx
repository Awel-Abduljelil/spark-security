import type { CourseWithDetail } from "../../types/course";
import { useLanguage } from "../../i18n/useLanguage";
import "./CourseSyllabus.css";

interface CourseSyllabusProps {
  weeks: CourseWithDetail["weeks"];
}

export function CourseSyllabus({ weeks }: CourseSyllabusProps) {
  const { t } = useLanguage();
  return (
    <section
      className="course-section course-syllabus"
      aria-labelledby="syllabus-title"
    >
      <h2 id="syllabus-title">{t("12-week syllabus")}</h2>
      <div className="course-syllabus__weeks">
        {weeks.map((week, index) => (
          <details className="course-syllabus__week" key={week.title}>
            <summary>
              <span>{t("Week")} {index + 1}</span>
              <strong>{week.title}</strong>
            </summary>
            <ul>
              {week.topics.map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </section>
  );
}
