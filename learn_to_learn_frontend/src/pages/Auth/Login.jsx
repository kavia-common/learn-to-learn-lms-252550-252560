import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getServices } from "../../services";
import { login as loginAction } from "../../store/slices/authSlice";

/**
 * PUBLIC_INTERFACE
 * Login form page. Validates email and password, displays errors, integrates with Redux.
 * Uses services.authService.login to simulate auth then dispatches auth/login.
 */
function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { authService } = getServices();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const from = location.state?.from || "/dashboard";

  const validate = () => {
    const errs = [];
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRe.test(email)) {
      errs.push("Please enter a valid email address.");
    }
    if (!password || password.length < 6) {
      errs.push("Password must be at least 6 characters.");
    }
    return errs;
  };

  async function onSubmit(e) {
    e.preventDefault();
    setFormError("");

    const errs = validate();
    if (errs.length > 0) {
      setFormError(errs.join(" "));
      return;
    }

    setSubmitting(true);
    try {
      // In prototype mode, the service will echo a user; we pass name from email prefix
      const name = email.split("@")[0] || "Learner";
      const user = await authService.login({ email, password, name, role: "user" });
      dispatch(loginAction(user));
      navigate(from, { replace: true });
    } catch (err) {
      setFormError("Unable to log in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ padding: 24, display: "grid", justifyItems: "center" }}>
      <section
        aria-labelledby="login-title"
        style={{
          width: "100%",
          maxWidth: 420,
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius)",
          padding: 18,
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <h1 id="login-title" style={{ marginTop: 0 }}>
          Log in to BrainBoost
        </h1>
        <p className="card-desc" style={{ marginTop: 4 }}>
          Welcome back! Enter your credentials to continue.
        </p>

        {formError ? (
          <div
            role="alert"
            aria-live="assertive"
            style={{
              marginTop: 12,
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.35)",
              color: "var(--text-primary)",
              padding: 12,
              borderRadius: 10,
            }}
          >
            {formError}
          </div>
        ) : null}

        <form onSubmit={onSubmit} noValidate style={{ display: "grid", gap: 12, marginTop: 16 }}>
          <div style={{ display: "grid", gap: 6 }}>
            <label htmlFor="email" style={{ fontWeight: 600 }}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-required="true"
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid var(--border-color)",
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <label htmlFor="password" style={{ fontWeight: 600 }}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-required="true"
              minLength={6}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid var(--border-color)",
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            aria-busy={submitting ? "true" : "false"}
          >
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div style={{ marginTop: 12 }}>
          <span className="card-desc">Don&apos;t have an account? </span>
          <Link className="App-link" to="/auth/register" state={{ from }}>
            Create one
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Login;
