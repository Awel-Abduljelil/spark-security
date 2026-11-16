// @vitest-environment jsdom
// @vitest-environment-options {"url":"http://localhost:5173"}
// Renders against the live backend at VITE_API_URL (no mocks).
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getCourses } from "../src/lib/api";
import { useCohort } from "../src/hooks/useCohort";
import { useCourse } from "../src/hooks/useCourse";
import { useCourses } from "../src/hooks/useCourses";
import { backendUp } from "./live";

describe.skipIf(!backendUp)("useCourses", () => {
  it("starts in loading state and settles to ready with live data", async () => {
    const { result } = renderHook(() => useCourses());

    expect(result.current.status).toBe("loading");
    expect(result.current.data).toEqual([]);

    await waitFor(
      () => expect(result.current.status).toBe("ready"),
      { timeout: 10000 },
    );
    expect(Array.isArray(result.current.data)).toBe(true);
    expect(result.current.data.length).toBeGreaterThan(0);
    for (const course of result.current.data) {
      expect(typeof course.price).toBe("string");
      expect(["en", "om", "am"]).toContain(course.language);
    }
  });
});

describe.skipIf(!backendUp)("useCourse", () => {
  it("returns notfound synchronously for an empty slug", () => {
    const { result } = renderHook(() => useCourse(""));
    expect(result.current).toEqual({ data: null, status: "notfound" });
  });

  it("settles to notfound for a missing slug (404 from the backend)", async () => {
    const { result } = renderHook(() =>
      useCourse("definitely-not-a-real-course-slug"),
    );

    expect(result.current.status).toBe("loading");
    await waitFor(
      () => expect(result.current.status).toBe("notfound"),
      { timeout: 10000 },
    );
  });

  it("settles to ready with mapped detail for a real slug", async () => {
    const [first] = await getCourses();
    const { result } = renderHook(() => useCourse(first.slug));

    await waitFor(
      () => expect(result.current.status).toBe("ready"),
      { timeout: 10000 },
    );
    expect(result.current.data?.slug).toBe(first.slug);
    expect(result.current.data?.title).toBe(first.title);
  });
});

describe.skipIf(!backendUp)("useCohort", () => {
  it("returns none synchronously for an empty slug", () => {
    const { result } = renderHook(() => useCohort(""));
    expect(result.current).toEqual({ cohort: null, status: "none" });
  });

  it("settles to none for a missing slug (404 from the backend)", async () => {
    const { result } = renderHook(() =>
      useCohort("definitely-not-a-real-course-slug"),
    );

    await waitFor(
      () => expect(result.current.status).toBe("none"),
      { timeout: 10000 },
    );
  });
});
