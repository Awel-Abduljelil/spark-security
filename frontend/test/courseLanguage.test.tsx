// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, useLocation } from "react-router-dom";
import { CourseCatalog } from "../src/components/home/CourseCatalog";
import { LanguageProvider } from "../src/i18n/LanguageContext";
import { useCourses } from "../src/hooks/useCourses";
import type { Course } from "../src/types/course";

vi.mock("../src/hooks/useCourses", () => ({ useCourses: vi.fn() }));

const courses: Course[] = [
  {
    slug: "english",
    title: "English course",
    level: "Beginner",
    language: "en",
    duration: "2 weeks",
    sessions: 2,
    labs: 1,
    price: "100 ETB",
    description: "An English course.",
  },
  {
    slug: "oromo",
    title: "Oromo course",
    level: "Beginner",
    language: "om",
    duration: "2 weeks",
    sessions: 2,
    labs: 1,
    price: "100 ETB",
    description: "An Afaan Oromoo course.",
  },
  {
    slug: "amharic",
    title: "Amharic course",
    level: "Beginner",
    language: "am",
    duration: "2 weeks",
    sessions: 2,
    labs: 1,
    price: "100 ETB",
    description: "An Amharic course.",
  },
];

function LocationOutput() {
  const location = useLocation();
  return <output data-testid="location">{`${location.pathname}${location.search}`}</output>;
}

function renderCatalog(initialEntry = "/") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <LanguageProvider>
        <CourseCatalog />
        <LocationOutput />
      </LanguageProvider>
    </MemoryRouter>,
  );
}

describe("course language filter", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.mocked(useCourses).mockImplementation((language) => {
      const visible = language === "om"
        ? courses.filter((course) => course.language === "en" || course.language === "om")
        : language === "am"
          ? courses.filter((course) => course.language === "en" || course.language === "am")
          : courses;
      return { data: visible, status: "ready" };
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("shows a correctly labeled language badge on each course card", () => {
    const { container } = renderCatalog();

    expect(container.querySelectorAll(".course-language-badge")).toHaveLength(3);
    expect(screen.getByText("English", { selector: ".course-language-badge" })).toBeTruthy();
    expect(container.querySelector(".course-language-badge--om")?.textContent).toBe("Afaan Oromoo");
    expect(container.querySelector(".course-language-badge--am")?.textContent).toBe("አማርኛ");
  });

  it("updates the visible courses and shareable URL when the selector changes", async () => {
    renderCatalog();
    expect(screen.getByText("English course")).toBeTruthy();
    expect(screen.getByText("Oromo course")).toBeTruthy();
    expect(screen.getByText("Amharic course")).toBeTruthy();

    fireEvent.change(screen.getByRole("combobox", { name: "Filter courses by teaching language" }), {
      target: { value: "om" },
    });

    await waitFor(() => expect(screen.getByTestId("location").textContent).toBe("/?lang=om"));
    expect(screen.getByText("English course")).toBeTruthy();
    expect(screen.getByText("Oromo course")).toBeTruthy();
    expect(screen.queryByText("Amharic course")).toBeNull();
    expect(window.localStorage.getItem("course-language")).toBe("om");
  });

  it("restores the saved selection on reload and lets a URL selection win", async () => {
    window.localStorage.setItem("course-language", "om");
    const firstRender = renderCatalog();
    await waitFor(() => expect(screen.getByTestId("location").textContent).toBe("/?lang=om"));
    firstRender.unmount();

    window.localStorage.setItem("course-language", "am");
    renderCatalog("/?lang=om");
    expect(screen.getByRole("combobox", { name: "Filter courses by teaching language" })).toHaveProperty("value", "om");
    expect(window.localStorage.getItem("course-language")).toBe("om");
  });

  it("falls back to English for invalid URL and stored values", async () => {
    window.localStorage.setItem("course-language", "invalid");
    renderCatalog("/?lang=invalid");

    await waitFor(() => expect(screen.getByTestId("location").textContent).toBe("/?lang=en"));
    expect(screen.getByText("Amharic course")).toBeTruthy();
    expect(window.localStorage.getItem("course-language")).toBe("en");
  });

  it("shows an empty state and offers English courses when nothing matches", async () => {
    vi.mocked(useCourses).mockReturnValue({ data: [], status: "ready" });
    renderCatalog("/?lang=am");

    expect(screen.getByText("No courses in this language yet. Showing English courses is available.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Show English courses" }));

    await waitFor(() => expect(screen.getByTestId("location").textContent).toBe("/?lang=en"));
  });
});
