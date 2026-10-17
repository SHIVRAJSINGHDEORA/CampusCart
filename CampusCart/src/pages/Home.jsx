import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import api from '../lib/api';
import { useCart } from '../context/CartContext';

export default function Home() {
  const [products, setProducts] = useState([]);
  const { addToCart } = useCart();

  // Fetch latest 6 products for the showcase
  useEffect(() => {
    api.get('/products?limit=6')
      .then(res => setProducts(res.data.products))
      .catch(() => {});
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', padding: '0 20px' }}>

      {/* ── Hero Section ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', paddingTop: 80, paddingBottom: 60, textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 900, color: 'white', lineHeight: 1.1, margin: 0 }}>
          The Campus<br />
          <span style={{ color: 'rgba(255,255,255,0.25)' }}>Marketplace</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 18, marginTop: 20, marginBottom: 36 }}>
          Discover products curated for students.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/products" className="btn-primary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, padding: '12px 28px' }}>
            <ShoppingBag size={18} /> Shop Now
          </Link>
          <Link to="/signup" className="btn-ghost" style={{ textDecoration: 'none', fontSize: 15, padding: '12px 28px' }}>
            Join Free
          </Link>
        </div>
      </div>

      {/* ── Featured Products ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 80 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ color: 'white', fontSize: 22, fontWeight: 700, margin: 0 }}>Featured Products</h2>
          <Link to="/products" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {products.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 40 }}>
            No products yet. Start the server and seed the database.
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
            {products.map(p => (
              <ProductCard key={p.product_id} product={p} onAdd={() => addToCart(p)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Small product card used on home page
function ProductCard({ product, onAdd }) {
  return (
    <div className="glass" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Category badge */}
      <span style={{
        background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)',
        fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
        alignSelf: 'flex-start', textTransform: 'uppercase', letterSpacing: 0.5,
      }}>
        {product.category}
      </span>

      <h3 style={{ color: 'white', fontWeight: 700, fontSize: 15, margin: 0, lineHeight: 1.3 }}>
        {product.product_name}
      </h3>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
        <span style={{ color: 'white', fontWeight: 800, fontSize: 18 }}>₹{product.price}</span>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>{product.stock_quantity} left</span>
      </div>

      <button className="btn-primary" style={{ width: '100%', padding: '8px 0', fontSize: 13 }} onClick={onAdd}>
        Add to Cart
      </button>
    </div>
  );
}
