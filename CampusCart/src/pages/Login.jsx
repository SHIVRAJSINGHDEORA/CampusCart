import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error("All fields required");

    try {
      setLoading(true);
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a",
      }}
    >
      <div
        className="glass"
        style={{ width: "100%", maxWidth: 380, padding: 32 }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h1
            style={{ fontSize: 24, fontWeight: 800, color: "white", margin: 0 }}
          >
            Welcome Back
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: 14,
              marginTop: 6,
            }}
          >
            Sign in to your account
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          <div>
            <label
              style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: 13,
                marginBottom: 6,
                display: "block",
              }}
            >
              Email
            </label>
            <input
              className="glass-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label
              style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: 13,
                marginBottom: 6,
                display: "block",
              }}
            >
              Password
            </label>
            <input
              className="glass-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            className="btn-primary"
            type="submit"
            disabled={loading}
            style={{ marginTop: 6, width: "100%" }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: 20,
            fontSize: 13,
            color: "rgba(255,255,255,0.4)",
          }}
        >
          No account?{" "}
          <Link
            to="/signup"
            style={{ color: "white", fontWeight: 700, textDecoration: "none" }}
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
