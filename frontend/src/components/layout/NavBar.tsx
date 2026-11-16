import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import sparkLogo from "../../assets/spark-security-logo.webp";
import { isLanguage } from "../../i18n/language";
import { useLanguage } from "../../i18n/useLanguage";
import "./NavBar.css";

export function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const languagePickerRef = useRef<HTMLDivElement>(null);
  const languageToggleRef = useRef<HTMLButtonElement>(null);
  const { pathname, hash } = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const viewingCourses = pathname === "/" && hash === "#courses";
  const languageLabels = {
    en: "English",
    om: "Afaan Oromoo",
    am: "አማርኛ",
  } satisfies Record<typeof language, string>;

  const closeMenu = () => {
    setMenuOpen(false);
    setLanguageMenuOpen(false);
  };

  useEffect(() => {
    if (!menuOpen && !languageMenuOpen) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (
        target instanceof Node &&
        !navRef.current?.contains(target) &&
        !toggleRef.current?.contains(target)
      ) {
        closeMenu();
      } else if (
        target instanceof Node &&
        !languagePickerRef.current?.contains(target)
      ) {
        setLanguageMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (languageMenuOpen) {
          setLanguageMenuOpen(false);
          languageToggleRef.current?.focus();
        } else {
          closeMenu();
          toggleRef.current?.focus();
        }
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen, languageMenuOpen]);

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link
          className="brand"
          to="/"
          aria-label={`${t("Spark Security")} ${t("Home")}`}
          onClick={closeMenu}
        >
          <img className="brand__logo" src={sparkLogo} alt="" width="600" height="260" />
        </Link>

        <button
          ref={toggleRef}
          className={`nav-toggle${menuOpen ? " nav-toggle--open" : ""}`}
          type="button"
          aria-label={t(menuOpen ? "Close navigation menu" : "Open navigation menu")}
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          ref={navRef}
          className={`primary-nav${menuOpen ? " primary-nav--open" : ""}`}
          id="primary-navigation"
          aria-label={t("Primary navigation")}
        >
          <Link
            to="/"
            aria-current={pathname === "/" && !viewingCourses ? "page" : undefined}
            onClick={closeMenu}
          >
            {t("Home")}
          </Link>
          <Link
            to="/#courses"
            aria-current={viewingCourses ? "page" : undefined}
            onClick={closeMenu}
          >
            {t("Courses")}
          </Link>
          <NavLink to="/mentors" onClick={closeMenu}>
            {t("Mentorship")}
          </NavLink>
          <NavLink to="/about" onClick={closeMenu}>
            {t("About")}
          </NavLink>
          <NavLink to="/awareness" onClick={closeMenu}>
            {t("Awareness")}
          </NavLink>
          <NavLink to="/contact" onClick={closeMenu}>
            {t("Contact")}
          </NavLink>
          <div className="language-picker" ref={languagePickerRef}>
            <button
              ref={languageToggleRef}
              className="language-picker__toggle"
              type="button"
              aria-label={t("Select language")}
              aria-haspopup="menu"
              aria-expanded={languageMenuOpen}
              aria-controls="language-options"
              onClick={() => setLanguageMenuOpen((open) => !open)}
            >
              <span>{languageLabels[language]}</span>
              <span className="language-picker__chevron" aria-hidden="true" />
            </button>
            {languageMenuOpen && (
              <div
                className="language-picker__options"
                id="language-options"
                role="menu"
                aria-label={t("Select language")}
              >
                {Object.entries(languageLabels).map(([code, label]) => {
                  if (!isLanguage(code)) return null;

                  return (
                    <button
                      key={code}
                      type="button"
                      role="menuitemradio"
                      aria-checked={language === code}
                      onClick={() => {
                        setLanguage(code);
                        setLanguageMenuOpen(false);
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <Link className="nav-cta" to="/enroll" onClick={closeMenu}>
            {t("Enroll")}
            <span className="nav-cta__arrow" aria-hidden="true">
              →
            </span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
