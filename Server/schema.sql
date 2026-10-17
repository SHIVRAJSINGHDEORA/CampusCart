-- Run this in your MySQL client to set up the database
-- Step 1: Create database
CREATE DATABASE IF NOT EXISTS ecommerce_db;
USE ecommerce_db;

-- Step 2: Create tables (matching the schema exactly)
CREATE TABLE IF NOT EXISTS Users (
  user_id   INT AUTO_INCREMENT PRIMARY KEY,
  username  VARCHAR(100) NOT NULL,
  email     VARCHAR(150) NOT NULL UNIQUE,
  password  VARCHAR(255) NOT NULL,
  phone     VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS Products (
  product_id      INT AUTO_INCREMENT PRIMARY KEY,
  product_name    VARCHAR(200) NOT NULL,
  category        VARCHAR(100) NOT NULL,
  price           DECIMAL(10,2) NOT NULL,
  stock_quantity  INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS Orders (
  order_id      INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  order_date    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  total_amount  DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE IF NOT EXISTS OrderItems (
  order_item_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id      INT NOT NULL,
  product_id    INT NOT NULL,
  quantity      INT NOT NULL,
  price         DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES Orders(order_id),
  FOREIGN KEY (product_id) REFERENCES Products(product_id)
);

-- Step 3: Seed admin user
-- Password is "admin" hashed with bcrypt (12 rounds)
INSERT IGNORE INTO Users (username, email, password, phone)
VALUES ('Admin', 'admin@gmail.com', '$2b$12$wOtLDSzPVygwfyEYLqLLCuo3SkqX3.IK7j9yGqLjmhfvqQQZJ5t4q', NULL);

-- Step 4: Seed sample products
INSERT INTO Products (product_name, category, price, stock_quantity) VALUES
('Wireless Headphones', 'Electronics', 1499.00, 50),
('Running Shoes', 'Footwear', 2999.00, 30),
('Cotton T-Shirt', 'Clothing', 499.00, 100),
('Smart Watch', 'Wearables', 4999.00, 25),
('Earbuds', 'Electronics', 1299.00, 75),
('Backpack', 'Bags', 899.00, 40),
('Desk Lamp', 'Office', 649.00, 60),
('Water Bottle', 'Essentials', 399.00, 120),
('Sunglasses', 'Accessories', 1999.00, 35),
('Denim Jeans', 'Clothing', 1299.00, 80),
('Yoga Mat', 'Fitness', 799.00, 55),
('Notebook Set', 'Stationery', 249.00, 200);
