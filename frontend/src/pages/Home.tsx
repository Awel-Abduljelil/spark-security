import { AwarenessTeaser } from "../components/home/AwarenessTeaser";
import { CourseCatalog } from "../components/home/CourseCatalog";
import { EthicsNote } from "../components/home/EthicsNote";
import { Faq } from "../components/home/Faq";
import { Features } from "../components/home/Features";
import { FinalCta } from "../components/home/FinalCta";
import { Hero } from "../components/home/Hero";
import { HowItWorks } from "../components/home/HowItWorks";
import { Mission } from "../components/home/Mission";
import { Reveal } from "../components/ui/Reveal";
import { useAppSite } from "../hooks/useAppSite";

export function Home() {
  const { data: site, status: siteStatus } = useAppSite();

  return (
    <main>
      <Hero />
      <Reveal><Features /></Reveal>
      <Reveal><Mission /></Reveal>
      <Reveal>
        <CourseCatalog />
      </Reveal>
      <Reveal><HowItWorks /></Reveal>
      <Reveal><AwarenessTeaser /></Reveal>
      <Reveal><EthicsNote /></Reveal>
      <Reveal>
        <Faq
          items={site?.faqs.map(({ question, answer }) => ({ q: question, a: answer }))}
          loadError={siteStatus === "error"}
        />
      </Reveal>
      <Reveal><FinalCta /></Reveal>
    </main>
  );
}
