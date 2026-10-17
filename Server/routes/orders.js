const express = require("express");
const pool = require("../db");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();

// All order routes require auth
router.use(verifyToken);

// POST /orders — place an order
router.post("/", async (req, res) => {
  const { items } = req.body; // [{ product_id, quantity }]
  const userId = req.user.userId;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Items array is required" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Fetch product prices and validate stock
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const [rows] = await conn.query(
        "SELECT * FROM Products WHERE product_id = ?",
        [item.product_id],
      );
      if (rows.length === 0) {
        await conn.rollback();
        return res
          .status(404)
          .json({ message: `Product ${item.product_id} not found` });
      }
      const product = rows[0];
      if (product.stock_quantity < item.quantity) {
        await conn.rollback();
        return res
          .status(400)
          .json({ message: `Insufficient stock for ${product.product_name}` });
      }
      orderItems.push({
        ...item,
        price: product.price,
        product_name: product.product_name,
      });
      totalAmount += product.price * item.quantity;
    }

    // Create order
    const [orderResult] = await conn.query(
      "INSERT INTO Orders (user_id, order_date, total_amount) VALUES (?, NOW(), ?)",
      [userId, totalAmount],
    );
    const orderId = orderResult.insertId;

    // Insert order items and decrement stock
    for (const item of orderItems) {
      await conn.query(
        "INSERT INTO OrderItems (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
        [orderId, item.product_id, item.quantity, item.price],
      );
      await conn.query(
        "UPDATE Products SET stock_quantity = stock_quantity - ? WHERE product_id = ?",
        [item.quantity, item.product_id],
      );
    }

    await conn.commit();
    return res
      .status(201)
      .json({ message: "Order placed successfully", orderId, totalAmount });
  } catch (err) {
    await conn.rollback();
    console.error("Order error:", err);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    conn.release();
  }
});

// GET /orders — get user's orders
router.get("/", async (req, res) => {
  try {
    const [orders] = await pool.query(
      "SELECT * FROM Orders WHERE user_id = ? ORDER BY order_date DESC",
      [req.user.userId],
    );

    for (const order of orders) {
      const [items] = await pool.query(
        `SELECT oi.*, p.product_name, p.category 
         FROM OrderItems oi 
         JOIN Products p ON oi.product_id = p.product_id 
         WHERE oi.order_id = ?`,
        [order.order_id],
      );
      order.items = items;
    }

    return res.json({ orders });
  } catch (err) {
    console.error("Orders fetch error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// GET /orders/:id
router.get("/:id", async (req, res) => {
  try {
    const [orders] = await pool.query(
      "SELECT * FROM Orders WHERE order_id = ? AND user_id = ?",
      [req.params.id, req.user.userId],
    );
    if (orders.length === 0)
      return res.status(404).json({ message: "Order not found" });

    const order = orders[0];
    const [items] = await pool.query(
      `SELECT oi.*, p.product_name, p.category 
       FROM OrderItems oi 
       JOIN Products p ON oi.product_id = p.product_id 
       WHERE oi.order_id = ?`,
      [order.order_id],
    );
    order.items = items;

    return res.json({ order });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
