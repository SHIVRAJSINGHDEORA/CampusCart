const express = require("express");
const pool = require("../db");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();

// ── Admin guard helper ──

const adminOnly = (req, res) => {
  if (req.user?.email !== "admin@gmail.com") {
    res.status(403).json({ message: "Admin access required" });
    return false;
  }
  return true;
};

router.get("/", async (req, res) => {
  try {
    const { search, category, limit = 20 } = req.query;

    let query = "SELECT * FROM Products WHERE 1=1";
    const params = [];

    if (category) {
      query += " AND category = ?";
      params.push(category);
    }

    if (search) {
      query += " AND product_name LIKE ?";
      params.push(`%${search}%`);
    }

    query += " ORDER BY product_id DESC LIMIT ?";
    params.push(parseInt(limit));

    const [products] = await pool.query(query, params);
    res.json({ products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─────────────────────────────────────────────
// GET /products/categories  — unique list (PUBLIC)
// ─────────────────────────────────────────────

router.get("/categories", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT DISTINCT category FROM Products ORDER BY category",
    );
    res.json({ categories: rows.map((r) => r.category) });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ─────────────────────────────────────────────
// GET /products/:id  — single product (PUBLIC)
// ─────────────────────────────────────────────

router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM Products WHERE product_id = ?",
      [req.params.id],
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "Product not found" });
    res.json({ product: rows[0] });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ─────────────────────────────────────────────
// POST /products  — ADD new product (ADMIN ONLY)
// Body: { product_name, category, price, stock_quantity }
// ─────────────────────────────────────────────

router.post("/", verifyToken, async (req, res) => {
  if (!adminOnly(req, res)) return;

  const { product_name, category, price, stock_quantity } = req.body;

  if (!product_name || !category || !price) {
    return res
      .status(400)
      .json({ message: "Product name, category and price are required" });
  }

  try {
    // INSERT into MySQL Products table
    const [result] = await pool.query(
      "INSERT INTO Products (product_name, category, price, stock_quantity) VALUES (?, ?, ?, ?)",
      [
        product_name.trim(),
        category.trim(),
        parseFloat(price),
        parseInt(stock_quantity) || 0,
      ],
    );

    res.status(201).json({
      message: "Product added to database",
      productId: result.insertId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add product" });
  }
});

// ─────────────────────────────────────────────
// PUT /products/:id  — UPDATE product (ADMIN ONLY)
// Body: { product_name, category, price, stock_quantity }
// ─────────────────────────────────────────────

router.put("/:id", verifyToken, async (req, res) => {
  if (!adminOnly(req, res)) return;

  const { product_name, category, price, stock_quantity } = req.body;
  const { id } = req.params;

  if (!product_name || !category || !price) {
    return res
      .status(400)
      .json({ message: "Product name, category and price are required" });
  }

  try {
    // Check product exists first
    const [existing] = await pool.query(
      "SELECT product_id FROM Products WHERE product_id = ?",
      [id],
    );
    if (existing.length === 0)
      return res.status(404).json({ message: "Product not found" });

    // UPDATE in MySQL
    await pool.query(
      `UPDATE Products
         SET product_name = ?, category = ?, price = ?, stock_quantity = ?
       WHERE product_id = ?`,
      [
        product_name.trim(),
        category.trim(),
        parseFloat(price),
        parseInt(stock_quantity) || 0,
        id,
      ],
    );

    res.json({ message: "Product updated in database" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update product" });
  }
});

// ─────────────────────────────────────────────
// DELETE /products/:id  — DELETE product (ADMIN ONLY)
// Note: cannot delete if product has existing orders
// ─────────────────────────────────────────────
router.delete("/:id", verifyToken, async (req, res) => {
  if (!adminOnly(req, res)) return;

  const { id } = req.params;

  try {
    // Check if this product exists
    const [existing] = await pool.query(
      "SELECT product_id FROM Products WHERE product_id = ?",
      [id],
    );
    if (existing.length === 0)
      return res.status(404).json({ message: "Product not found" });

    // Check if product has been ordered — cannot delete due to FK constraint
    const [orders] = await pool.query(
      "SELECT COUNT(*) AS total FROM OrderItems WHERE product_id = ?",
      [id],
    );
    if (orders[0].total > 0) {
      // Instead of hard delete, just mark stock as 0 (safe approach)
      await pool.query(
        "UPDATE Products SET stock_quantity = 0 WHERE product_id = ?",
        [id],
      );
      return res.json({
        message:
          "Product has existing orders — stock set to 0 (hidden from shop)",
      });
    }

    // Safe to hard DELETE from MySQL
    await pool.query("DELETE FROM Products WHERE product_id = ?", [id]);
    res.json({ message: "Product deleted from database" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete product" });
  }

  
});

module.exports = router;
