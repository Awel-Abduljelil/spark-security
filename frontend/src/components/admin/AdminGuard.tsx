import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { me } from "../../lib/adminApi";
import { adminUrl } from "../../lib/adminPath";

interface AdminGuardProps {
  children: ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    me()
      .then(() => {
        if (active) setAuthorized(true);
      })
      .catch(() => {
        if (active) setAuthorized(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (authorized === null) {
    return (
      <p className="admin-loading" role="status">
        Checking admin session...
      </p>
    );
  }
  if (!authorized) return <Navigate to={adminUrl("/login")} replace />;
  return children;
}
