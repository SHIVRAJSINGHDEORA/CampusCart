import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import api from "../lib/api";
import { useCart } from "../context/CartContext";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  // Fetch categories once
  useEffect(() => {
    api
      .get("/products/categories")
      .then((res) => setCategories(res.data.categories))
      .catch(() => {});
  }, []);

  // Fetch products when search or category changes
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (category) params.append("category", category);

    api
      .get(`/products?${params}`)
      .then((res) => setProducts(res.data.products))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [search, category]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Page Title */}
        <h1
          style={{
            color: "white",
            fontWeight: 800,
            fontSize: 28,
            marginBottom: 24,
          }}
        >
          All Products
        </h1>

        {/* Search + Filter Bar */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 32,
            flexWrap: "wrap",
          }}
        >
          {/* Search */}
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "rgba(255,255,255,0.35)",
              }}
            />
            <input
              className="glass-input"
              style={{ paddingLeft: 36 }}
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Category filter */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "white",
              borderRadius: 10,
              padding: "10px 14px",
              fontSize: 14,
              outline: "none",
              minWidth: 160,
              cursor: "pointer",
            }}
          >
            <option value="" style={{ background: "#111" }}>
              All Categories
            </option>
            {categories.map((c) => (
              <option key={c} value={c} style={{ background: "#111" }}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Products Grid */}
        {loading ? (
          <p
            style={{
              color: "rgba(255,255,255,0.4)",
              textAlign: "center",
              padding: 60,
            }}
          >
            Loading...
          </p>
        ) : products.length === 0 ? (
          <p
            style={{
              color: "rgba(255,255,255,0.3)",
              textAlign: "center",
              padding: 60,
            }}
          >
            No products found.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 16,
            }}
          >
            {products.map((p) => (
              <div
                key={p.product_id}
                className="glass"
                style={{
                  padding: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {/* Category */}
                <span
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.55)",
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "3px 10px",
                    borderRadius: 20,
                    alignSelf: "flex-start",
                    textTransform: "uppercase",
                  }}
                >
                  {p.category}
                </span>

                {/* Name */}
                <h3
                  style={{
                    color: "white",
                    fontWeight: 700,
                    fontSize: 15,
                    margin: 0,
                  }}
                >
                  {p.product_name}
                </h3>

                {/* Price + Stock */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                  }}
                >
                  <span
                    style={{ color: "white", fontWeight: 800, fontSize: 20 }}
                  >
                    ₹{p.price}
                  </span>
                  <span
                    style={{
                      color:
                        p.stock_quantity > 0
                          ? "rgba(134,239,172,0.8)"
                          : "rgba(252,165,165,0.8)",
                      fontSize: 12,
                    }}
                  >
                    {p.stock_quantity > 0
                      ? `${p.stock_quantity} in stock`
                      : "Out of stock"}
                  </span>
                </div>

                {/* Add to Cart */}
                <button
                  className="btn-primary"
                  style={{ width: "100%", padding: "9px 0", fontSize: 13 }}
                  onClick={() => addToCart(p)}
                  disabled={p.stock_quantity === 0}
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
