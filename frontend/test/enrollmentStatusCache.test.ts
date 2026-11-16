// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  readEnrollmentStatusCache,
  saveEnrollmentStatusCache,
  type CachedEnrollmentStatus,
} from "../src/lib/enrollmentStatusCache";

const now = 1_800_000_000_000;
const cachedStatus: CachedEnrollmentStatus = {
  ref: "SPK-ABCDEF0123",
  course: "Cybersecurity Fundamentals",
  amount: 1500,
  status: "pending",
  createdAt: now,
};

beforeEach(() => {
  window.localStorage.clear();
  vi.useFakeTimers();
  vi.setSystemTime(now);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("enrollment status cache", () => {
  it("saves only the enrollment reference and status fields", () => {
    expect(saveEnrollmentStatusCache(cachedStatus)).toBe(true);

    const raw = window.localStorage.getItem("spark-enrollment-status");
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw ?? "{}")).toEqual(cachedStatus);
    expect(raw).not.toContain("phone");
    expect(raw).not.toContain("email");
    expect(raw).not.toContain("telegram");
    expect(readEnrollmentStatusCache()).toEqual({
      status: cachedStatus,
      unavailable: false,
    });
  });

  it("expires cached status after 24 hours", () => {
    saveEnrollmentStatusCache(cachedStatus);
    vi.setSystemTime(now + 24 * 60 * 60 * 1000);

    expect(readEnrollmentStatusCache()).toEqual({
      status: null,
      unavailable: false,
    });
    expect(window.localStorage.getItem("spark-enrollment-status")).toBeNull();
  });

  it("discards malformed cached data", () => {
    window.localStorage.setItem("spark-enrollment-status", '{"status":"approved"}');

    expect(readEnrollmentStatusCache()).toEqual({
      status: null,
      unavailable: false,
    });
    expect(window.localStorage.getItem("spark-enrollment-status")).toBeNull();
  });
});
