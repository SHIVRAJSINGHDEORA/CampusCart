import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Menu, X, LogOut, Shield } from "lucide-react";
import { useAuth } from "./context/AuthContext";
import { useCart } from "./context/CartContext";
import toast from "react-hot-toast";

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false); // mobile menu

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out!");
    navigate("/login");
  };

  return (
    <nav
      style={{
        background: "rgba(10,10,10,0.8)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 60,
          }}
        >
          {/* Logo */}
          <Link
            to="/"
            style={{
              color: "white",
              fontWeight: 800,
              fontSize: 20,
              textDecoration: "none",
              letterSpacing: "-0.5px",
            }}
          >
            Campus<span style={{ color: "rgba(255,255,255,0.4)" }}>Cart</span>
          </Link>

          {/* Desktop Links */}
          <div
            style={{ display: "flex", alignItems: "center", gap: 8 }}
            className="hidden md:flex"
          >
            <NavLink to="/">Home</NavLink>
            <NavLink to="/products">Products</NavLink>
            {user && <NavLink to="/orders">Orders</NavLink>}
            {isAdmin && (
              <Link
                to="/admin"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  color: "black",
                  background: "white",
                  padding: "6px 14px",
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 13,
                  textDecoration: "none",
                }}
              >
                <Shield size={14} /> Admin
              </Link>
            )}
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Cart */}
            <Link
              to="/cart"
              style={{
                position: "relative",
                color: "white",
                textDecoration: "none",
              }}
            >
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -8,
                    right: -8,
                    background: "white",
                    color: "black",
                    borderRadius: "50%",
                    width: 18,
                    height: 18,
                    fontSize: 10,
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
                  Hi, {user.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="btn-ghost"
                  style={{
                    padding: "6px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <LogOut size={14} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn-ghost"
                  style={{
                    padding: "6px 14px",
                    textDecoration: "none",
                    fontSize: 13,
                  }}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="btn-primary"
                  style={{
                    padding: "6px 14px",
                    textDecoration: "none",
                    fontSize: 13,
                  }}
                >
                  Sign Up
                </Link>
              </>
            )}

            {/* Mobile toggle */}
            <button
              onClick={() => setOpen(!open)}
              style={{
                color: "white",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
              className="md:hidden"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.08)",
              paddingBottom: 12,
            }}
            className="md:hidden"
          >
            <NavLink to="/" onClick={() => setOpen(false)}>
              Home
            </NavLink>
            <NavLink to="/products" onClick={() => setOpen(false)}>
              Products
            </NavLink>
            {user && (
              <NavLink to="/orders" onClick={() => setOpen(false)}>
                Orders
              </NavLink>
            )}
            {isAdmin && (
              <NavLink to="/admin" onClick={() => setOpen(false)}>
                Admin
              </NavLink>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

function NavLink({ to, children, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      style={{
        color: "rgba(255,255,255,0.7)",
        textDecoration: "none",
        padding: "6px 12px",
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 500,
        display: "block",
        transition: "color 0.2s",
      }}
      onMouseEnter={(e) => (e.target.style.color = "white")}
      onMouseLeave={(e) => (e.target.style.color = "rgba(255,255,255,0.7)")}
    >
      {children}
    </Link>
  );
}
