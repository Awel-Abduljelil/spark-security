import {
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { ApiError, submitEnrollment } from "../../lib/api";
import {
  readEnrollmentStatusCache,
  saveEnrollmentStatusCache,
  type CachedEnrollmentStatus,
} from "../../lib/enrollmentStatusCache";
import { useCohort } from "../../hooks/useCohort";
import { ReceiptField, type ReceiptMethod } from "./ReceiptField";
import type { Course } from "../../types/course";
import { useLanguage } from "../../i18n/useLanguage";
import { CourseLanguageBadge } from "../course/CourseLanguageBadge";
import "./EnrollForm.css";

interface EnrollFormProps {
  initialCourseSlug: string;
  courses: Course[];
}

interface EnrollmentFormValues {
  fullName: string;
  email: string;
  phone: string;
  telegramUsername: string;
  courseSlug: string;
  receiptMethod: ReceiptMethod;
  receiptFile: File | null;
  receiptLink: string;
  receiptError: string;
  agreedToEthics: boolean;
}

type SubmitStatus = "idle" | "submitting" | "success" | "error";

const emptyForm: EnrollmentFormValues = {
  fullName: "",
  email: "",
  phone: "",
  telegramUsername: "",
  courseSlug: "",
  receiptMethod: "upload",
  receiptFile: null,
  receiptLink: "",
  receiptError: "",
  agreedToEthics: false,
};

const allowedReceiptTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];
const allowedImageExtensions = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
];
const maxReceiptSize = 5 * 1024 * 1024;

function isAllowedReceipt(file: File): boolean {
  const extension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0] ?? "";
  return (
    allowedReceiptTypes.includes(file.type) ||
    allowedImageExtensions.includes(extension) ||
    extension === ".pdf"
  );
}

function getSubmitErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "Something went wrong. Please check your connection and try again.";
  }

  if (
    error.status === 413 ||
    (error.status === 400 &&
      /receipt must be 5 MB or smaller/i.test(error.message))
  ) {
    return "That file is too large. Maximum size is 5 MB.";
  }
  if (error.status === 429) {
    return "Too many registration attempts. Please wait 5 minutes before trying again.";
  }
  if (
    error.status === 409 &&
    error.message.startsWith("You are already registered.")
  ) {
    return "You are already registered. Please wait up to 24 hours for your registration to be reviewed, or contact our team on Telegram.";
  }
  if (error.status === 400 || error.status === 409) return error.message;
  return "Something went wrong. Please check your connection and try again.";
}

