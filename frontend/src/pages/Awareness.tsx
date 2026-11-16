import { AcademyBridge } from "../components/awareness/AcademyBridge";
import { AwarenessHeader } from "../components/awareness/AwarenessHeader";
import { Checklist } from "../components/awareness/Checklist";
import { Myths } from "../components/awareness/Myths";
import { Recovery } from "../components/awareness/Recovery";
import { RedFlags } from "../components/awareness/RedFlags";
import { ThreatList } from "../components/awareness/ThreatList";
import "../components/awareness/awareness.css";
import { checklist, faqs, myths, redFlags, recoverySteps, threats } from "../data/awareness";
import { EthicsNote } from "../components/home/EthicsNote";
import { Faq } from "../components/home/Faq";

export function Awareness() {
  return (
    <main className="awareness-page">
      <AwarenessHeader />
      <ThreatList threats={threats} />
      <Checklist items={checklist} />
      <RedFlags items={redFlags} />
      <Recovery steps={recoverySteps} />
      <Myths items={myths} />
      <AcademyBridge />
      <EthicsNote />
      <Faq items={faqs} />
    </main>
  );
}
