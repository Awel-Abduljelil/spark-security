import { Link } from "react-router-dom";
import sparkLogo from "../../assets/spark-security-logo.webp";
import { useLanguage } from "../../i18n/useLanguage";
import "./Footer.css";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <Link className="brand" to="/" aria-label={`${t("Spark Security")} ${t("Home")}`}>
          <img className="brand__logo" src={sparkLogo} alt="" width="600" height="260" />
        </Link>
        <p className="site-footer__tagline">{t("Learn • Secure • Innovate")}</p>
        <nav aria-label={t("Footer navigation")}>
          <Link to="/#courses">{t("Courses")}</Link>
          <Link to="/mentors">{t("Mentors")}</Link>
          <Link to="/about">{t("About")}</Link>
          <Link to="/awareness">{t("Awareness")}</Link>
          <Link to="/contact">{t("Contact")}</Link>
          <Link to="/enroll">{t("Enroll")}</Link>
        </nav>
        <small>
          © {new Date().getFullYear()} {t("Spark Security")}. {t("All rights reserved.")}
        </small>
      </div>
    </footer>
  );
}
