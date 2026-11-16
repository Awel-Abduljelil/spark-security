import { useLocation } from "react-router-dom";
import "./EffectGlitch.css";

export function EffectGlitch({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  return (
    <div key={pathname} className="page-transition">
      {children}
    </div>
  );
}
