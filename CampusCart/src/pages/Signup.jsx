import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, email, phone, password, confirm } = form;

    if (!username || !email || !password)
      return toast.error("Username, email and password are required");
    if (password.length < 6)
      return toast.error("Password must be at least 6 characters");
    if (password !== confirm) return toast.error("Passwords do not match");

    try {
      setLoading(true);
      await signup(username, email, password, phone);
      toast.success("Account created!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
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
        padding: "20px 0",
      }}
    >
      <div
        className="glass"
        style={{ width: "100%", maxWidth: 380, padding: 32 }}
      >
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h1
            style={{ fontSize: 24, fontWeight: 800, color: "white", margin: 0 }}
          >
            Create Account
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: 14,
              marginTop: 6,
            }}
          >
            Join the marketplace
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          {[
            {
              name: "username",
              label: "Username",
              type: "text",
              placeholder: "johndoe",
            },
            {
              name: "email",
              label: "Email",
              type: "email",
              placeholder: "you@example.com",
            },
            {
              name: "phone",
              label: "Phone (optional)",
              type: "tel",
              placeholder: "+91 9876543210",
            },
            {
              name: "password",
              label: "Password",
              type: "password",
              placeholder: "••••••••",
            },
            {
              name: "confirm",
              label: "Confirm Password",
              type: "password",
              placeholder: "••••••••",
            },
          ].map((field) => (
            <div key={field.name}>
              <label
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 13,
                  marginBottom: 6,
                  display: "block",
                }}
              >
                {field.label}
              </label>
              <input
                className="glass-input"
                name={field.name}
                type={field.type}
                placeholder={field.placeholder}
                value={form[field.name]}
                onChange={handleChange}
              />
            </div>
          ))}

          <button
            className="btn-primary"
            type="submit"
            disabled={loading}
            style={{ marginTop: 6, width: "100%" }}
          >
            {loading ? "Creating..." : "Create Account"}
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
          Already have an account?{" "}
          <Link
            to="/login"
            style={{ color: "white", fontWeight: 700, textDecoration: "none" }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
