import { useEffect, useState } from "react";
import { getPaymentMethods, type PaymentMethod } from "../../lib/api";
import { useLanguage } from "../../i18n/useLanguage";
import "./PaymentInfo.css";

export function PaymentInfo() {
  const { t } = useLanguage();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [reference, setReference] = useState("");
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    getPaymentMethods(controller.signal)
      .then((response) => {
        setMethods(response.methods);
        setReference(response.reference);
        setLoaded(true);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setError(true);
          setLoaded(true);
        }
      });
    return () => controller.abort();
  }, []);

  return (
    <section
      className="payment-info card"
      aria-labelledby="payment-info-title"
    >
      <h2 id="payment-info-title">{t("Payment instructions")}</h2>
      {error && (
        <p className="payment-info__reference" role="alert">
          {t("Payment details are temporarily unavailable. Please try again later.")}
        </p>
      )}
      {loaded && methods.length === 0 && !error && (
        <p className="payment-info__reference" role="status">
          {t("Payment methods are not available yet. Please contact us.")}
        </p>
      )}
      <div className="payment-info__methods">
        {methods.map((method) => (
          <article className="payment-method" key={method.type}>
            <h3>{t(method.type)}</h3>
            {method.bank && (
              <p>
                <span>{t("Bank")}</span>
                <strong>{method.bank}</strong>
              </p>
            )}
            {method.holder && (
              <p>
                <span>{t("Account name")}</span>
                <strong>{method.holder}</strong>
              </p>
            )}
            {method.number && (
              <p>
                <span>{t(method.bank ? "Account number" : "Mobile money number")}</span>
                <strong>{method.number}</strong>
              </p>
            )}
            {method.notes && <p>{method.notes}</p>}
          </article>
        ))}
      </div>
      {reference && <p className="payment-info__reference">{t(reference)}</p>}
    </section>
  );
}
