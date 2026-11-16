import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  createCohort,
  updateCohort,
  type AdminCourseListItem,
  type AdminCohort,
} from "../../lib/adminApi";

interface CohortDialogProps {
  cohort: AdminCohort | null;
  courses: AdminCourseListItem[];
  onClose: () => void;
  onSaved: () => void;
}

export function CohortDialog({ cohort, courses, onClose, onSaved }: CohortDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [courseSlug, setCourseSlug] = useState(cohort?.courseSlug ?? "");
  const [label, setLabel] = useState(cohort?.label ?? "");
  const [startDate, setStartDate] = useState(cohort?.startDate ?? "");
  const [totalSeats, setTotalSeats] = useState(
    String(cohort?.totalSeats ?? ""),
  );
  const [priceEtb, setPriceEtb] = useState(String(cohort?.priceEtb ?? ""));
  const [schedule, setSchedule] = useState(cohort?.schedule ?? "");
  const [isOpen, setIsOpen] = useState(cohort?.isOpen ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const seats = Number(totalSeats);
    const price = priceEtb === "" ? null : Number(priceEtb);
    if (!courses.some((course) => course.slug === courseSlug && course.status !== "archived")) {
      setError("Choose a valid course.");
      return;
    }
    const parsedDate = new Date(`${startDate}T00:00:00.000Z`);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(startDate) ||
      Number.isNaN(parsedDate.valueOf()) ||
      parsedDate.toISOString().slice(0, 10) !== startDate
    ) {
      setError("Enter a valid start date.");
      return;
    }
    if (!Number.isInteger(seats) || seats < 0 || seats > 500) {
      setError("Total seats must be 0 (unlimited) or between 1 and 500.");
      return;
    }
    if (
      price !== null &&
      (!Number.isInteger(price) || price < 0 || price > 1_000_000)
    ) {
      setError("Price must be an integer from 0 to 1,000,000 ETB.");
      return;
    }
    if (!cohort && (price === null || !schedule.trim())) {
      setError("Price and schedule are required for a new cohort.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      if (cohort) {
        await updateCohort(cohort.id, {
          label: label.trim() || null,
          startDate,
          totalSeats: seats,
          priceEtb: price,
          schedule: schedule.trim() || null,
          isOpen,
        });
      } else {
        await createCohort({
          courseSlug,
          label: label.trim() || undefined,
          startDate,
          totalSeats: seats,
          priceEtb: price ?? 0,
          schedule: schedule.trim(),
          isOpen,
        });
      }
      onSaved();
      dialogRef.current?.close();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not save this cohort.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <dialog
      className="admin-dialog"
      ref={dialogRef}
      aria-labelledby="cohort-dialog-title"
      onClose={onClose}
    >
      <form className="admin-dialog__content" onSubmit={handleSubmit}>
        <header className="admin-dialog__header">
          <h2 id="cohort-dialog-title">
            {cohort ? "Edit cohort" : "Create cohort"}
          </h2>
          <button
            className="invert"
            type="button"
            onClick={() => dialogRef.current?.close()}
          >
            Close
          </button>
        </header>
        {!cohort && (
          <label className="admin-field">
            Course
            <select
              required
              value={courseSlug}
              onChange={(event) => setCourseSlug(event.currentTarget.value)}
            >
              <option value="">Choose a course</option>
              {courses.filter((course) => course.status !== "archived").map((course) => (
                <option value={course.slug} key={course.slug}>
                  {course.title} ({course.slug})
                </option>
              ))}
            </select>
          </label>
        )}
        {cohort && (
          <p className="admin-cohort-course">
            Course: {courses.find((item) => item.slug === cohort.courseSlug)?.title ?? cohort.courseSlug} ({cohort.courseSlug})
          </p>
        )}
        <label className="admin-field">
          Label
          <input
            value={label}
            maxLength={100}
            onChange={(event) => setLabel(event.currentTarget.value)}
            placeholder="January 2027"
          />
        </label>
        <label className="admin-field">
          Start date
          <input
            type="date"
            required
            value={startDate}
            onChange={(event) => setStartDate(event.currentTarget.value)}
          />
        </label>
        <label className="admin-field">
          Total seats (0 = unlimited)
          <input
            type="number"
            min="0"
            max="500"
            required
            value={totalSeats}
            onChange={(event) => setTotalSeats(event.currentTarget.value)}
          />
        </label>
        <label className="admin-field">
          Price (ETB)
          <input
            type="number"
            min="0"
            max="1000000"
            step="1"
            required={!cohort}
            value={priceEtb}
            onChange={(event) => setPriceEtb(event.currentTarget.value)}
          />
        </label>
        <label className="admin-field">
          Schedule
          <input
            value={schedule}
            required={!cohort}
            maxLength={300}
            onChange={(event) => setSchedule(event.currentTarget.value)}
            placeholder="Sat & Sun, 7:00 PM EAT"
          />
        </label>
        <label className="admin-checkbox">
          <input
            type="checkbox"
            checked={isOpen}
            onChange={(event) => setIsOpen(event.currentTarget.checked)}
          />
          Open for enrollment
        </label>
        {error && (
          <p className="admin-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : cohort ? "Save changes" : "Create cohort"}
        </button>
      </form>
    </dialog>
  );
}
