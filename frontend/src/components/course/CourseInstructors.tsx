import type { CourseWithDetail } from "../../types/course";
import { useLanguage } from "../../i18n/useLanguage";
import "./CourseInstructors.css";

interface CourseInstructorsProps {
  instructors: CourseWithDetail["instructors"];
}

export function CourseInstructors({
  instructors,
}: CourseInstructorsProps) {
  const { t } = useLanguage();
  return (
    <section className="course-section" aria-labelledby="instructors-title">
      <h2 id="instructors-title">{t("Instructors")}</h2>
      <div className="course-instructors">
        {instructors.map((instructor, index) => (
          <article className="course-instructor" key={`${instructor.role}-${index}`}>
            {instructor.photo ? (
              <img className="course-instructor__avatar" src={instructor.photo} alt={instructor.name} loading="lazy" />
            ) : (
              <div className="course-instructor__avatar" aria-hidden="true">
                {instructor.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")}
              </div>
            )}
            <div>
              <h3>{instructor.name}</h3>
              <p className="course-instructor__role">{instructor.role}</p>
              <p className="course-instructor__bio">{instructor.bio}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
