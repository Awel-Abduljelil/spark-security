// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "../src/i18n/LanguageContext";
import { MentorCarousel, type MentorProfile } from "../src/components/mentors/MentorCarousel";

const mentors: MentorProfile[] = [
  {
    id: "1",
    name: "Ada Mentor",
    role: "Security researcher",
    bio: "A practitioner who teaches hands-on security.",
    specialties: ["Application security"],
    achievements: ["Published security research"],
    photo: "/media/ada.webp",
    links: [{ label: "LinkedIn", url: "https://linkedin.example/ada" }],
  },
  {
    id: "2",
    name: "Bek Mentor",
    role: "Incident responder",
    bio: "A responder who helps students investigate incidents.",
    specialties: ["Incident response"],
    achievements: [],
    links: [{ label: "GitHub", url: "https://github.example/bek" }],
  },
  {
    id: "3",
    name: "Caro Mentor",
    role: "Security educator",
    bio: "An educator focused on practical training.",
    specialties: ["Education"],
    achievements: [],
    links: [],
  },
];

function renderCarousel(profiles = mentors) {
  return render(<LanguageProvider><MentorCarousel mentors={profiles} /></LanguageProvider>);
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("mentor carousel", () => {
  it("renders mentors in order and centers the first on load", async () => {
    renderCarousel();
    const slides = screen.getAllByRole("group", { name: /of 3:/ });
    expect(slides.map((slide) => slide.getAttribute("aria-label"))).toEqual([
      "1 of 3: Ada Mentor",
      "2 of 3: Bek Mentor",
      "3 of 3: Caro Mentor",
    ]);
    await waitFor(() => expect(slides[0].classList.contains("is-active")).toBe(true));
  });

  it("centers a side card and arrow-selected mentor", () => {
    renderCarousel();
    fireEvent.click(screen.getByRole("group", { name: "2 of 3: Bek Mentor" }));
    expect(screen.getByRole("group", { name: "2 of 3: Bek Mentor" }).classList.contains("is-active")).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Next mentor" }));
    expect(screen.getByRole("group", { name: "3 of 3: Caro Mentor" }).classList.contains("is-active")).toBe(true);
  });

  it("shows each mentor's full details and links and applies the center scale", async () => {
    renderCarousel();
    const region = screen.getByRole("region", { name: "Mentors" });
    const viewport = region.querySelector(".mentor-carousel__viewport") as HTMLDivElement;
    const slides = screen.getAllByRole("group", { name: /of 3:/ });
    Object.defineProperty(viewport, "clientWidth", { configurable: true, value: 300 });
    vi.spyOn(viewport, "getBoundingClientRect").mockReturnValue({ left: 0, right: 300, top: 0, bottom: 200, width: 300, height: 200, x: 0, y: 0, toJSON: () => ({}) });
    Array.from({ length: mentors.length * 3 }, (_, index) => 50 + (index - mentors.length * 2) * 210)
      .forEach((left, index) => {
        const slide = region.querySelectorAll(".mentor-carousel__slide")[index];
        vi.spyOn(slide, "getBoundingClientRect").mockReturnValue({ left, right: left + 200, top: 0, bottom: 250, width: 200, height: 250, x: left, y: 0, toJSON: () => ({}) });
    });
    fireEvent.scroll(viewport);
    await waitFor(() => {
      expect(slides[0].style.getPropertyValue("--scale")).toBe("1.000");
      expect(slides[1].style.getPropertyValue("--scale")).toBe("0.920");
    });
    expect(screen.getByRole("link", { name: "LinkedIn" }).getAttribute("tabindex")).not.toBe("-1");
    expect(screen.getByRole("link", { name: "GitHub" }).getAttribute("tabindex")).not.toBe("-1");
    const sideMentor = slides[1];
    expect(sideMentor.querySelector(".mentor-card__bio")?.textContent).toBe(mentors[1].bio);
    expect(sideMentor.querySelector(".mentor-card__bio")?.classList.contains("mentor-card__bio--clamped")).toBe(false);
    expect(sideMentor.querySelector("a")?.getAttribute("aria-label")).toBe("GitHub");
    expect(sideMentor.querySelector("a svg")?.getAttribute("aria-hidden")).toBe("true");
    expect(slides[0].textContent).toContain("Published security research");
    fireEvent.click(screen.getByRole("group", { name: "2 of 3: Bek Mentor" }));
    expect(screen.getByRole("link", { name: "LinkedIn" }).getAttribute("tabindex")).not.toBe("-1");
    expect(screen.getByRole("link", { name: "GitHub" }).getAttribute("tabindex")).not.toBe("-1");
  });

  it("moves between mentors with the keyboard", () => {
    renderCarousel();
    fireEvent.keyDown(screen.getByRole("region", { name: "Mentors" }), { key: "ArrowRight" });
    expect(screen.getByRole("group", { name: "2 of 3: Bek Mentor" }).classList.contains("is-active")).toBe(true);
    fireEvent.keyDown(screen.getByRole("region", { name: "Mentors" }), { key: "ArrowLeft" });
    expect(screen.getByRole("group", { name: "1 of 3: Ada Mentor" }).classList.contains("is-active")).toBe(true);
  });

  it("disables rotation when reduced motion is requested", async () => {
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
    renderCarousel();
    expect(screen.getByRole("region", { name: "Mentors" }).getAttribute("data-autoplaying")).toBe("false");
    const slide = screen.getByRole("group", { name: "1 of 3: Ada Mentor" });
    await waitFor(() => expect(slide.style.getPropertyValue("--rotation")).toBe("0.00deg"));
  });

  it("keeps gliding while hovered or focused and pauses during a drag", () => {
    renderCarousel();
    const region = screen.getByRole("region", { name: "Mentors" });
    expect(region.getAttribute("data-autoplaying")).toBe("true");
    fireEvent.pointerEnter(region);
    expect(region.getAttribute("data-autoplaying")).toBe("true");
    fireEvent.focus(region);
    expect(region.getAttribute("data-autoplaying")).toBe("true");
    const viewport = region.querySelector(".mentor-carousel__viewport") as HTMLDivElement;
    fireEvent.pointerDown(viewport, { pointerType: "mouse", button: 0, pointerId: 1, clientX: 100 });
    expect(region.getAttribute("data-autoplaying")).toBe("false");
    fireEvent.pointerUp(viewport, { pointerType: "mouse", pointerId: 1 });
    expect(region.getAttribute("data-autoplaying")).toBe("true");
  });

  it("moves the track right continuously and wraps without a jump", () => {
    const callbacks: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", vi.fn((callback: FrameRequestCallback) => {
      callbacks.push(callback);
      return callbacks.length;
    }));
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    const layoutProperties = ["offsetLeft", "offsetWidth", "clientWidth"].map((property) => ({
      property,
      descriptor: Object.getOwnPropertyDescriptor(HTMLElement.prototype, property),
    }));

    try {
      Object.defineProperty(HTMLElement.prototype, "offsetLeft", {
        configurable: true,
        get() {
          return this.classList?.contains("mentor-carousel__slide")
            ? Number(this.dataset.copy) * 600 + Number(this.dataset.index) * 200
            : 0;
        },
      });
      Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
        configurable: true,
        get() { return this.classList?.contains("mentor-carousel__slide") ? 200 : 0; },
      });
      Object.defineProperty(HTMLElement.prototype, "clientWidth", {
        configurable: true,
        get() { return this.classList?.contains("mentor-carousel__viewport") ? 300 : 0; },
      });

      renderCarousel();
      const viewport = screen.getByRole("region", { name: "Mentors" })
        .querySelector(".mentor-carousel__viewport") as HTMLDivElement;
      const start = viewport.scrollLeft;
      act(() => callbacks[1](0));
      act(() => callbacks[2](50));
      expect(viewport.scrollLeft).toBe(start - 2);
      viewport.scrollLeft = 600;
      act(() => callbacks[3](100));
      expect(viewport.scrollLeft).toBe(1198);
    } finally {
      layoutProperties.forEach(({ property, descriptor }) => {
        if (descriptor) Object.defineProperty(HTMLElement.prototype, property, descriptor);
        else Reflect.deleteProperty(HTMLElement.prototype, property);
      });
    }
  });

  it("shows the empty state when no published profiles are supplied", () => {
    renderCarousel([]);
    expect(screen.getByText("Mentor profiles are coming soon.")).toBeTruthy();
  });
});
