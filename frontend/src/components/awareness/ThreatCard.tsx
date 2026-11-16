import type { Threat } from "../../types/awareness";
import { useLanguage } from "../../i18n/useLanguage";

interface ThreatCardProps {
  threat: Threat;
  onViewDetails: (threat: Threat) => void;
}

export function ThreatCard({ threat, onViewDetails }: ThreatCardProps) {
  const { t } = useLanguage();

  return (
    <article className="awareness-threat card">
      <button
        className="awareness-threat__toggle"
        type="button"
        aria-haspopup="dialog"
        onClick={() => onViewDetails(threat)}
      >
        <span>
          <span className="awareness-threat__title">{t(threat.title)}</span>
          <span className="awareness-threat__summary">{t(threat.summary)}</span>
        </span>
        <span className="awareness-threat__prompt">{t("View details")}</span>
      </button>
    </article>
  );
}
