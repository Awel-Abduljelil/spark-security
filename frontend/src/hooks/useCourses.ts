import { useEffect, useState } from "react";
import { ApiError, getCourses } from "../lib/api";
import { mapApiCourseCard } from "../lib/courseData";
import type { CourseLanguage } from "../types/apiContract";
import type { Course } from "../types/course";

export type CoursesStatus = "loading" | "ready" | "notfound" | "error";

interface CoursesState {
  data: Course[];
  status: CoursesStatus;
}

export function useCourses(language?: CourseLanguage): CoursesState {
  const [state, setState] = useState<CoursesState>({
    data: [],
    status: "loading",
  });

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    getCourses(controller.signal, language)
      .then((courses) => {
        if (active) {
          setState({
            data: courses.map((course) => mapApiCourseCard(course)),
            status: "ready",
          });
        }
      })
      .catch((error: unknown) => {
        if (active && !controller.signal.aborted) {
          setState(
            error instanceof ApiError && error.status === 404
              ? { data: [], status: "notfound" }
              : { data: [], status: "error" },
          );
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [language]);

  return state;
}