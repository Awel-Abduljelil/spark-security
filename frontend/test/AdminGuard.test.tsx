// @vitest-environment jsdom
// @vitest-environment-options {"url":"http://localhost:5173"}
// Live backend session check, no mocks. The successful path is covered by the
// backend integration tests; it is not duplicated here because the admin
// password must never appear in test sources.
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AdminGuard } from "../src/components/admin/AdminGuard";
import { backendUp } from "./live";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe.skipIf(!backendUp)("AdminGuard (live backend, unauthenticated)", () => {
  it("shows the loading state, then redirects to /admin/login", async () => {
    const assign = vi.fn();
    vi.stubGlobal("location", { assign });

    render(
      <MemoryRouter initialEntries={["/admin/secret"]}>
        <Routes>
          <Route
            path="/admin/secret"
            element={
              <AdminGuard>
                <p>admin secret</p>
              </AdminGuard>
            }
          />
          <Route path="/admin/login" element={<p>admin login page</p>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Checking admin session...")).toBeTruthy();

    await waitFor(
      () => expect(screen.getByText("admin login page")).toBeTruthy(),
      { timeout: 10000 },
    );
    expect(screen.queryByText("admin secret")).toBeNull();
    // /api/app/admin/me is exempt from the interceptor redirect.
    expect(assign).not.toHaveBeenCalled();
  });
});
