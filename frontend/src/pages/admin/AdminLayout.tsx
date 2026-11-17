import { useEffect, type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { adminUrl } from "../../lib/adminPath";
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
        <NavLink to={adminUrl()} end>
          Enrollments
        </NavLink>
        <NavLink to={adminUrl("/cohorts")}>Cohorts</NavLink>
        <NavLink to={adminUrl("/courses")}>Courses</NavLink>
        <NavLink to={adminUrl("/settings")}>Management</NavLink>
      </nav>
      {children}
    </div>
  );
}
