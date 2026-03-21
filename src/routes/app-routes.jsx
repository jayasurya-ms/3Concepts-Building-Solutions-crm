import Login from "@/app/auth/login";
import NotFound from "@/app/errors/not-found";
import Settings from "@/app/setting/setting";
import Maintenance from "@/components/common/maintenance";
import ErrorBoundary from "@/components/error-boundry/error-boundry";
import ForgotPassword from "@/components/forgot-password/forgot-password";
import LoadingBar from "@/components/loader/loading-bar";
import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import AuthRoute from "./auth-route";
import ProtectedRoute from "./protected-route";
import NotificationList from "@/app/notification/notification-list";
import EmployeeList from "@/app/employee/employee-list";
import CreateEmployee from "@/app/employee/create-employee";
import EditEmployee from "@/app/employee/edit-employee";
import Dashboard from "@/app/dashboard/dashboard";

function AppRoutes() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<AuthRoute />}>
          <Route path="/" element={<Login />} />
          <Route
            path="/forgot-password"
            element={
              <Suspense fallback={<LoadingBar />}>
                <ForgotPassword />
              </Suspense>
            }
          />
          <Route path="/maintenance" element={<Maintenance />} />
        </Route>
        <Route path="/" element={<ProtectedRoute />}>
          <Route
            path="/dashboard"
            element={
              <Suspense fallback={<LoadingBar />}>
                <Dashboard />
              </Suspense>
            }
          />
          <Route
            path="/settings"
            element={
              <Suspense fallback={<LoadingBar />}>
                <Settings />
              </Suspense>
            }
          />
          <Route
            path="/notification"
            element={
              <Suspense fallback={<LoadingBar />}>
                <NotificationList />
              </Suspense>
            }
          />
          <Route
            path="/employee"
            element={
              <Suspense fallback={<LoadingBar />}>
                <EmployeeList />
              </Suspense>
            }
          />
          <Route
            path="/create-employee"
            element={
              <Suspense fallback={<LoadingBar />}>
                <CreateEmployee />
              </Suspense>
            }
          />
          <Route
            path="/edit-employee/:id"
            element={
              <Suspense fallback={<LoadingBar />}>
                <EditEmployee />
              </Suspense>
            }
          />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default AppRoutes;
