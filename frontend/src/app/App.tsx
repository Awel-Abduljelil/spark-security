import { lazy, Suspense } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import "../styles/main.css";
import "../styles/motion.css";
import { Home } from "../pages/Home";
import { Awareness } from "../pages/Awareness";
import { CourseDetail } from "../pages/CourseDetail";
import { Enroll } from "../pages/Enroll";
import { About } from "../pages/About";
import { Mentors } from "../pages/Mentors";
import { Contact } from "../pages/Contact";
import { NavBar } from "../components/layout/NavBar";
import { ScrollToHash } from "../components/layout/ScrollToHash";
import { Footer } from "../components/layout/Footer";
import { EffectGlitch } from "../components/layout/EffectGlitch";
import { LanguageProvider } from "../i18n/LanguageContext";
import { ADMIN_PATH, adminUrl } from "../lib/adminPath";

const AdminGuard = lazy(() =>
  import("../components/admin/AdminGuard").then((module) => ({
    default: module.AdminGuard,
  })),
);
const AdminLayout = lazy(() =>
  import("../pages/admin/AdminLayout").then((module) => ({
    default: module.AdminLayout,
  })),
);
const AdminLogin = lazy(() =>
  import("../pages/admin/AdminLogin").then((module) => ({
    default: module.AdminLogin,
  })),
);
const AdminEnrollments = lazy(() =>
  import("../pages/admin/AdminEnrollments").then((module) => ({
    default: module.AdminEnrollments,
  })),
);
const AdminCohorts = lazy(() =>
  import("../pages/admin/AdminCohorts").then((module) => ({
    default: module.AdminCohorts,
  })),
);
const AdminCourses = lazy(() =>
  import("../pages/admin/AdminCourses").then((module) => ({
    default: module.AdminCourses,
  })),
);
const AdminCourseEditor = lazy(() =>
  import("../pages/admin/AdminCourseEditor").then((module) => ({
    default: module.AdminCourseEditor,
  })),
);
const AdminManagement = lazy(() =>
  import("../pages/admin/AdminManagement").then((module) => ({
    default: module.AdminManagement,
  })),
);

function AppRoutes() {
  const { pathname } = useLocation();
  if (pathname === ADMIN_PATH || pathname.startsWith(`${ADMIN_PATH}/`)) {
    return (
      <Routes>
        <Route
          path={adminUrl("/login")}
          element={
            <Suspense fallback={<p>Loading admin...</p>}>
              <AdminLayout>
                <AdminLogin />
              </AdminLayout>
            </Suspense>
          }
        />
        <Route
          path={adminUrl("/courses/new")}
          element={
            <Suspense fallback={<p>Loading admin...</p>}>
              <AdminGuard>
                <AdminLayout>
                  <AdminCourseEditor isNew />
                </AdminLayout>
              </AdminGuard>
            </Suspense>
          }
        />
        <Route
          path={adminUrl("/courses/:slug")}
          element={
            <Suspense fallback={<p>Loading admin...</p>}>
              <AdminGuard>
                <AdminLayout>
                  <AdminCourseEditor />
                </AdminLayout>
              </AdminGuard>
            </Suspense>
          }
        />
        <Route
          path={adminUrl("/courses")}
          element={
            <Suspense fallback={<p>Loading admin...</p>}>
              <AdminGuard>
                <AdminLayout>
                  <AdminCourses />
                </AdminLayout>
              </AdminGuard>
            </Suspense>
          }
        />
        <Route
          path={adminUrl("/cohorts")}
          element={
            <Suspense fallback={<p>Loading admin...</p>}>
              <AdminGuard>
                <AdminLayout>
                  <AdminCohorts />
                </AdminLayout>
              </AdminGuard>
            </Suspense>
          }
        />
        <Route path={adminUrl("/settings")} element={<Navigate to={adminUrl("/settings/website")} replace />} />
        <Route
          path={adminUrl("/settings/:section")}
          element={
            <Suspense fallback={<p>Loading admin...</p>}>
              <AdminGuard>
                <AdminLayout>
                  <AdminManagement />
                </AdminLayout>
              </AdminGuard>
            </Suspense>
          }
        />
        <Route
          path={adminUrl()}
          element={
            <Suspense fallback={<p>Loading admin...</p>}>
              <AdminGuard>
                <AdminLayout>
                  <AdminEnrollments />
                </AdminLayout>
              </AdminGuard>
            </Suspense>
          }
        />
        <Route path={adminUrl("/*")} element={<Navigate to={adminUrl()} replace />} />
      </Routes>
    );
  }

  return (
    <>
      <ScrollToHash />
      <NavBar />
      <EffectGlitch>
        <Routes>
          <Route path="/admin/*" element={<Navigate to="/" replace />} />
          <Route path="/" element={<Home />} />
          <Route path="/awareness" element={<Awareness />} />
          <Route path="/courses/:slug" element={<CourseDetail />} />
          <Route path="/enroll" element={<Enroll />} />
          <Route path="/about" element={<About />} />
          <Route path="/mentors" element={<Mentors />} />
          <Route path="/mentor" element={<Navigate to="/mentors" replace />} />
          <Route path="/legacy-admin/*" element={<Navigate to={adminUrl("/settings/website")} replace />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </EffectGlitch>
      <Footer />
    </>
  );
}

export function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </LanguageProvider>
  );
}
