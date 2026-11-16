import { useEffect, useState } from "react";
import { ApiError, getCohort, type Cohort } from "../lib/api";

export type CohortStatus = "loading" | "ready" | "none" | "error";

interface CohortState {
  slug: string;
  cohort: Cohort | null;
  status: CohortStatus;
}

export function useCohort(slug: string): {
  cohort: Cohort | null;
  status: CohortStatus;
} {
  const [state, setState] = useState<CohortState>({
    slug: "",
    cohort: null,
    status: "loading",
  });

  useEffect(() => {
    if (!slug) return;

    const controller = new AbortController();
    let active = true;

    getCohort(slug, controller.signal)
      .then((cohort) => {
        if (active) setState({ slug, cohort, status: "ready" });
      })
      .catch((error: unknown) => {
        if (!active || controller.signal.aborted) return;

        setState({
          slug,
          cohort: null,
          status:
            error instanceof ApiError && error.status === 404
              ? "none"
              : "error",
        });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [slug]);

  if (!slug) return { cohort: null, status: "none" };
  if (state.slug !== slug) return { cohort: null, status: "loading" };
  return { cohort: state.cohort, status: state.status };
}
