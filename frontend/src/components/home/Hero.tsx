import { Link } from "react-router-dom";
import hackerHero from "../../assets/hacker-hero.webp";
import { useLanguage } from "../../i18n/useLanguage";
import { DotNetworks } from "../bg/DotNetworks";
import "./Hero.css";

export function Hero() {
  const { t } = useLanguage();

  return (
    <DotNetworks>
      <section className="hero-section" aria-labelledby="hero-title">
        <div className="hero-section__inner">
          <div className="hero-copy">
            <p className="hero-eyebrow">
              <span aria-hidden="true">●</span> {t("Learn • Secure • Innovate")}
            </p>
            <h1 id="hero-title">
              {t("Welcome to")}
              <br />
              <span>Spark Security</span>
            </h1>
            <p className="hero-copy__intro">
              {t("A growing cybersecurity community, built for what comes next. Learn through practical courses, expert mentorship, and responsible hands-on practice.")}
            </p>

            <div className="hero-actions">
              <Link className="hero-action-button" to="/enroll">
                {t("Explore Courses")} <span aria-hidden="true">→</span>
              </Link>
              <Link
                className="hero-action-button hero-action-button--outline"
                to="/about"
              >
                {t("Discover Our Mission")}
              </Link>
            </div>
          </div>

          <div
            className="hero-visual"
            role="img"
            aria-label={t("A hooded hacker using a laptop in a green digital room")}
          >
            <img
              className="hero-visual__art"
              src={hackerHero}
              alt=""
              width="500"
              height="280"
              decoding="async"
              fetchPriority="high"
            />
          </div>
        </div>
      </section>
    </DotNetworks>
  );
}
