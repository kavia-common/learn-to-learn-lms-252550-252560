import React from "react";
import { Provider } from "react-redux";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { createAppStore } from "../store";
import ProtectedRoute from "../routes/ProtectedRoute";
import RoleRoute from "../routes/RoleRoute";

// Simple stubs for pages
function LoginPage() {
  return <div>Login Page</div>;
}
function DashboardPage() {
  return <div>Dashboard Page</div>;
}
function AdminPage() {
  return <div>Admin Layout</div>;
}

// Helper to render with store and memory router
function renderWithProviders(ui, { route = "/", preloadedState } = {}) {
  const store = createAppStore(preloadedState);
  window.history.pushState({}, "Test", route);

  return {
    store,
    ...render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>
          {ui}
        </MemoryRouter>
      </Provider>
    ),
  };
}

describe("Routing guards", () => {
  afterEach(() => {
    // Clean up location state
    window.history.pushState({}, "Test", "/");
  });

  it("ProtectedRoute redirects unauthenticated user to /auth/login", async () => {
    renderWithProviders(
      <Routes>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="/auth/login" element={<LoginPage />} />
      </Routes>,
      {
        route: "/dashboard",
        preloadedState: {
          auth: { isAuthenticated: false, user: null, hydrated: true },
        },
      }
    );

    expect(await screen.findByText(/Login Page/i)).toBeInTheDocument();
  });

  it("ProtectedRoute allows authenticated user", async () => {
    renderWithProviders(
      <Routes>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="/auth/login" element={<LoginPage />} />
      </Routes>,
      {
        route: "/dashboard",
        preloadedState: {
          auth: {
            isAuthenticated: true,
            user: { id: "u1", name: "Test User", role: "user" },
            hydrated: true,
          },
        },
      }
    );

    expect(await screen.findByText(/Dashboard Page/i)).toBeInTheDocument();
  });

  it("RoleRoute redirects unauthenticated to /auth/login", async () => {
    renderWithProviders(
      <Routes>
        <Route
          path="/admin"
          element={
            <RoleRoute allowedRoles={["admin"]}>
              <AdminPage />
            </RoleRoute>
          }
        />
        <Route path="/auth/login" element={<LoginPage />} />
      </Routes>,
      {
        route: "/admin",
        preloadedState: {
          auth: { isAuthenticated: false, user: null, hydrated: true },
        },
      }
    );

    expect(await screen.findByText(/Login Page/i)).toBeInTheDocument();
  });

  it("RoleRoute redirects unauthorized role to /dashboard (safe page)", async () => {
    renderWithProviders(
      <Routes>
        <Route
          path="/admin"
          element={
            <RoleRoute allowedRoles={["admin"]}>
              <AdminPage />
            </RoleRoute>
          }
        />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/auth/login" element={<LoginPage />} />
      </Routes>,
      {
        route: "/admin",
        preloadedState: {
          auth: {
            isAuthenticated: true,
            user: { id: "u2", name: "Learner", role: "user" },
            hydrated: true,
          },
        },
      }
    );

    expect(await screen.findByText(/Dashboard Page/i)).toBeInTheDocument();
  });

  it("RoleRoute allows authorized admin user", async () => {
    renderWithProviders(
      <Routes>
        <Route
          path="/admin"
          element={
            <RoleRoute allowedRoles={["admin"]}>
              <AdminPage />
            </RoleRoute>
          }
        />
        <Route path="/auth/login" element={<LoginPage />} />
      </Routes>,
      {
        route: "/admin",
        preloadedState: {
          auth: {
            isAuthenticated: true,
            user: { id: "a1", name: "Admin", role: "admin" },
            hydrated: true,
          },
        },
      }
    );

    expect(await screen.findByText(/Admin Layout/i)).toBeInTheDocument();
  });
});
