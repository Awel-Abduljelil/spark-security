// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, useLocation } from "react-router-dom";
import { HeroCourseCarousel } from "../src/components/home/HeroCourseCarousel";
import { LanguageProvider } from "../src/i18n/LanguageContext";
import { useCourses } from "../src/hooks/useCourses";
import type { Course } from "../src/types/course";

vi.mock("../src/hooks/useCourses", () => ({ useCourses: vi.fn() }));

const courses: Course[] = [
  { slug: "first-course", title: "First course", level: "Beginner", language: "en", duration: "2 weeks", sessions: 2, labs: 1, price: "100 ETB", priceEtb: 100, discountPriceEtb: 80, enrollmentOpen: true, cover: "/media/first.webp", description: "The first published course." },
  { slug: "second-course", title: "Second course", level: "Intermediate", language: "om", duration: "3 weeks", sessions: 3, labs: 2, price: "200 ETB", priceEtb: 200, discountPriceEtb: null, enrollmentOpen: false, description: "The second published course." },
  { slug: "third-course", title: "Third course", level: "Advanced", language: "am", duration: "4 weeks", sessions: 4, labs: 3, price: "300 ETB", priceEtb: 300, enrollmentOpen: true, description: "The third published course." },
  { slug: "fourth-course", title: "Fourth course", level: "Beginner", language: "en", duration: "1 week", sessions: 1, labs: 1, price: "50 ETB", priceEtb: 50, enrollmentOpen: true, description: "The fourth published course." },
  { slug: "fifth-course", title: "Fifth course", level: "Intermediate", language: "om", duration: "5 weeks", sessions: 5, labs: 2, price: "250 ETB", priceEtb: 250, enrollmentOpen: true, description: "The fifth published course." },
  { slug: "sixth-course", title: "Sixth course", level: "Advanced", language: "am", duration: "6 weeks", sessions: 6, labs: 4, price: "400 ETB", priceEtb: 400, enrollmentOpen: true, description: "The sixth published course." },
  { slug: "seventh-course", title: "Seventh course", level: "Beginner", language: "en", duration: "7 weeks", sessions: 7, labs: 1, price: "700 ETB", priceEtb: 700, enrollmentOpen: true, description: "This course is outside the featured limit." },
];

function LocationOutput() {
  const { pathname, search } = useLocation();
  return <output data-testid="location">{pathname + search}</output>;
}

function renderCarousel(status: "ready" | "loading" | "error" = "ready", data = courses) {
  vi.mocked(useCourses).mockReturnValue({ data, status });
  return render(
    <MemoryRouter>
      <LanguageProvider>
        <HeroCourseCarousel />
        <LocationOutput />
      </LanguageProvider>
    </MemoryRouter>,
  );
}

function slide(name: string) {
  return screen.getByRole("group", { name: new RegExp(name) });
}

