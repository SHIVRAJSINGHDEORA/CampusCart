// Run this once to create the admin account in MySQL
// Command: node seed-admin.js

require("dotenv").config();
const bcrypt = require("bcrypt");
const mysql = require("mysql2/promise");

async function seedAdmin() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    // Hash the password "admin" with bcrypt
    const hashedPassword = await bcrypt.hash("admin", 12);
    console.log("Hashed password:", hashedPassword);

    // Delete old admin if exists, then insert fresh
    await pool.query("DELETE FROM Users WHERE email = ?", ["admin@gmail.com"]);

    await pool.query(
      "INSERT INTO Users (username, email, password, phone) VALUES (?, ?, ?, ?)",
      ["Admin", "admin@gmail.com", hashedPassword, null],
    );

    console.log("✅ Admin user created successfully!");
    console.log("   Email:    admin@gmail.com");
    console.log("   Password: admin");

    await pool.end();
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

seedAdmin();
