import { describe, expect, it } from "vitest";
import { mapApiCourseCard, mapApiCourseDetail } from "../src/lib/courseData";
import type {
  ApiCourseCard,
  ApiCourseDetail,
} from "../src/types/apiContract";

const card = {
  slug: "test-course",
  title: "Test Course",
  level: "Beginner",
  duration: "8 weeks",
  sessions: 16,
  labs: 4,
  language: "en",
  tag: null,
  description: "A course.",
  skills: ["Testing"],
  nextCohort: null,
} satisfies ApiCourseCard;

describe("mapApiCourseCard", () => {
  it("formats a priced next cohort", () => {
    const mapped = mapApiCourseCard({
      ...card,
      nextCohort: {
        startDate: "2030-01-01",
        label: "Cohort 1",
        priceEtb: 250,
        seatsLeft: 3,
      },
    });
    expect(mapped.price).toBe("250 ETB");
  });

  it("reports an unpriced cohort as unavailable", () => {
    const mapped = mapApiCourseCard({
      ...card,
      nextCohort: {
        startDate: "2030-01-01",
        label: null,
        priceEtb: null,
        seatsLeft: 0,
      },
    });
    expect(mapped.price).toBe("Price unavailable");
  });

  it("reports a closed course when there is no next cohort", () => {
    expect(mapApiCourseCard(card).price).toBe("Registration closed");
  });

  it("keeps the tag only when present", () => {
    expect(mapApiCourseCard({ ...card, tag: "Start here" }).tag).toBe("Start here");
    expect("tag" in mapApiCourseCard(card)).toBe(false);
  });

  it("copies the scalar fields", () => {
    const mapped = mapApiCourseCard(card);
    expect(mapped).toMatchObject({
      slug: "test-course",
      title: "Test Course",
      level: "Beginner",
      duration: "8 weeks",
      sessions: 16,
      labs: 4,
      description: "A course.",
      skills: ["Testing"],
    });
  });
});

const detail = {
  ...card,
  content: {
    outcomes: ["Explain X"],
    weeks: [{ title: "Week 1", topics: ["Requests"] }],
    requirements: ["None"],
    audience: ["Beginners"],
    instructors: [{ name: "Ana", role: "Instructor", bio: "Bio" }],
  },
  platform: null,
  language: "en",
  cohortsPerYear: null,
} satisfies ApiCourseDetail;

describe("mapApiCourseDetail", () => {
  it("maps content and keeps optional metadata when present", () => {
    const mapped = mapApiCourseDetail({
      ...detail,
      tag: "Start here",
      platform: "Live on Zoom, community on Telegram",
      language: "om",
      cohortsPerYear: 4,
    });
    expect(mapped.price).toBe("Registration closed");
    expect(mapped).toMatchObject({
      slug: "test-course",
      title: "Test Course",
      tag: "Start here",
      platform: "Live on Zoom, community on Telegram",
      language: "om",
      cohortsPerYear: 4,
      outcomes: ["Explain X"],
      weeks: [{ title: "Week 1", topics: ["Requests"] }],
      requirements: ["None"],
      audience: ["Beginners"],
      instructors: [{ name: "Ana", role: "Instructor", bio: "Bio" }],
    });
  });

  it("omits null metadata and seeds empty cohort placeholders", () => {
    const mapped = mapApiCourseDetail(detail);
    expect("platform" in mapped).toBe(false);
    expect(mapped.language).toBe("en");
    expect("cohortsPerYear" in mapped).toBe(false);
    expect(mapped.startDate).toBe("");
    expect(mapped.totalSeats).toBe(0);
    expect(mapped.seatsLeft).toBe(0);
    expect(mapped.schedule).toBe("");
  });
});
