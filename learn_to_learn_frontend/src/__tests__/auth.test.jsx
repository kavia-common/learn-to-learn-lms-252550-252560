import React from "react";
import { Provider } from "react-redux";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { createAppStore } from "../store";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import Logout from "../pages/Auth/Logout";
import { loadFromStorage } from "../store/slices/authSlice";

// Mock services to avoid network
jest.mock("../services", () => {
  return {
    getServices: () => ({
      authService: {
        login: jest.fn(async ({ name }) => ({
          id: "u123",
          name: name || "user",
          role: "user",
        })),
        register: jest.fn(async ({ name }) => ({
          id: "u999",
          name: name || "new user",
          role: "user",
        })),
        logout: jest.fn(async () => true),
      },
    }),
  };
});

function renderWithStore(ui, { route = "/", preloadedState } = {}) {
  const store = createAppStore(preloadedState);
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

describe("Auth flows with Redux and localStorage", () => {
  const AUTH_KEY = "bb_auth";
  beforeEach(() => {
    localStorage.clear();
    jest.spyOn(window.localStorage.__proto__, "setItem");
    jest.spyOn(window.localStorage.__proto__, "getItem");
    jest.spyOn(window.localStorage.__proto__, "removeItem");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("Login success dispatches auth, persists to localStorage and redirects", async () => {
    renderWithStore(
      <Routes>
        <Route path="/auth/login" element={<Login />} />
        <Route path="/dashboard" element={<div>Dashboard</div>} />
      </Routes>,
      { route: "/auth/login" }
    );

    // Fill form
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: "secret12" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Sign In/i }));

    // Redirect to dashboard
    expect(await screen.findByText(/Dashboard/i)).toBeInTheDocument();

    // Ensure auth is persisted
    const stored = JSON.parse(localStorage.getItem(AUTH_KEY));
    expect(stored?.isAuthenticated).toBe(true);
    expect(stored?.user?.id).toBe("u123");
  });

  it("Register success dispatches auth and persists to localStorage", async () => {
    renderWithStore(
      <Routes>
        <Route path="/auth/register" element={<Register />} />
        <Route path="/dashboard" element={<div>Dashboard</div>} />
      </Routes>,
      { route: "/auth/register" }
    );

    fireEvent.change(screen.getByLabelText(/^Name$/i), {
      target: { value: "Alice" },
    });
    fireEvent.change(screen.getByLabelText(/^Email$/i), {
      target: { value: "alice@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: "secret12" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "secret12" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Create Account/i }));

    expect(await screen.findByText(/Dashboard/i)).toBeInTheDocument();
    const stored = JSON.parse(localStorage.getItem(AUTH_KEY));
    expect(stored?.isAuthenticated).toBe(true);
    expect(stored?.user?.id).toBe("u999");
  });

  it("Hydrates auth from localStorage via loadFromStorage", async () => {
    localStorage.setItem(
      AUTH_KEY,
      JSON.stringify({
        isAuthenticated: true,
        user: { id: "persisted", name: "Persisted User", role: "user" },
      })
    );

    const { store } = renderWithStore(<div>App</div>, {});
    store.dispatch(loadFromStorage());

    const state = store.getState().auth;
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.id).toBe("persisted");
    expect(state.hydrated).toBe(true);
  });

  it("Logout clears localStorage and resets auth, then navigates to home", async () => {
    // Preload authenticated state
    localStorage.setItem(
      AUTH_KEY,
      JSON.stringify({
        isAuthenticated: true,
        user: { id: "u1", name: "User", role: "user" },
      })
    );

    renderWithStore(
      <Routes>
        <Route path="/" element={<div>Home Page</div>} />
        <Route path="/auth/logout" element={<Logout />} />
      </Routes>,
      { route: "/auth/logout" }
    );

    // Wait for redirect to home
    expect(await screen.findByText(/Home Page/i)).toBeInTheDocument();

    expect(localStorage.getItem(AUTH_KEY)).toBeNull();
  });

  it("Login shows client-side validation error for invalid email/password", async () => {
    renderWithStore(
      <Routes>
        <Route path="/auth/login" element={<Login />} />
      </Routes>,
      { route: "/auth/login" }
    );

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "invalid" },
    });
    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: "123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Sign In/i }));

    expect(
      await screen.findByRole("alert", { name: "" }, { timeout: 1500 })
    ).toHaveTextContent(/valid email/i);
  });
});
