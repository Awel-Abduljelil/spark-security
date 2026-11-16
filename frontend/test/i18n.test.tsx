// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { NavBar } from "../src/components/layout/NavBar";
import { LanguageProvider } from "../src/i18n/LanguageContext";

function renderNavBar() {
  return render(
    <LanguageProvider>
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>
    </LanguageProvider>,
  );
}

describe("language selection", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("defaults to English", () => {
    renderNavBar();

    expect(screen.getByRole("link", { name: "Home" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Select language" }).textContent).toContain(
      "English",
    );
    expect(document.documentElement.lang).toBe("en");
  });

  it("restores the saved language", () => {
    window.localStorage.setItem("spark-language", "am");

    renderNavBar();

    expect(screen.getByRole("link", { name: "መነሻ" })).toBeTruthy();
    expect(document.documentElement.lang).toBe("am");
  });

  it("translates navigation and persists a new selection", () => {
    renderNavBar();

    fireEvent.click(screen.getByRole("button", { name: "Open navigation menu" }));
    fireEvent.click(screen.getByRole("button", { name: "Select language" }));
    fireEvent.click(screen.getByRole("menuitemradio", { name: "Afaan Oromoo" }));

    expect(screen.getByRole("link", { name: "Mana" })).toBeTruthy();
    expect(window.localStorage.getItem("spark-language")).toBe("om");
    expect(document.documentElement.lang).toBe("om");
  });

  it("opens language options beside the language button", () => {
    renderNavBar();

    fireEvent.click(screen.getByRole("button", { name: "Open navigation menu" }));
    fireEvent.click(screen.getByRole("button", { name: "Select language" }));

    expect(screen.getByRole("menu", { name: "Select language" })).toBeTruthy();
    expect(screen.getAllByRole("menuitemradio")).toHaveLength(3);
  });

  it("closes the mobile menu when the user clicks outside it", () => {
    renderNavBar();
    const toggle = screen.getByRole("button", { name: "Open navigation menu" });

    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");

    fireEvent.pointerDown(document.body);

    expect(
      screen.getByRole("button", { name: "Open navigation menu" }).getAttribute("aria-expanded"),
    ).toBe("false");
  });
});
