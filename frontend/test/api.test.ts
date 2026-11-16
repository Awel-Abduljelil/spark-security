// These tests run against the live backend at VITE_API_URL (real HTTP, no mocks).
import { describe, expect, it } from "vitest";
import { ApiError, getCourse, getCourses, getCohort } from "../src/lib/api";
import { backendUp } from "./live";

describe.skipIf(!backendUp)("public API client (live backend)", () => {
  it("lists published courses from the database", async () => {
    const courses = await getCourses();

    expect(Array.isArray(courses)).toBe(true);
    expect(courses.length).toBeGreaterThan(0);

    for (const course of courses) {
      expect(typeof course.slug).toBe("string");
      expect(typeof course.title).toBe("string");
      expect(Array.isArray(course.skills)).toBe(true);
      expect(typeof course.duration).toBe("string");
      // The browser/admin UI depends on this shape.
      expect(
        course.nextCohort === null ||
          typeof course.nextCohort.seatsLeft === "number",
      ).toBe(true);
    }
  });

  it("maps a missing course to ApiError 404 with the server message", async () => {
    const error: unknown = await getCourse(
      "definitely-not-a-real-course-slug",
    ).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    const apiError = error as ApiError;
    expect(apiError.status).toBe(404);
    expect(apiError.message).toBe("Course was not found.");
  });

  it("maps a missing cohort to ApiError 404", async () => {
    const error: unknown = await getCohort(
      "definitely-not-a-real-course-slug",
    ).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(404);
  });
});
