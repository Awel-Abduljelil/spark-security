import { useEffect, useState } from "react";
import { ApiError, getCourse } from "../lib/api";
import { mapApiCourseDetail } from "../lib/courseData";
import type { CourseWithDetail } from "../types/course";

export type CourseStatus = "loading" | "ready" | "notfound" | "error";

interface CourseState {
  slug: string;
  data: CourseWithDetail | null;
  status: CourseStatus;
}

export function useCourse(slug: string): {
  data: CourseWithDetail | null;
  status: CourseStatus;
} {
  const [state, setState] = useState<CourseState>({
    slug: "",
    data: null,
    status: "loading",
  });

  useEffect(() => {
    if (!slug) return;
    const controller = new AbortController();
    let active = true;

    getCourse(slug, controller.signal)
      .then((course) => {
        if (active) {
          setState({ slug, data: mapApiCourseDetail(course), status: "ready" });
        }
      })
      .catch((error: unknown) => {
        if (!active || controller.signal.aborted) return;
        if (error instanceof ApiError && error.status === 404) {
          setState({ slug, data: null, status: "notfound" });
        } else {
          setState({ slug, data: null, status: "error" });
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [slug]);

  if (!slug) return { data: null, status: "notfound" };
  if (state.slug !== slug) return { data: null, status: "loading" };
  return { data: state.data, status: state.status };
}