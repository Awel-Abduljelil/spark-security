import type { CourseWithDetail } from "../../types/course";
import { useLanguage } from "../../i18n/useLanguage";
import "./CourseAudience.css";

interface CourseAudienceProps {
  audience: CourseWithDetail["audience"];
  requirements: CourseWithDetail["requirements"];
}

export function CourseAudience({
  audience,
  requirements,
}: CourseAudienceProps) {
  const { t } = useLanguage();
  return (
    <section
      className="course-section course-audience"
      aria-label={t("Who it’s for and requirements")}
    >
      <div>
        <h2 id="audience-title">{t("Who it’s for")}</h2>
        <p className="course-audience__intro">{t("Perfect if you...")}</p>
        <ul aria-labelledby="audience-title">
          {audience.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div>
        <h2 id="requirements-title">{t("Requirements")}</h2>
        <ul aria-labelledby="requirements-title">
          {requirements.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
