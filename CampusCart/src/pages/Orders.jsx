import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

export default function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    api
      .get("/orders")
      .then((res) => setOrders(res.data.orders))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading)
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
        <p style={{ color: "rgba(255,255,255,0.4)" }}>Loading orders...</p>
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
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <h1
          style={{
            color: "white",
            fontWeight: 800,
            fontSize: 28,
            marginBottom: 24,
          }}
        >
          My Orders
        </h1>

        {orders.length === 0 ? (
          <div className="glass" style={{ padding: 40, textAlign: "center" }}>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 16 }}>
              You haven't placed any orders yet.
            </p>
            <button
              className="btn-primary"
              style={{ marginTop: 16 }}
              onClick={() => navigate("/products")}
            >
              Shop Now
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {orders.map((order) => (
              <div
                key={order.order_id}
                className="glass"
                style={{ padding: 24 }}
              >
                {/* Order Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <p
                      style={{
                        color: "white",
                        fontWeight: 700,
                        fontSize: 16,
                        margin: 0,
                      }}
                    >
                      Order #{order.order_id}
                    </p>
                    <p
                      style={{
                        color: "rgba(255,255,255,0.4)",
                        fontSize: 13,
                        margin: "4px 0 0",
                      }}
                    >
                      {new Date(order.order_date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span
                    style={{ color: "white", fontWeight: 800, fontSize: 20 }}
                  >
                    ₹{order.total_amount}
                  </span>
                </div>

                {/* Order Items */}
                <div
                  style={{
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                    paddingTop: 14,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {order.items?.map((item) => (
                    <div
                      key={item.order_item_id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <span
                          style={{
                            color: "rgba(255,255,255,0.85)",
                            fontSize: 14,
                            fontWeight: 500,
                          }}
                        >
                          {item.product_name}
                        </span>
                        <span
                          style={{
                            color: "rgba(255,255,255,0.35)",
                            fontSize: 12,
                            marginLeft: 8,
                          }}
                        >
                          ×{item.quantity}
                        </span>
                      </div>
                      <span
                        style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}
                      >
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
