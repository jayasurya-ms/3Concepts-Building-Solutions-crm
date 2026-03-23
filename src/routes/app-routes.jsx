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
import SiteList from "@/app/site/site-list";
import TripList from "@/app/trip/trip-list";
import CreateTrip from "@/app/trip/create-trip";
import EditTrip from "@/app/trip/edit-trip";
import KMReadingList from "@/app/km-reading/km-reading-list";
import EmployeeReport from "@/app/report/employee.jsx";
import SiteReport from "@/app/report/site.jsx";
import KMReadingReport from "@/app/report/km-reading.jsx";
import TripReport from "@/app/report/Petrol-Reimbursement.jsx";
import PetrolReimbursementDetail from "@/app/report/Petrol-Reimbursement-Detail.jsx";

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
          <Route
            path="/site"
            element={
              <Suspense fallback={<LoadingBar />}>
                <SiteList />
              </Suspense>
            }
          />
          <Route
            path="/trip"
            element={
              <Suspense fallback={<LoadingBar />}>
                <TripList />
              </Suspense>
            }
          />
          <Route
            path="/create-trip"
            element={
              <Suspense fallback={<LoadingBar />}>
                <CreateTrip />
              </Suspense>
            }
          />
          <Route
            path="/edit-trip/:id"
            element={
              <Suspense fallback={<LoadingBar />}>
                <EditTrip />
              </Suspense>
            }
          />

          <Route
            path="/report/employee"
            element={
              <Suspense fallback={<LoadingBar />}>
                <EmployeeReport />
              </Suspense>
            }
          />
          <Route
            path="/report/site"
            element={
              <Suspense fallback={<LoadingBar />}>
                <SiteReport />
              </Suspense>
            }
          />
          <Route
            path="/report/km-reading"
            element={
              <Suspense fallback={<LoadingBar />}>
                <KMReadingReport />
              </Suspense>
            }
          />
          <Route
            path="/report/petrol_reimbursement"
            element={
              <Suspense fallback={<LoadingBar />}>
                <TripReport />
              </Suspense>
            }
          />

          <Route
            path="/report/petrol_reimbursement/:id"
            element={
              <Suspense fallback={<LoadingBar />}>
                <PetrolReimbursementDetail />
              </Suspense>
            }
          />

          <Route
            path="/km-reading"
            element={
              <Suspense fallback={<LoadingBar />}>
                <KMReadingList />
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
