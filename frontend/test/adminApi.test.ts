// These tests hit the live backend unauthenticated (no cookie jar in node).
// /api/app/admin/login is deliberately NOT exercised: the route is rate limited to
// 5 attempts per 15 minutes, so a permanent wrong-password test would burn the
// real limit. The login branch of the interceptor exemption is covered by the
// corresponding /api/app/admin/me check.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  AdminApiError,
  listCourses,
  me,
} from "../src/lib/adminApi";
import { adminUrl } from "../src/lib/adminPath";
import { backendUp } from "./live";

const assign = vi.fn();

beforeEach(() => {
  vi.stubGlobal("window", { location: { assign } });
  assign.mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe.skipIf(!backendUp)("admin API client (live backend, unauthenticated)", () => {
  it("wraps a 401 into AdminApiError with the server message and no issues", async () => {
    const error: unknown = await listCourses().catch((e: unknown) => e);

    expect(error).toBeInstanceOf(AdminApiError);
    const adminError = error as AdminApiError;
    expect(adminError.status).toBe(401);
    expect(adminError.message).toBe("Not signed in");
    expect(adminError.issues).toEqual([]);
  });

  it("redirects to /admin/login on 401 for non-exempt admin routes", async () => {
    await listCourses().catch(() => undefined);
    expect(assign).toHaveBeenCalledTimes(1);
    expect(assign).toHaveBeenCalledWith(adminUrl("/login"));
  });

  it("does not redirect for the exempt /api/app/admin/me route", async () => {
    const error: unknown = await me().catch((e: unknown) => e);

    expect(error).toBeInstanceOf(AdminApiError);
    expect((error as AdminApiError).status).toBe(401);
    expect(assign).not.toHaveBeenCalled();
  });

  it("keeps status and validation issues on AdminApiError", () => {
    const error = new AdminApiError(422, "Invalid fields.", [
      { path: "slug", message: "Slug is required." },
    ]);

    expect(error.name).toBe("AdminApiError");
    expect(error.status).toBe(422);
    expect(error.message).toBe("Invalid fields.");
    expect(error.issues).toEqual([{ path: "slug", message: "Slug is required." }]);
  });
});