beforeEach(() => {
  vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("hero course carousel", () => {
  it("shows only the first six published API courses and centers the first on load", () => {
    renderCarousel();
    expect(screen.getByRole("region", { name: "Featured courses" })).toBeTruthy();
    expect(slide("First course").classList.contains("is-active")).toBe(true);
    expect(screen.queryByText("Seventh course")).toBeNull();
    expect(document.querySelectorAll('[aria-roledescription="slide"]')).toHaveLength(6);
  });

  it("centers a clicked side course and keeps the previous center in the circular row", () => {
    renderCarousel();
    fireEvent.click(slide("Second course"));
    expect(slide("Second course").classList.contains("is-active")).toBe(true);
    expect(slide("First course").classList.contains("is-active")).toBe(false);
    expect(slide("First course").getAttribute("style")).toContain("--rotation");
  });

  it("wraps around with arrow buttons and keyboard navigation", () => {
    renderCarousel();
    fireEvent.click(screen.getByRole("button", { name: "Previous course" }));
    expect(slide("Sixth course").classList.contains("is-active")).toBe(true);
    fireEvent.keyDown(screen.getByRole("region", { name: "Featured courses" }), { key: "ArrowRight" });
    expect(slide("First course").classList.contains("is-active")).toBe(true);
    fireEvent.keyDown(screen.getByRole("region", { name: "Featured courses" }), { key: "ArrowLeft" });
    expect(slide("Sixth course").classList.contains("is-active")).toBe(true);
  });

  it("opens the centered course detail and provides an enrollment link", async () => {
    renderCarousel();
    fireEvent.click(slide("First course"));
    await waitFor(() => expect(screen.getByTestId("location").textContent).toBe("/courses/first-course"));
    fireEvent.keyDown(screen.getByRole("region", { name: "Featured courses" }), { key: "Enter" });
    fireEvent.click(screen.getByRole("button", { name: "Next course" }));
    fireEvent.click(screen.getByRole("group", { name: /Second course/ }));
    fireEvent.click(screen.getByRole("button", { name: "Next course" }));
    fireEvent.click(screen.getByRole("group", { name: /Third course/ }));
    fireEvent.click(screen.getByRole("button", { name: "Enroll now" }));
    await waitFor(() => expect(screen.getByTestId("location").textContent).toBe("/enroll?course=third-course"));
  });

  it("shows image alt text, fallback art, closed badge, and centered pricing", () => {
    renderCarousel();
    expect(screen.getByAltText("First course course cover")).toBeTruthy();
    expect(screen.getByAltText("First course course cover").getAttribute("loading")).toBe("eager");
    expect(screen.getByText("80 ETB")).toBeTruthy();
    expect(screen.getByText("100 ETB").tagName).toBe("DEL");
    fireEvent.click(slide("Second course"));
    expect(screen.getByText("Closed")).toBeTruthy();
    expect(screen.getAllByText(">_").length).toBeGreaterThan(0);
  });

  it("shows a friendly empty state and respects reduced motion", async () => {
    renderCarousel("ready", []);
    expect(screen.getByText("Courses are coming soon")).toBeTruthy();

    cleanup();
    vi.mocked(useCourses).mockReturnValue({ data: courses.slice(0, 3), status: "ready" });
    vi.mocked(window.matchMedia).mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList);
    render(<MemoryRouter><LanguageProvider><HeroCourseCarousel /></LanguageProvider></MemoryRouter>);
    await waitFor(() => expect(slide("Second course").style.getPropertyValue("--rotation")).toBe("0deg"));
  });

  it("uses a snap-ready mobile track and advances one course per swipe", () => {
    const widthDescriptor = Object.getOwnPropertyDescriptor(window, "innerWidth");
    const heightDescriptor = Object.getOwnPropertyDescriptor(window, "innerHeight");
    const scrollToDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollTo");
    const scrollTo = vi.fn();
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 360 });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 800 });
    Object.defineProperty(HTMLElement.prototype, "scrollTo", { configurable: true, value: scrollTo });

    try {
      const { container } = renderCarousel();
      const viewport = container.querySelector(".hero-course-carousel__viewport");
      const activeSlide = container.querySelector(".hero-course-carousel__slide.is-active");
      expect(container.querySelectorAll(".hero-course-carousel__slide")).toHaveLength(Math.min(courses.length, 6) * 5);
      expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ behavior: "instant" }));

      fireEvent.pointerDown(activeSlide!, { pointerId: 1, pointerType: "touch", button: 0, clientX: 260 });
      fireEvent.pointerMove(activeSlide!, { pointerId: 1, pointerType: "touch", clientX: 20 });
      fireEvent.pointerUp(activeSlide!, { pointerId: 1, pointerType: "touch", clientX: 20 });

      expect(container.querySelector(".hero-course-carousel__slide.is-active h2")?.textContent)
        .toBe("Second course");
      expect(scrollTo).toHaveBeenCalled();
      expect(viewport).toBeTruthy();
    } finally {
      cleanup();
      if (widthDescriptor) Object.defineProperty(window, "innerWidth", widthDescriptor);
      if (heightDescriptor) Object.defineProperty(window, "innerHeight", heightDescriptor);
      if (scrollToDescriptor) Object.defineProperty(HTMLElement.prototype, "scrollTo", scrollToDescriptor);
      else Reflect.deleteProperty(HTMLElement.prototype, "scrollTo");
    }
  });

  it("brings the exact side card tapped on mobile to the front", () => {
    const widthDescriptor = Object.getOwnPropertyDescriptor(window, "innerWidth");
    const heightDescriptor = Object.getOwnPropertyDescriptor(window, "innerHeight");
    const scrollToDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollTo");
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 360 });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 800 });
    Object.defineProperty(HTMLElement.prototype, "scrollTo", { configurable: true, value: vi.fn() });

    try {
      const { container } = renderCarousel();
      const tappedSideCard = container.querySelector<HTMLElement>('[data-physical-index="13"]');
      expect(tappedSideCard?.querySelector("h2")?.textContent).toBe("Second course");

      fireEvent.click(tappedSideCard!);

      expect(container.querySelector(".hero-course-carousel__slide.is-active h2")?.textContent)
        .toBe("Second course");
      expect(container.querySelector(".hero-course-carousel__slide.is-active")?.getAttribute("data-physical-index"))
        .toBe("13");
    } finally {
      cleanup();
      if (widthDescriptor) Object.defineProperty(window, "innerWidth", widthDescriptor);
      if (heightDescriptor) Object.defineProperty(window, "innerHeight", heightDescriptor);
      if (scrollToDescriptor) Object.defineProperty(HTMLElement.prototype, "scrollTo", scrollToDescriptor);
      else Reflect.deleteProperty(HTMLElement.prototype, "scrollTo");
    }
  });
});
