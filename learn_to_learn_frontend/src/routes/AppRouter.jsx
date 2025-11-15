import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";
import Home from "../pages/Home";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import Logout from "../pages/Auth/Logout";
import Dashboard from "../views/Dashboard";
import AdminDashboard from "../views/AdminDashboard";
import Courses from "../views/Courses";
import Schedule from "../views/Schedule";
import Analytics from "../views/Analytics";
import NotFound from "../views/NotFound";

// Newly added user pages
import Catalog from "../views/user/Catalog";
import CourseDetails from "../views/user/CourseDetails";
import Enrollments from "../views/user/Enrollments";
import Progress from "../views/user/Progress";
import Settings from "../views/user/Settings";

// Admin section pages
import AdminLayout from "../views/admin/AdminLayout";
import AdminCourses from "../views/admin/AdminCourses";
import AdminUsers from "../views/admin/AdminUsers";
import AdminCategories from "../views/admin/AdminCategories";

/**
 * AppRouter declares the application's route tree.
 * It composes ProtectedRoute and RoleRoute for auth and role gating.
 */
const AppRouter = () => {
  return (
    <Routes>
      {/* Public pages */}
      <Route index element={<Home />} />
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/register" element={<Register />} />
      <Route path="/auth/logout" element={<Logout />} />

      {/* Protected pages */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses"
        element={
          <ProtectedRoute>
            <Courses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/catalog"
        element={
          <ProtectedRoute>
            <Catalog />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/:courseId"
        element={
          <ProtectedRoute>
            <CourseDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/enrollments"
        element={
          <ProtectedRoute>
            <Enrollments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/progress"
        element={
          <ProtectedRoute>
            <Progress />
          </ProtectedRoute>
        }
      />
      <Route
        path="/schedule"
        element={
          <ProtectedRoute>
            <Schedule />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        }
      />

      {/* Admin routes with role guard and nested layout */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="courses" element={<AdminCourses />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="categories" element={<AdminCategories />} />
      </Route>

      {/* Not found */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

export default AppRouter;
