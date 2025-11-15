import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getServices } from "../../services";
import { register as registerAction } from "../../store/slices/authSlice";

/**
 * PUBLIC_INTERFACE
 * Register form page. Validates name, email, password and confirm-password.
 * On success, dispatches auth/register and redirects.
 */
function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { authService } = getServices();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const from = location.state?.from || "/dashboard";

  const validate = () => {
    const errs = [];
    if (!name || name.trim().length < 2) {
      errs.push("Please enter your name (at least 2 characters).");
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRe.test(email)) {
      errs.push("Please enter a valid email address.");
    }
    if (!password || password.length < 6) {
      errs.push("Password must be at least 6 characters.");
    }
    if (password !== confirm) {
      errs.push("Passwords do not match.");
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
      const user = await authService.register({ name, email, password, role: "user" });
      dispatch(registerAction(user));
      navigate(from, { replace: true });
    } catch (err) {
      setFormError("Unable to register. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ padding: 24, display: "grid", justifyItems: "center" }}>
      <section
        aria-labelledby="register-title"
        style={{
          width: "100%",
          maxWidth: 480,
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius)",
          padding: 18,
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <h1 id="register-title" style={{ marginTop: 0 }}>
          Create your BrainBoost account
        </h1>
        <p className="card-desc" style={{ marginTop: 4 }}>
          Sign up to access courses, schedules, and personalized insights.
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
            <label htmlFor="name" style={{ fontWeight: 600 }}>
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              autoComplete="new-password"
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

          <div style={{ display: "grid", gap: 6 }}>
            <label htmlFor="confirm" style={{ fontWeight: 600 }}>
              Confirm Password
            </label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
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
            {submitting ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div style={{ marginTop: 12 }}>
          <span className="card-desc">Already have an account? </span>
          <Link className="App-link" to="/auth/login" state={{ from }}>
            Log in
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Register;
