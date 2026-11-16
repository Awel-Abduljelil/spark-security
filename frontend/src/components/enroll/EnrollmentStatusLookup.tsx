import { useState, type FormEvent } from "react";
import {
  ApiError,
  lookupEnrollmentStatus,
  type EnrollmentStatusResponse,
} from "../../lib/api";
import {
  readEnrollmentStatusCache,
  saveEnrollmentStatusCache,
  type CachedEnrollmentStatus,
} from "../../lib/enrollmentStatusCache";
import { useLanguage } from "../../i18n/useLanguage";

function statusMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 429) return "Too many status checks. Please try again later.";
    if (error.status === 404) return error.message;
  }
  return "Status is temporarily unavailable. Please try again later.";
}

export function EnrollmentStatusLookup() {
  const { t } = useLanguage();
  const [initialCache] = useState(() => readEnrollmentStatusCache());
  const [ref, setRef] = useState(initialCache.status?.ref ?? "");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<
    EnrollmentStatusResponse | CachedEnrollmentStatus | null
  >(initialCache.status);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cacheUnavailable, setCacheUnavailable] = useState(initialCache.unavailable);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await lookupEnrollmentStatus(ref.trim(), phone.trim());
      setResult(response);
      const cached = {
        ref: response.ref,
        course: response.course,
        amount: response.amount,
        status: response.status,
        createdAt: response.createdAt,
      };
      setCacheUnavailable(!saveEnrollmentStatusCache(cached));
    } catch (requestError) {
      setError(t(statusMessage(requestError)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card enrollment-status-lookup" aria-labelledby="enrollment-status-title">
      <h2 id="enrollment-status-title">{t("Check enrollment status")}</h2>
      <p>{t("Enter your reference number and the phone number used to register.")}</p>
      <form className="enrollment-form" onSubmit={handleSubmit}>
        <div className="enrollment-form__field">
          <label htmlFor="enrollment-reference">{t("Reference number")}</label>
          <input
            id="enrollment-reference"
            autoComplete="off"
            value={ref}
            required
            onChange={(event) => setRef(event.currentTarget.value)}
          />
        </div>
        <div className="enrollment-form__field">
          <label htmlFor="enrollment-status-phone">{t("Phone")}</label>
          <input
            id="enrollment-status-phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            required
            onChange={(event) => setPhone(event.currentTarget.value)}
          />
        </div>
        {error && <p className="enroll-notice" role="alert">{error}</p>}
        {cacheUnavailable && (
          <p className="enroll-notice" role="status">
            {t("This browser cannot cache enrollment status. Please keep your reference number.")}
          </p>
        )}
        <button type="submit" disabled={loading}>
          {loading ? t("Checking...") : t("Check status")}
        </button>
      </form>
      {result && (
        <div className="enrollment-status-lookup__result" role="status" aria-live="polite">
          <p><strong>{t("Course")}:</strong> {result.course}</p>
          <p><strong>{t("Status")}:</strong> {t(result.status)}</p>
          <p>{t("Your reference number")}: <strong>{result.ref}</strong></p>
          {result.status === "rejected" && "reason" in result && result.reason && (
            <p><strong>{t("Reason")}:</strong> {result.reason}</p>
          )}
          {result.status === "approved" &&
            "telegramInvited" in result &&
            result.telegramInvited && (
              <p>{t("Your Telegram invitation has been sent. Check Telegram to join the private group.")}</p>
            )}
          {result.status === "approved" && "instructions" in result && result.instructions && (
            <p><strong>{t("Next steps")}:</strong> {result.instructions}</p>
          )}
        </div>
      )}
    </section>
  );
}
