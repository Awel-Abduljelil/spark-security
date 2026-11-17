// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminManagement } from "../src/pages/admin/AdminManagement";
import { AdminLayout } from "../src/pages/admin/AdminLayout";
import { adminUrl } from "../src/lib/adminPath";
import {
  getLegacySettings,
  listMentors,
  updateLegacySettings,
} from "../src/lib/adminApi";

vi.mock("../src/lib/adminApi", () => ({
  getLegacySettings: vi.fn(),
  updateLegacySettings: vi.fn(),
  listMentors: vi.fn(),
  saveMentor: vi.fn(),
  deleteMentor: vi.fn(),
  listFaqs: vi.fn(),
  saveFaq: vi.fn(),
  deleteFaq: vi.fn(),
  listPaymentMethods: vi.fn(),
  savePaymentMethod: vi.fn(),
  deletePaymentMethod: vi.fn(),
  listMessages: vi.fn(),
  markMessageRead: vi.fn(),
  deleteMessage: vi.fn(),
  listAuditEntries: vi.fn(),
  getLegacyAdminInfo: vi.fn(),
  changeAdminPassword: vi.fn(),
  setupAdminTotp: vi.fn(),
  enableAdminTotp: vi.fn(),
  disableAdminTotp: vi.fn(),
  uploadImage: vi.fn(),
}));

function renderManagement(path = adminUrl("/settings/website")) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={adminUrl("/settings/:section")} element={
          <AdminLayout><AdminManagement /></AdminLayout>
        } />
      </Routes>
    </MemoryRouter>,
  );
}

describe("merged admin management", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getLegacySettings).mockResolvedValue({
      hero_title: "Build skills",
      contact_email: "hello@example.test",
      group_instructions: "Check Telegram",
    });
    vi.mocked(updateLegacySettings).mockResolvedValue({ ok: true });
    vi.mocked(listMentors).mockResolvedValue([{
      id: 1, name: "Published mentor", role: "Educator", bio: "Real profile",
      specialties: ["Security"], achievements: [], photo: "", linkedin: "", github: "",
      published: 1, sort: 0,
    }]);
  });

  it("shows management sections in /admin and saves website content", async () => {
    renderManagement();

    expect(await screen.findByLabelText("Contact email")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Mentors" })).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Additional settings" })).toBeNull();

    fireEvent.change(screen.getByLabelText("Contact email"), {
      target: { value: "admin@example.test" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save website content" }));

    await waitFor(() => expect(updateLegacySettings).toHaveBeenCalledWith(
      expect.objectContaining({ contact_email: "admin@example.test" }),
    ));
    expect((await screen.findByRole("status")).textContent).toContain("Website content saved.");
  });

  it("loads existing mentor profiles from the management section", async () => {
    renderManagement(adminUrl("/settings/mentors"));
    expect(await screen.findByText("Published mentor")).toBeTruthy();
    expect(listMentors).toHaveBeenCalled();
  });
});