export function EnrollForm({
  initialCourseSlug,
  courses,
}: EnrollFormProps) {
  const { t } = useLanguage();
  const [initialCache] = useState(() => readEnrollmentStatusCache());
  const [form, setForm] = useState<EnrollmentFormValues>({
    ...emptyForm,
    courseSlug: initialCourseSlug,
  });
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [submitError, setSubmitError] = useState("");
  const [enrollmentRef, setEnrollmentRef] = useState("");
  const [duplicateRegistration, setDuplicateRegistration] = useState(false);
  const [cachedStatus, setCachedStatus] = useState<CachedEnrollmentStatus | null>(
    initialCache.status,
  );
  const [cacheUnavailable, setCacheUnavailable] = useState(initialCache.unavailable);
  const submitting = useRef(false);
  const selectedCourse = courses.find((course) => course.slug === form.courseSlug);
  const { cohort, status: cohortStatus } = useCohort(form.courseSlug);
  const cohortReady = cohortStatus === "ready" && cohort !== null;
  const seatsLeft = cohortReady ? cohort.seatsLeft : null;
  const totalSeats = cohortReady ? cohort.totalSeats : null;
  const startDate = cohortReady ? cohort.startDate : "";
  const priceText = cohortReady
    ? cohort.priceEtb !== null
      ? `ETB ${cohort.priceEtb.toLocaleString("en-US")}`
      : (selectedCourse?.price ?? "Price unavailable")
    : (selectedCourse?.price ?? "Price unavailable");
  const isFull = cohortReady && cohort.totalSeats !== 0 && cohort.seatsLeft === 0;
  const registrationClosed =
    Boolean(form.courseSlug) && cohortStatus === "none";
  const cohortUnavailable = Boolean(form.courseSlug) && cohortStatus === "error";

  function updateForm(values: Partial<EnrollmentFormValues>) {
    setForm((current) => ({ ...current, ...values }));
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0] ?? null;
    if (!file) {
      updateForm({ receiptFile: null, receiptError: "" });
      return;
    }

    if (!isAllowedReceipt(file)) {
      event.currentTarget.value = "";
      updateForm({
        receiptFile: null,
        receiptError: t("Choose an image or PDF receipt."),
      });
      return;
    }

    if (file.size > maxReceiptSize) {
      event.currentTarget.value = "";
      updateForm({
        receiptFile: null,
        receiptError: t("The receipt file must be 5 MB or smaller."),
      });
      return;
    }

    updateForm({ receiptFile: file, receiptError: "" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setSubmitStatus("submitting");
    setSubmitError("");
    setDuplicateRegistration(false);

    const formData = new FormData();
    formData.append("fullName", form.fullName);
    formData.append("email", form.email);
    formData.append("phone", form.phone);
    formData.append("telegram", form.telegramUsername);
    formData.append("courseSlug", form.courseSlug);
    formData.append("receiptType", form.receiptMethod);
    formData.append("consent", String(form.agreedToEthics));
    if (cohortReady) formData.append("cohortId", String(cohort.id));

    if (form.receiptMethod === "upload" && form.receiptFile) {
      formData.append("receipt", form.receiptFile);
    } else if (form.receiptMethod === "link") {
      formData.append("receiptLink", form.receiptLink);
    }

    try {
      const response = await submitEnrollment(formData);
      setEnrollmentRef(response.ref);
      const cached = {
        ref: response.ref,
        course: response.course,
        amount: response.amount,
        status: response.status,
        createdAt: response.createdAt,
      };
      setCachedStatus(cached);
      setCacheUnavailable(!saveEnrollmentStatusCache(cached));
      setForm(emptyForm);
      setSubmitStatus("success");
    } catch (error) {
      setSubmitError(t(getSubmitErrorMessage(error)));
      setDuplicateRegistration(
        error instanceof ApiError &&
          error.status === 409 &&
          error.message.startsWith("You are already registered."),
      );
      setSubmitStatus("error");
    } finally {
      submitting.current = false;
    }
  }

  return (
    <section
      className="enroll-form-card card"
      aria-labelledby="enroll-form-title"
    >
      <div className="enroll-order-summary" aria-live="polite">
        <p className="enroll-order-summary__label">{t("Order summary")}</p>
        {selectedCourse ? (
          <dl>
            <div>
              <dt>{t("Course")}</dt>
              <dd>{selectedCourse.title}</dd>
            </div>
            <div>
              <dt>{t("Starts")}</dt>
              <dd>
                {cohortStatus === "loading"
                  ? t("Loading...")
                  : cohortStatus === "error"
                    ? t("Unavailable")
                    : registrationClosed
                      ? t("Not scheduled")
                    : startDate || t("To be announced")}
              </dd>
            </div>
            <div>
              <dt>{t("Seats left")}</dt>
              <dd>
                {registrationClosed
                  ? t("Registration closed")
                  : cohortStatus === "loading"
                    ? t("Loading...")
                    : cohortStatus === "error"
                      ? t("Unavailable")
                      : totalSeats === 0
                        ? t("Unlimited")
                        : `${seatsLeft} of ${totalSeats}`}
              </dd>
            </div>
            <div>
              <dt>{t("Total")}</dt>
              <dd>
                {priceText}
              </dd>
            </div>
          </dl>
        ) : (
          <p>{t("Choose a course below to see your cohort summary.")}</p>
        )}
      </div>

      {cachedStatus && submitStatus !== "success" && (
        <div className="enroll-success" role="status">
          <h2>{t("Your saved registration status")}</h2>
          <p>
            <strong>{t("Course")}:</strong> {cachedStatus.course}
          </p>
          <p>
            <strong>{t("Status")}:</strong> {t(cachedStatus.status)}
          </p>
          <p>
            {t("Your reference number")}: <strong>{cachedStatus.ref}</strong>
          </p>
          <p>{t("For the latest status, use Check enrollment status with your phone number.")}</p>
        </div>
      )}
      {cacheUnavailable && (
        <p className="enroll-notice" role="status">
          {t("This browser cannot cache enrollment status. Please keep your reference number.")}
        </p>
      )}

      {submitStatus === "success" ? (
        <div className="enroll-success" role="status">
          <h2 id="enroll-form-title">{t("Registration received")}</h2>
          <p>
            {t("Registration received. We'll verify your payment and send your Telegram invite within 24 hours.")}
          </p>
          {cachedStatus && (
            <p>
              <strong>{t("Status")}:</strong> {t(cachedStatus.status)}
            </p>
          )}
          {enrollmentRef && (
            <p>
              {t("Your reference number")}: <strong>{enrollmentRef}</strong>
            </p>
          )}
        </div>
      ) : (
        <>
          <h2 id="enroll-form-title">{t("Your details")}</h2>
          {isFull && (
            <p className="enroll-notice" role="status">
              {t("This cohort is full. Choose another course to continue.")}
            </p>
          )}
          {registrationClosed && (
            <p className="enroll-notice" role="status">
              {t("Registration closed")}
            </p>
          )}
          {cohortUnavailable && (
            <p className="enroll-notice" role="alert">
              {t("Cohort details are temporarily unavailable. Please try again later.")}
            </p>
          )}
          <form className="enrollment-form" onSubmit={handleSubmit}>
            <div className="enrollment-form__field">
              <label htmlFor="full-name">{t("Full name")}</label>
              <input
                autoComplete="name"
                id="full-name"
                name="fullName"
                type="text"
                value={form.fullName}
                pattern="\p{L}+(?:[\-']\p{L}+)* \p{L}+(?:[\-']\p{L}+)*(?: \p{L}+(?:[\-']\p{L}+)*)*"
                title={t("Enter your first and last name using letters only, separated by a space")}
                required
                onChange={(event) =>
                  updateForm({ fullName: event.currentTarget.value })
                }
              />
            </div>
            <div className="enrollment-form__field">
              <label htmlFor="email">{t("Email")}</label>
              <input
                autoComplete="email"
                id="email"
                name="email"
                type="email"
                value={form.email}
                required
                onChange={(event) =>
                  updateForm({ email: event.currentTarget.value })
                }
              />
            </div>
            <div className="enrollment-form__field">
              <label htmlFor="phone">{t("Phone")}</label>
              <input
                autoComplete="tel"
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                required
                onChange={(event) =>
                  updateForm({ phone: event.currentTarget.value })
                }
              />
            </div>
            <div className="enrollment-form__field">
              <label htmlFor="telegram-username">{t("Telegram username")}</label>
              <input
                autoComplete="off"
                id="telegram-username"
                name="telegramUsername"
                type="text"
                value={form.telegramUsername}
                pattern="@[A-Za-z0-9_]{5,32}"
                title={t("Enter a Telegram username starting with @ (5–32 characters).")}
                placeholder="@username"
                required
                onChange={(event) =>
                  updateForm({ telegramUsername: event.currentTarget.value })
                }
              />
            </div>
            <div className="enrollment-form__field">
              <label htmlFor="course">{t("Course")}</label>
              {selectedCourse && <CourseLanguageBadge language={selectedCourse.language} />}
              <select
                id="course"
                name="course"
                value={form.courseSlug}
                required
                onChange={(event) =>
                  updateForm({ courseSlug: event.currentTarget.value })
                }
              >
                <option value="">{t("Choose a course")}</option>
                {courses.map((course) => (
                  <option value={course.slug} key={course.slug}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
            <ReceiptField
              method={form.receiptMethod}
              file={form.receiptFile}
              link={form.receiptLink}
              error={form.receiptError}
              onMethodChange={(method) => updateForm({ receiptMethod: method })}
              onFileChange={handleFileChange}
              onLinkChange={(receiptLink) => updateForm({ receiptLink })}
            />
            <div className="enrollment-form__consent">
              <input
                id="ethics-agreement"
                name="ethicsAgreement"
                type="checkbox"
                checked={form.agreedToEthics}
                required
                onChange={(event) =>
                  updateForm({ agreedToEthics: event.currentTarget.checked })
                }
              />
              <label htmlFor="ethics-agreement">
                {t("I agree to use what I learn only for legal, authorized purposes")}
              </label>
            </div>
            {submitError && (
              <p className="enroll-notice" role="alert">
                {submitError}{" "}
                {duplicateRegistration && (
                  <a href="https://t.me/Awexaa" target="_blank" rel="noreferrer noopener">
                    {t("Contact our team on Telegram")} @Awexaa
                  </a>
                )}
              </p>
            )}
            <button
              type="submit"
              disabled={
                !cohortReady ||
                isFull ||
                registrationClosed ||
                submitStatus === "submitting"
              }
            >
              {submitStatus === "submitting"
                ? t("Submitting...")
                : t("Submit enrollment")}
            </button>
          </form>
        </>
      )}
    </section>
  );
}
