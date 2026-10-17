import React from "react";
import { Trash2, Plus, Minus } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import toast from "react-hot-toast";

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, clearCart, cartTotal } =
    useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (!user) {
      toast.error("Please login to checkout");
      navigate("/login");
      return;
    }
    if (cart.length === 0) return toast.error("Your cart is empty");

    const items = cart.map((i) => ({
      product_id: i.product_id,
      quantity: i.quantity,
    }));

    try {
      await api.post("/orders", { items });
      clearCart();
      toast.success("Order placed successfully!");
      navigate("/orders");
    } catch (err) {
      toast.error(err.response?.data?.message || "Order failed");
    }
  };

  if (cart.length === 0)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0a0a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 18 }}>
            Your cart is empty
          </p>
          <button
            className="btn-primary"
            style={{ marginTop: 16 }}
            onClick={() => navigate("/products")}
          >
            Browse Products
          </button>
        </div>
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <h1
          style={{
            color: "white",
            fontWeight: 800,
            fontSize: 28,
            marginBottom: 24,
          }}
        >
          Your Cart
        </h1>

        {/* Cart Items */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            marginBottom: 24,
          }}
        >
          {cart.map((item) => (
            <div
              key={item.product_id}
              className="glass"
              style={{
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              {/* Product Info */}
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    color: "white",
                    fontWeight: 700,
                    fontSize: 15,
                    margin: 0,
                  }}
                >
                  {item.product_name}
                </p>
                <p
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    fontSize: 13,
                    margin: "4px 0 0",
                  }}
                >
                  {item.category}
                </p>
              </div>

              {/* Quantity Controls */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  className="btn-ghost"
                  style={{ padding: "4px 10px", fontSize: 16 }}
                  onClick={() =>
                    updateQuantity(item.product_id, item.quantity - 1)
                  }
                >
                  <Minus size={14} />
                </button>
                <span
                  style={{
                    color: "white",
                    fontWeight: 700,
                    fontSize: 15,
                    minWidth: 24,
                    textAlign: "center",
                  }}
                >
                  {item.quantity}
                </span>
                <button
                  className="btn-ghost"
                  style={{ padding: "4px 10px", fontSize: 16 }}
                  onClick={() =>
                    updateQuantity(item.product_id, item.quantity + 1)
                  }
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Price */}
              <span
                style={{
                  color: "white",
                  fontWeight: 800,
                  fontSize: 16,
                  minWidth: 70,
                  textAlign: "right",
                }}
              >
                ₹{(item.price * item.quantity).toFixed(2)}
              </span>

              {/* Remove */}
              <button
                className="btn-danger"
                style={{ padding: "6px 10px" }}
                onClick={() => removeFromCart(item.product_id)}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="glass" style={{ padding: 24 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 16 }}>
              Total
            </span>
            <span style={{ color: "white", fontWeight: 800, fontSize: 24 }}>
              ₹{cartTotal.toFixed(2)}
            </span>
          </div>
          <button
            className="btn-primary"
            style={{ width: "100%", padding: "13px 0", fontSize: 15 }}
            onClick={handleCheckout}
          >
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
}
