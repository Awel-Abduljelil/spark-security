import type { ChangeEvent } from "react";
import { useLanguage } from "../../i18n/useLanguage";
import "./ReceiptField.css";

export type ReceiptMethod = "upload" | "link";

interface ReceiptFieldProps {
  method: ReceiptMethod;
  file: File | null;
  link: string;
  error: string;
  onMethodChange: (method: ReceiptMethod) => void;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onLinkChange: (value: string) => void;
}

export function ReceiptField({
  method,
  file,
  link,
  error,
  onMethodChange,
  onFileChange,
  onLinkChange,
}: ReceiptFieldProps) {
  const { t } = useLanguage();

  return (
    <fieldset className="receipt-field">
      <legend>{t("Payment receipt")} <span aria-hidden="true">*</span></legend>
      <div className="receipt-field__toggle" aria-label={t("Choose receipt type")}>
        <button
          className={method === "upload" ? "" : "invert"}
          type="button"
          aria-pressed={method === "upload"}
          onClick={() => onMethodChange("upload")}
        >
          {t("Upload file")}
        </button>
        <button
          className={method === "link" ? "" : "invert"}
          type="button"
          aria-pressed={method === "link"}
          onClick={() => onMethodChange("link")}
        >
          {t("Paste link")}
        </button>
      </div>
      {method === "upload" ? (
        <div>
          <label htmlFor="receipt-file">{t("Receipt file (image or PDF, up to 5 MB)")}</label>
          <input
            id="receipt-file"
            name="receiptFile"
            type="file"
            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp,.pdf,application/pdf"
            required
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "receipt-error" : "receipt-help"}
            onChange={onFileChange}
          />
          <small id="receipt-help">{t("Accepted formats: image or PDF. Maximum size: 5 MB.")}</small>
          {file && <small className="receipt-field__filename">{file.name}</small>}
          {error && (
            <small className="form-error" id="receipt-error" role="alert">
              {t(error)}
            </small>
          )}
        </div>
      ) : (
        <div>
          <label htmlFor="receipt-link">{t("Receipt link")}</label>
          <input
            id="receipt-link"
            name="receiptLink"
            type="url"
            placeholder="https://..."
            value={link}
            required
            onChange={(event) => onLinkChange(event.currentTarget.value)}
          />
          <small>{t("Make sure the receipt link can be viewed by our team.")}</small>
        </div>
      )}
    </fieldset>
  );
}
