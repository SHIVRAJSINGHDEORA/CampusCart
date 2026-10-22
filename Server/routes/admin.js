const express = require('express');
const pool = require('../db');
const verifyToken = require('../middleware/authMiddleware');
const bcrypt = require('bcrypt');

const router = express.Router();

// All routes in this file require admin login
router.use(verifyToken, (req, res, next) => {
  if (req.user?.email !== 'admin@gmail.com') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
});

// ══════════════════════════════════════════════
//  USERS TABLE — GET, POST, PUT, DELETE
// ══════════════════════════════════════════════

// GET /admin/users — list all users (no password)
router.get('/users', async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT user_id, username, email, phone FROM Users ORDER BY user_id DESC'
    );
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /admin/users — add a new user
router.post('/users', async (req, res) => {
  const { username, email, password, phone } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ message: 'Username, email and password are required' });

  try {
    const [existing] = await pool.query('SELECT user_id FROM Users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(409).json({ message: 'Email already exists' });

    const hashed = await bcrypt.hash(password, 12);
    const [result] = await pool.query(
      'INSERT INTO Users (username, email, password, phone) VALUES (?, ?, ?, ?)',
      [username, email, hashed, phone || null]
    );
    res.status(201).json({ message: 'User created', userId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /admin/users/:id — update user info
router.put('/users/:id', async (req, res) => {
  const { username, email, phone, password } = req.body;
  if (!username || !email)
    return res.status(400).json({ message: 'Username and email are required' });

  try {
    if (password) {
      const hashed = await bcrypt.hash(password, 12);
      await pool.query(
        'UPDATE Users SET username=?, email=?, phone=?, password=? WHERE user_id=?',
        [username, email, phone || null, hashed, req.params.id]
      );
    } else {
      await pool.query(
        'UPDATE Users SET username=?, email=?, phone=? WHERE user_id=?',
        [username, email, phone || null, req.params.id]
      );
    }
    res.json({ message: 'User updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /admin/users/:id — delete user (blocks if they have orders)
router.delete('/users/:id', async (req, res) => {
  try {
    if (req.user.userId == req.params.id)
      return res.status(400).json({ message: 'Cannot delete your own admin account' });

    const [orders] = await pool.query(
      'SELECT COUNT(*) AS total FROM Orders WHERE user_id = ?', [req.params.id]
    );
    if (orders[0].total > 0)
      return res.status(400).json({ message: 'Cannot delete — user has existing orders' });

    await pool.query('DELETE FROM Users WHERE user_id = ?', [req.params.id]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ══════════════════════════════════════════════
//  ORDERS TABLE — GET, POST, PUT, DELETE
// ══════════════════════════════════════════════

// GET /admin/orders — all orders with username
router.get('/orders', async (req, res) => {
  try {
    const [orders] = await pool.query(`
      SELECT o.order_id, o.user_id, u.username, o.order_date, o.total_amount
      FROM Orders o
      JOIN Users u ON o.user_id = u.user_id
      ORDER BY o.order_id DESC
    `);
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /admin/orders — create order manually
router.post('/orders', async (req, res) => {
  const { user_id, total_amount } = req.body;
  if (!user_id || !total_amount)
    return res.status(400).json({ message: 'user_id and total_amount are required' });

  try {
    const [result] = await pool.query(
      'INSERT INTO Orders (user_id, order_date, total_amount) VALUES (?, NOW(), ?)',
      [user_id, parseFloat(total_amount)]
    );
    res.status(201).json({ message: 'Order created', orderId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /admin/orders/:id — update order
router.put('/orders/:id', async (req, res) => {
  const { user_id, total_amount } = req.body;
  if (!user_id || !total_amount)
    return res.status(400).json({ message: 'user_id and total_amount are required' });

  try {
    await pool.query(
      'UPDATE Orders SET user_id=?, total_amount=? WHERE order_id=?',
      [user_id, parseFloat(total_amount), req.params.id]
    );
    res.json({ message: 'Order updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /admin/orders/:id — delete order + its items (transaction)
router.delete('/orders/:id', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM OrderItems WHERE order_id = ?', [req.params.id]);
    await conn.query('DELETE FROM Orders WHERE order_id = ?', [req.params.id]);
    await conn.commit();
    res.json({ message: 'Order and its items deleted' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: 'Server error' });
  } finally {
    conn.release();
  }
});

// ══════════════════════════════════════════════
//  ORDER ITEMS TABLE — GET, POST, PUT, DELETE
// ══════════════════════════════════════════════

// GET /admin/orderitems — all items with product name
router.get('/orderitems', async (req, res) => {
  try {
    const [items] = await pool.query(`
      SELECT oi.order_item_id, oi.order_id, oi.product_id,
             p.product_name, oi.quantity, oi.price
      FROM OrderItems oi
      JOIN Products p ON oi.product_id = p.product_id
      ORDER BY oi.order_item_id DESC
    `);
    res.json({ items });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /admin/orderitems — add item to an order
router.post('/orderitems', async (req, res) => {
  const { order_id, product_id, quantity, price } = req.body;
  if (!order_id || !product_id || !quantity || !price)
    return res.status(400).json({ message: 'All fields required' });

  try {
    const [result] = await pool.query(
      'INSERT INTO OrderItems (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
      [order_id, product_id, parseInt(quantity), parseFloat(price)]
    );
    res.status(201).json({ message: 'Order item added', itemId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /admin/orderitems/:id — update order item
router.put('/orderitems/:id', async (req, res) => {
  const { order_id, product_id, quantity, price } = req.body;
  if (!order_id || !product_id || !quantity || !price)
    return res.status(400).json({ message: 'All fields required' });

  try {
    await pool.query(
      'UPDATE OrderItems SET order_id=?, product_id=?, quantity=?, price=? WHERE order_item_id=?',
      [order_id, product_id, parseInt(quantity), parseFloat(price), req.params.id]
    );
    res.json({ message: 'Order item updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /admin/orderitems/:id — delete single order item
router.delete('/orderitems/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM OrderItems WHERE order_item_id = ?', [req.params.id]);
    res.json({ message: 'Order item deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
