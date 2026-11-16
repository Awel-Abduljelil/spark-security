import { useLanguage } from "../../i18n/useLanguage";
import "./EnrollSteps.css";

export function EnrollSteps() {
  const { t } = useLanguage();
  const steps = [
    { title: "Pay", description: "Transfer the course fee using one of the payment methods below." },
    { title: "Submit your receipt", description: "Complete the form with your details and payment proof." },
    { title: "Get your Telegram invite", description: "After we verify your payment, we’ll send your cohort invite." },
  ];

  return (
    <section className="enroll-steps-card card" aria-labelledby="enroll-steps-title">
      <h2 id="enroll-steps-title">{t("How to enroll")}</h2>
      <ol className="enroll-steps">
        {steps.map((step, index) => (
          <li className="enroll-steps__item" key={step.title}>
            <span className="enroll-steps__number" aria-hidden="true">
              {index + 1}
            </span>
            <div>
              <h3>{t(step.title)}</h3>
              <p>{t(step.description)}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
