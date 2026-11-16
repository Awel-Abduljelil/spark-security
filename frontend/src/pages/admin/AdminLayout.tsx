import { useEffect, type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import "./admin.css";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  useEffect(() => {
    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const created = !robots;
    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.append(robots);
    }
    const previousContent = robots.content;
    robots.content = "noindex";

    return () => {
      if (created) robots?.remove();
      else if (robots) robots.content = previousContent;
    };
  }, []);

  return (
    <div className="admin-shell">
      <nav className="admin-nav" aria-label="Admin sections">
        <NavLink to="/admin" end>
          Enrollments
        </NavLink>
        <NavLink to="/admin/cohorts">Cohorts</NavLink>
        <NavLink to="/admin/courses">Courses</NavLink>
        <a href="/legacy-admin/">Additional settings</a>
      </nav>
      {children}
    </div>
  );
}
