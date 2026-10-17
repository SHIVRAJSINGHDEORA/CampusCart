import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, X, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import toast from 'react-hot-toast';

const EMPTY_FORM = { product_name: '', category: '', price: '', stock_quantity: '' };

export default function Admin() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null); // null = add mode
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);

  // ── Access Guard ──
  useEffect(() => {
    if (!user)    { navigate('/login'); return; }
    if (!isAdmin) { toast.error('Admin only!'); navigate('/'); return; }
    loadProducts();
  }, [user, isAdmin]);

  // ── Fetch all products from MySQL via API ──
  const loadProducts = () => {
    setLoading(true);
    api.get('/products?limit=200')
      .then(res => setProducts(res.data.products))
      .catch(() => toast.error('Could not load products'))
      .finally(() => setLoading(false));
  };

  // ── Open modal in ADD mode ──
  const openAdd = () => {
    setEditProduct(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  // ── Open modal in EDIT mode ──
  const openEdit = (p) => {
    setEditProduct(p);
    setForm({
      product_name:   p.product_name,
      category:       p.category,
      price:          p.price,
      stock_quantity: p.stock_quantity,
    });
    setShowModal(true);
  };

  // ── Save: calls POST (add) or PUT (update) → MySQL ──
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.product_name || !form.category || !form.price) {
      toast.error('Name, category and price are required');
      return;
    }

    try {
      setSaving(true);

      if (editProduct) {
        // ── UPDATE in MySQL ──
        const res = await api.put(`/products/${editProduct.product_id}`, form);
        toast.success(res.data.message || 'Product updated!');
      } else {
        // ── INSERT into MySQL ──
        const res = await api.post('/products', form);
        toast.success(res.data.message || 'Product added!');
      }

      setShowModal(false);
      loadProducts(); // refresh table from DB
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete: calls DELETE → MySQL (FK-safe) ──
  const handleDelete = async (p) => {
    const confirmed = window.confirm(
      `Delete "${p.product_name}"?\n\nIf this product has orders, its stock will be set to 0 instead.`
    );
    if (!confirmed) return;

    try {
      const res = await api.delete(`/products/${p.product_id}`);
      toast.success(res.data.message || 'Product deleted');
      loadProducts(); // refresh from DB
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', padding: '40px 20px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* ── Page Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <Shield size={22} color="white" />
              <h1 style={{ color: 'white', fontWeight: 800, fontSize: 26, margin: 0 }}>Admin Panel</h1>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, margin: 0 }}>
              All changes sync directly to the MySQL database
            </p>
          </div>

          <button
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px' }}
            onClick={openAdd}
          >
            <Plus size={16} /> Add Product
          </button>
        </div>

        {/* ── Stats ── */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          {[
            { label: 'Total Products',  value: products.length },
            { label: 'In Stock',        value: products.filter(p => p.stock_quantity > 0).length },
            { label: 'Out of Stock',    value: products.filter(p => p.stock_quantity === 0).length },
          ].map(s => (
            <div key={s.label} className="glass" style={{ padding: '16px 24px', flex: '1 1 140px' }}>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 0.8 }}>{s.label}</p>
              <p style={{ color: 'white', fontSize: 28, fontWeight: 800, margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── Products Table ── */}
        <div className="glass" style={{ overflow: 'auto' }}>
          {loading ? (
            <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: 50 }}>Loading from database...</p>
          ) : products.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 50 }}>No products found. Click "Add Product" to begin.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {['ID', 'Product Name', 'Category', 'Price (₹)', 'Stock', 'Actions'].map(h => (
                    <th key={h} style={{
                      color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: 0.8,
                      padding: '14px 18px', textAlign: 'left',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr
                    key={p.product_id}
                    style={{
                      borderBottom: i < products.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 18px', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>#{p.product_id}</td>

                    <td style={{ padding: '14px 18px', color: 'white', fontWeight: 600, fontSize: 14 }}>{p.product_name}</td>

                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)',
                        fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                        textTransform: 'uppercase', letterSpacing: 0.3,
                      }}>
                        {p.category}
                      </span>
                    </td>

                    <td style={{ padding: '14px 18px', color: 'white', fontWeight: 700, fontSize: 15 }}>
                      {parseFloat(p.price).toFixed(2)}
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        color: p.stock_quantity > 10
                          ? 'rgba(134,239,172,0.85)'
                          : p.stock_quantity > 0
                            ? 'rgba(253,224,71,0.85)'
                            : 'rgba(252,165,165,0.85)',
                        fontWeight: 700, fontSize: 14,
                      }}>
                        {p.stock_quantity}
                      </span>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {/* Edit button → opens modal with product data */}
                        <button
                          onClick={() => openEdit(p)}
                          style={{
                            background: 'rgba(255,255,255,0.07)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            color: 'white', padding: '6px 14px', borderRadius: 8,
                            cursor: 'pointer', fontSize: 13, fontWeight: 600,
                            display: 'flex', alignItems: 'center', gap: 6,
                            transition: 'background 0.2s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                        >
                          <Pencil size={13} /> Edit
                        </button>

                        {/* Delete button → removes from MySQL */}
                        <button
                          className="btn-danger"
                          onClick={() => handleDelete(p)}
                          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ──────────────── Add / Edit Modal ──────────────── */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div className="glass" style={{ width: '100%', maxWidth: 440, padding: 32, position: 'relative' }}>

            {/* Close */}
            <button
              onClick={() => setShowModal(false)}
              style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h2 style={{ color: 'white', fontWeight: 800, fontSize: 20, margin: '0 0 6px' }}>
              {editProduct ? '✏️  Edit Product' : '➕  Add New Product'}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, margin: '0 0 24px' }}>
              {editProduct
                ? `Editing product #${editProduct.product_id} — changes saved to MySQL`
                : 'New product will be inserted into MySQL Products table'}
            </p>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Product Name */}
              <div>
                <label style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Product Name *
                </label>
                <input
                  className="glass-input"
                  placeholder="e.g. Wireless Headphones"
                  value={form.product_name}
                  onChange={e => setForm({ ...form, product_name: e.target.value })}
                />
              </div>

              {/* Category */}
              <div>
                <label style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Category *
                </label>
                <input
                  className="glass-input"
                  placeholder="e.g. Electronics, Clothing, Bags..."
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                />
              </div>

              {/* Price & Stock — side by side */}
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Price (₹) *
                  </label>
                  <input
                    className="glass-input"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Stock Qty
                  </label>
                  <input
                    className="glass-input"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.stock_quantity}
                    onChange={e => setForm({ ...form, stock_quantity: e.target.value })}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  className="btn-ghost"
                  style={{ flex: 1 }}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1 }}
                  disabled={saving}
                >
                  {saving
                    ? 'Saving to DB...'
                    : editProduct
                      ? 'Update in MySQL'
                      : 'Insert into MySQL'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
