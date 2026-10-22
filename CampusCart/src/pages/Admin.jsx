import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, X, Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import toast from "react-hot-toast";

// ── Tab definitions — each maps to a table ──
const TABS = [
  { key: "products", label: "📦 Products" },
  { key: "users", label: "👤 Users" },
  { key: "orders", label: "🧾 Orders" },
  { key: "orderitems", label: "📋 Order Items" },
];

export default function Admin() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("products");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!isAdmin) {
      toast.error("Admin only!");
      navigate("/");
    }
  }, [user, isAdmin]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 28,
          }}
        >
          <Shield size={22} color="white" />
          <div>
            <h1
              style={{
                color: "white",
                fontWeight: 800,
                fontSize: 26,
                margin: 0,
              }}
            >
              Admin Panel
            </h1>
            <p
              style={{
                color: "rgba(255,255,255,0.35)",
                fontSize: 13,
                margin: 0,
              }}
            >
              Manage all database tables — changes sync directly to MySQL
            </p>
          </div>
        </div>

        {/* Tab Bar */}
        <div
          style={{
            display: "flex",
            gap: 6,
            marginBottom: 28,
            flexWrap: "wrap",
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "9px 20px",
                borderRadius: 10,
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                border: "none",
                transition: "all 0.2s",
                background:
                  activeTab === tab.key ? "white" : "rgba(255,255,255,0.07)",
                color:
                  activeTab === tab.key ? "black" : "rgba(255,255,255,0.6)",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Active Table Panel */}
        {activeTab === "products" && <ProductsTable />}
        {activeTab === "users" && <UsersTable />}
        {activeTab === "orders" && <OrdersTable />}
        {activeTab === "orderitems" && <OrderItemsTable />}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════
//  Reusable helper components
// ════════════════════════════════════════════

// Column header style
const TH = ({ children }) => (
  <th
    style={{
      color: "rgba(255,255,255,0.35)",
      fontSize: 11,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      padding: "14px 16px",
      textAlign: "left",
    }}
  >
    {children}
  </th>
);

// Cell style
const TD = ({ children, bold }) => (
  <td
    style={{
      padding: "13px 16px",
      color: bold ? "white" : "rgba(255,255,255,0.7)",
      fontWeight: bold ? 700 : 400,
      fontSize: 14,
      verticalAlign: "middle",
    }}
  >
    {children}
  </td>
);

// Small id badge
const IdBadge = ({ id }) => (
  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>#{id}</span>
);

// Edit button
const EditBtn = ({ onClick }) => (
  <button
    onClick={onClick}
    style={{
      background: "rgba(255,255,255,0.07)",
      border: "1px solid rgba(255,255,255,0.12)",
      color: "white",
      padding: "6px 13px",
      borderRadius: 8,
      cursor: "pointer",
      fontSize: 13,
      fontWeight: 600,
      display: "flex",
      alignItems: "center",
      gap: 5,
    }}
  >
    <Pencil size={13} /> Edit
  </button>
);

// Delete button
const DelBtn = ({ onClick }) => (
  <button
    onClick={onClick}
    style={{
      background: "rgba(239,68,68,0.12)",
      border: "1px solid rgba(239,68,68,0.25)",
      color: "#fca5a5",
      padding: "6px 13px",
      borderRadius: 8,
      cursor: "pointer",
      fontSize: 13,
      fontWeight: 600,
      display: "flex",
      alignItems: "center",
      gap: 5,
    }}
  >
    <Trash2 size={13} /> Delete
  </button>
);

// Modal wrapper
function Modal({
  title,
  subtitle,
  onClose,
  onSubmit,
  saving,
  submitLabel,
  children,
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          padding: 30,
          position: "relative",
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 16,
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.4)",
            cursor: "pointer",
          }}
        >
          <X size={20} />
        </button>

        <h2
          style={{
            color: "white",
            fontWeight: 800,
            fontSize: 19,
            margin: "0 0 4px",
          }}
        >
          {title}
        </h2>
        <p
          style={{
            color: "rgba(255,255,255,0.35)",
            fontSize: 13,
            margin: "0 0 22px",
          }}
        >
          {subtitle}
        </p>

        <form
          onSubmit={onSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          {children}
          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.18)",
                color: "white",
                padding: "10px 0",
                borderRadius: 10,
                fontWeight: 600,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                flex: 1,
                background: "white",
                color: "black",
                border: "none",
                padding: "10px 0",
                borderRadius: 10,
                fontWeight: 700,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              {saving ? "Saving..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Form field
function Field({ label, children }) {
  return (
    <div>
      <label
        style={{
          color: "rgba(255,255,255,0.5)",
          fontSize: 11,
          display: "block",
          marginBottom: 5,
          textTransform: "uppercase",
          letterSpacing: 0.6,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

// ════════════════════════════════════════════
//  1. PRODUCTS TABLE
// ════════════════════════════════════════════
function ProductsTable() {
  const EMPTY = {
    product_name: "",
    category: "",
    price: "",
    stock_quantity: "",
  };
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get("/products?limit=200")
      .then((r) => setRows(r.data.products))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY);
    setModal(true);
  };
  const openEdit = (p) => {
    setEditing(p);
    setForm({
      product_name: p.product_name,
      category: p.category,
      price: p.price,
      stock_quantity: p.stock_quantity,
    });
    setModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.product_name || !form.category || !form.price)
      return toast.error("Name, category & price required");
    try {
      setSaving(true);
      if (editing) {
        await api.put(`/products/${editing.product_id}`, form);
        toast.success("Product updated in MySQL");
      } else {
        await api.post("/products", form);
        toast.success("Product inserted into MySQL");
      }
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  const del = async (p) => {
    if (!window.confirm(`Delete "${p.product_name}"?`)) return;
    try {
      const r = await api.delete(`/products/${p.product_id}`);
      toast.success(r.data.message);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  return (
    <>
      <TableShell
        title="Products"
        count={rows.length}
        stats={[
          {
            label: "In Stock",
            value: rows.filter((r) => r.stock_quantity > 0).length,
          },
          {
            label: "Out of Stock",
            value: rows.filter((r) => r.stock_quantity === 0).length,
          },
        ]}
        onAdd={openAdd}
        addLabel="Add Product"
      >
        {loading ? (
          <LoadingRow />
        ) : (
          <table
            style={{ width: "100%", borderCollapse: "collapse", minWidth: 650 }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <TH>ID</TH>
                <TH>Product Name</TH>
                <TH>Category</TH>
                <TH>Price (₹)</TH>
                <TH>Stock</TH>
                <TH>Actions</TH>
              </tr>
            </thead>
            <tbody>
              {rows.map((p, i) => (
                <tr
                  key={p.product_id}
                  style={{
                    borderBottom:
                      i < rows.length - 1
                        ? "1px solid rgba(255,255,255,0.04)"
                        : "none",
                  }}
                >
                  <TD>
                    <IdBadge id={p.product_id} />
                  </TD>
                  <TD bold>{p.product_name}</TD>
                  <TD>
                    <CategoryBadge label={p.category} />
                  </TD>
                  <TD bold>₹{parseFloat(p.price).toFixed(2)}</TD>
                  <TD>
                    <StockBadge qty={p.stock_quantity} />
                  </TD>
                  <td style={{ padding: "13px 16px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <EditBtn onClick={() => openEdit(p)} />
                      <DelBtn onClick={() => del(p)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableShell>

      {modal && (
        <Modal
          title={editing ? "✏️ Edit Product" : "➕ Add Product"}
          subtitle={
            editing
              ? `Editing product #${editing.product_id}`
              : "INSERT INTO Products"
          }
          onClose={() => setModal(false)}
          onSubmit={save}
          saving={saving}
          submitLabel={editing ? "Update in MySQL" : "Insert into MySQL"}
        >
          <Field label="Product Name *">
            <input
              className="glass-input"
              placeholder="e.g. Wireless Headphones"
              value={form.product_name}
              onChange={(e) =>
                setForm({ ...form, product_name: e.target.value })
              }
            />
          </Field>
          <Field label="Category *">
            <input
              className="glass-input"
              placeholder="e.g. Electronics"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </Field>
          <div style={{ display: "flex", gap: 12 }}>
            <Field label="Price (₹) *">
              <input
                className="glass-input"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </Field>
            <Field label="Stock Qty">
              <input
                className="glass-input"
                type="number"
                min="0"
                placeholder="0"
                value={form.stock_quantity}
                onChange={(e) =>
                  setForm({ ...form, stock_quantity: e.target.value })
                }
              />
            </Field>
          </div>
        </Modal>
      )}
    </>
  );
}

// ════════════════════════════════════════════
//  2. USERS TABLE
// ════════════════════════════════════════════
function UsersTable() {
  const EMPTY = { username: "", email: "", phone: "", password: "" };
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get("/admin/users")
      .then((r) => setRows(r.data.users))
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY);
    setModal(true);
  };
  const openEdit = (u) => {
    setEditing(u);
    setForm({
      username: u.username,
      email: u.email,
      phone: u.phone || "",
      password: "",
    });
    setModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email)
      return toast.error("Username and email required");
    if (!editing && !form.password)
      return toast.error("Password required for new user");
    try {
      setSaving(true);
      if (editing) {
        await api.put(`/admin/users/${editing.user_id}`, form);
        toast.success("User updated in MySQL");
      } else {
        await api.post("/admin/users", form);
        toast.success("User inserted into MySQL");
      }
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  const del = async (u) => {
    if (!window.confirm(`Delete user "${u.username}"?`)) return;
    try {
      const r = await api.delete(`/admin/users/${u.user_id}`);
      toast.success(r.data.message);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  return (
    <>
      <TableShell
        title="Users"
        count={rows.length}
        stats={[]}
        onAdd={openAdd}
        addLabel="Add User"
      >
        {loading ? (
          <LoadingRow />
        ) : (
          <table
            style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <TH>ID</TH>
                <TH>Username</TH>
                <TH>Email</TH>
                <TH>Phone</TH>
                <TH>Actions</TH>
              </tr>
            </thead>
            <tbody>
              {rows.map((u, i) => (
                <tr
                  key={u.user_id}
                  style={{
                    borderBottom:
                      i < rows.length - 1
                        ? "1px solid rgba(255,255,255,0.04)"
                        : "none",
                  }}
                >
                  <TD>
                    <IdBadge id={u.user_id} />
                  </TD>
                  <TD bold>{u.username}</TD>
                  <TD>{u.email}</TD>
                  <TD>{u.phone || "—"}</TD>
                  <td style={{ padding: "13px 16px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <EditBtn onClick={() => openEdit(u)} />
                      <DelBtn onClick={() => del(u)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableShell>

      {modal && (
        <Modal
          title={editing ? "✏️ Edit User" : "➕ Add User"}
          subtitle={
            editing ? `Editing user #${editing.user_id}` : "INSERT INTO Users"
          }
          onClose={() => setModal(false)}
          onSubmit={save}
          saving={saving}
          submitLabel={editing ? "Update in MySQL" : "Insert into MySQL"}
        >
          <Field label="Username *">
            <input
              className="glass-input"
              placeholder="johndoe"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </Field>
          <Field label="Email *">
            <input
              className="glass-input"
              type="email"
              placeholder="user@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Field>
          <Field label="Phone">
            <input
              className="glass-input"
              placeholder="+91 9876543210"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </Field>
          <Field
            label={
              editing ? "New Password (leave blank to keep old)" : "Password *"
            }
          >
            <input
              className="glass-input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </Field>
        </Modal>
      )}
    </>
  );
}

// ════════════════════════════════════════════
//  3. ORDERS TABLE
// ════════════════════════════════════════════
function OrdersTable() {
  const EMPTY = { user_id: "", total_amount: "" };
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get("/admin/orders")
      .then((r) => setRows(r.data.orders))
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY);
    setModal(true);
  };
  const openEdit = (o) => {
    setEditing(o);
    setForm({ user_id: o.user_id, total_amount: o.total_amount });
    setModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.user_id || !form.total_amount)
      return toast.error("User ID and total required");
    try {
      setSaving(true);
      if (editing) {
        await api.put(`/admin/orders/${editing.order_id}`, form);
        toast.success("Order updated in MySQL");
      } else {
        await api.post("/admin/orders", form);
        toast.success("Order inserted into MySQL");
      }
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  const del = async (o) => {
    if (!window.confirm(`Delete Order #${o.order_id} and all its items?`))
      return;
    try {
      const r = await api.delete(`/admin/orders/${o.order_id}`);
      toast.success(r.data.message);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  return (
    <>
      <TableShell
        title="Orders"
        count={rows.length}
        stats={[]}
        onAdd={openAdd}
        addLabel="Add Order"
      >
        {loading ? (
          <LoadingRow />
        ) : (
          <table
            style={{ width: "100%", borderCollapse: "collapse", minWidth: 650 }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <TH>Order ID</TH>
                <TH>User ID</TH>
                <TH>Username</TH>
                <TH>Date</TH>
                <TH>Total (₹)</TH>
                <TH>Actions</TH>
              </tr>
            </thead>
            <tbody>
              {rows.map((o, i) => (
                <tr
                  key={o.order_id}
                  style={{
                    borderBottom:
                      i < rows.length - 1
                        ? "1px solid rgba(255,255,255,0.04)"
                        : "none",
                  }}
                >
                  <TD>
                    <IdBadge id={o.order_id} />
                  </TD>
                  <TD>{o.user_id}</TD>
                  <TD bold>{o.username}</TD>
                  <TD>{new Date(o.order_date).toLocaleDateString("en-IN")}</TD>
                  <TD bold>₹{parseFloat(o.total_amount).toFixed(2)}</TD>
                  <td style={{ padding: "13px 16px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <EditBtn onClick={() => openEdit(o)} />
                      <DelBtn onClick={() => del(o)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableShell>

      {modal && (
        <Modal
          title={editing ? "✏️ Edit Order" : "➕ Add Order"}
          subtitle={
            editing
              ? `Editing order #${editing.order_id}`
              : "INSERT INTO Orders"
          }
          onClose={() => setModal(false)}
          onSubmit={save}
          saving={saving}
          submitLabel={editing ? "Update in MySQL" : "Insert into MySQL"}
        >
          <Field label="User ID *">
            <input
              className="glass-input"
              type="number"
              placeholder="e.g. 1"
              value={form.user_id}
              onChange={(e) => setForm({ ...form, user_id: e.target.value })}
            />
          </Field>
          <Field label="Total Amount (₹) *">
            <input
              className="glass-input"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={form.total_amount}
              onChange={(e) =>
                setForm({ ...form, total_amount: e.target.value })
              }
            />
          </Field>
        </Modal>
      )}
    </>
  );
}

// ════════════════════════════════════════════
//  4. ORDER ITEMS TABLE
// ════════════════════════════════════════════
function OrderItemsTable() {
  const EMPTY = { order_id: "", product_id: "", quantity: "", price: "" };
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get("/admin/orderitems")
      .then((r) => setRows(r.data.items))
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY);
    setModal(true);
  };
  const openEdit = (item) => {
    setEditing(item);
    setForm({
      order_id: item.order_id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
    });
    setModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.order_id || !form.product_id || !form.quantity || !form.price)
      return toast.error("All fields are required");
    try {
      setSaving(true);
      if (editing) {
        await api.put(`/admin/orderitems/${editing.order_item_id}`, form);
        toast.success("Order item updated in MySQL");
      } else {
        await api.post("/admin/orderitems", form);
        toast.success("Order item inserted into MySQL");
      }
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  const del = async (item) => {
    if (!window.confirm(`Delete order item #${item.order_item_id}?`)) return;
    try {
      const r = await api.delete(`/admin/orderitems/${item.order_item_id}`);
      toast.success(r.data.message);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  return (
    <>
      <TableShell
        title="Order Items"
        count={rows.length}
        stats={[]}
        onAdd={openAdd}
        addLabel="Add Item"
      >
        {loading ? (
          <LoadingRow />
        ) : (
          <table
            style={{ width: "100%", borderCollapse: "collapse", minWidth: 680 }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <TH>Item ID</TH>
                <TH>Order ID</TH>
                <TH>Product</TH>
                <TH>Qty</TH>
                <TH>Price (₹)</TH>
                <TH>Actions</TH>
              </tr>
            </thead>
            <tbody>
              {rows.map((item, i) => (
                <tr
                  key={item.order_item_id}
                  style={{
                    borderBottom:
                      i < rows.length - 1
                        ? "1px solid rgba(255,255,255,0.04)"
                        : "none",
                  }}
                >
                  <TD>
                    <IdBadge id={item.order_item_id} />
                  </TD>
                  <TD>#{item.order_id}</TD>
                  <TD bold>{item.product_name}</TD>
                  <TD>{item.quantity}</TD>
                  <TD bold>₹{parseFloat(item.price).toFixed(2)}</TD>
                  <td style={{ padding: "13px 16px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <EditBtn onClick={() => openEdit(item)} />
                      <DelBtn onClick={() => del(item)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableShell>

      {modal && (
        <Modal
          title={editing ? "✏️ Edit Order Item" : "➕ Add Order Item"}
          subtitle={
            editing
              ? `Editing item #${editing.order_item_id}`
              : "INSERT INTO OrderItems"
          }
          onClose={() => setModal(false)}
          onSubmit={save}
          saving={saving}
          submitLabel={editing ? "Update in MySQL" : "Insert into MySQL"}
        >
          <div style={{ display: "flex", gap: 12 }}>
            <Field label="Order ID *">
              <input
                className="glass-input"
                type="number"
                placeholder="e.g. 1"
                value={form.order_id}
                onChange={(e) => setForm({ ...form, order_id: e.target.value })}
              />
            </Field>
            <Field label="Product ID *">
              <input
                className="glass-input"
                type="number"
                placeholder="e.g. 3"
                value={form.product_id}
                onChange={(e) =>
                  setForm({ ...form, product_id: e.target.value })
                }
              />
            </Field>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <Field label="Quantity *">
              <input
                className="glass-input"
                type="number"
                min="1"
                placeholder="1"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              />
            </Field>
            <Field label="Price (₹) *">
              <input
                className="glass-input"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </Field>
          </div>
        </Modal>
      )}
    </>
  );
}

// ════════════════════════════════════════════
//  Shared table shell (header + stats + add btn)
// ════════════════════════════════════════════
function TableShell({ title, count, stats, onAdd, addLabel, children }) {
  return (
    <div>
      {/* Table header row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <h2
            style={{ color: "white", fontWeight: 700, fontSize: 18, margin: 0 }}
          >
            {title}
          </h2>
          <span
            style={{
              background: "rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.5)",
              fontSize: 12,
              padding: "3px 10px",
              borderRadius: 20,
              fontWeight: 600,
            }}
          >
            {count} rows
          </span>
          {stats.map((s) => (
            <span
              key={s.label}
              style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}
            >
              · {s.label}: <strong style={{ color: "white" }}>{s.value}</strong>
            </span>
          ))}
        </div>
        <button
          onClick={onAdd}
          style={{
            background: "white",
            color: "black",
            border: "none",
            padding: "8px 18px",
            borderRadius: 9,
            fontWeight: 700,
            cursor: "pointer",
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Plus size={15} /> {addLabel}
        </button>
      </div>

      {/* Table content */}
      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 16,
          overflow: "auto",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// Shared sub-components
const LoadingRow = () => (
  <p
    style={{
      color: "rgba(255,255,255,0.35)",
      textAlign: "center",
      padding: 50,
    }}
  >
    Loading from MySQL...
  </p>
);

const CategoryBadge = ({ label }) => (
  <span
    style={{
      background: "rgba(255,255,255,0.08)",
      color: "rgba(255,255,255,0.6)",
      fontSize: 11,
      fontWeight: 600,
      padding: "3px 10px",
      borderRadius: 20,
      textTransform: "uppercase",
    }}
  >
    {label}
  </span>
);

const StockBadge = ({ qty }) => (
  <span
    style={{
      fontWeight: 700,
      fontSize: 14,
      color:
        qty > 10
          ? "rgba(134,239,172,0.9)"
          : qty > 0
            ? "rgba(253,224,71,0.9)"
            : "rgba(252,165,165,0.9)",
    }}
  >
    {qty}
  </span>
);
