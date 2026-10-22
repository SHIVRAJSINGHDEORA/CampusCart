# 🛒 CampusCart — E-Commerce Platform

> A full-stack e-commerce web application built for a college DBMS project using **React**, **Node.js**, **Express**, and **MySQL**.

---

## 📌 Project Overview

CampusCart is an online marketplace where students can browse products, add them to a cart, and place orders. 
It features a **comprehensive Admin Dashboard** that allows full CRUD operations (**Create, Read, Update, Delete**) directly on **all 4 database tables** (`Products`, `Users`, `Orders`, and `OrderItems`) with foreign-key safe handling and transactions.

---

## 👥 Team Members & Roles

| Name | Role | Responsibilities |
|------|------|------------------|
| Shivraj Singh Deora | **Full Stack Lead & Backend Developer** | Express architecture, MySQL2 pooling, REST API endpoints, routing |
| Garvit Chaudhary | **Database Designer** | MySQL schema design, relational integrity (PK/FK), transactions & seeding |
| Naman Mangla | **Frontend Developer** | React pages (Home, Products, Cart, Orders), Context API, Axios integration |
| Aman Yadav | **UI/UX Designer** | Black & White glassmorphism aesthetic, responsive layout, modal dialogs |
| Tejas Srivatsava | **Security & Admin Module** | JWT token management, bcrypt password hashing, 4-table Admin CRUD panel |

---

## 🗄️ Database Schema (MySQL)

Designed strictly according to the relational schema requirements:

```sql
Users       (user_id PK, username, email, password, phone)
Products    (product_id PK, product_name, category, price, stock_quantity)
Orders      (order_id PK, user_id FK → Users, order_date, total_amount)
OrderItems  (order_item_id PK, order_id FK → Orders, product_id FK → Products, quantity, price)
```

### Relational Mapping
- **Users ➔ Orders** (1 : N): One user can create multiple orders.
- **Orders ➔ OrderItems** (1 : N): An order contains multiple line items.
- **Products ➔ OrderItems** (1 : N): A product can appear across multiple order line items.

---

## 🧰 Tech Stack

### Frontend (`CampusCart/`)
| Technology | Purpose |
|-----------|---------|
| **React 19** | Component-driven user interface |
| **React Router DOM v7** | Client-side routing with clean URL navigation |
| **Tailwind CSS v4** | Modern styling engine with glassmorphic variables |
| **Lucide React** | Minimalist modern icons |
| **Axios** | HTTP client configured with cookie credentials |
| **React Hot Toast** | Toast notifications for DB operations and user alerts |

### Backend (`Server/`)
| Technology | Purpose |
|-----------|---------|
| **Node.js & Express.js** | Backend API runtime and routing framework |
| **mysql2 (Promise Pool)** | High-performance asynchronous MySQL connector |
| **bcrypt** | Salted hashing algorithm for user passwords |
| **jsonwebtoken (JWT)** | Token-based stateless authentication stored in HTTP-only cookies |
| **cookie-parser** | Parsing credentials and tokens from request headers |
| **dotenv** | Environment-based configuration management |
| **cors** | Cross-Origin Resource Sharing control |

---

## 🔐 Authentication & Security Architecture

1. **Password Hashing (bcrypt)**:
   - When a user or admin registers/adds an account, the plaintext password is processed through **12 salt rounds**. Plaintext passwords are never persisted in the database.
2. **Stateless JWT Authorization**:
   - On login, a signed JSON Web Token containing the user's ID, email, and username is generated.
   - It is transmitted via an `httpOnly`, `sameSite: strict` cookie, protecting against cross-site scripting (XSS) and token theft.
3. **Role-Based Admin Protection**:
   - Protected routes and the `/admin` interface enforce server-side validation:
     ```javascript
     if (req.user?.email !== 'admin@gmail.com') {
       return res.status(403).json({ message: 'Admin access required' });
     }
     ```
4. **Database Transactions**:
   - Order placement and order deletion execute within explicit `START TRANSACTION`, `COMMIT`, and `ROLLBACK` blocks to maintain ACID compliance.

---

## 🗂️ Project Directory Structure

```
Project/
│
├── README.md                 ← Project documentation & presentation guide
│
├── Server/                   ← Backend API (Node.js + Express)
│   ├── index.js              ← Main server setup & route registration
│   ├── db.js                 ← MySQL connection pool configuration
│   ├── .env                  ← Environment variables (DB credentials, JWT secret)
│   ├── schema.sql            ← DDL script with seed data
│   ├── seed-admin.js         ← One-step script to seed admin@gmail.com
│   ├── middleware/
│   │   └── authMiddleware.js ← JWT verification middleware
│   └── routes/
│       ├── auth.js           ← User signup, login, logout, session check
│       ├── products.js       ← Storefront products API
│       ├── orders.js         ← Storefront orders API & transaction placement
│       └── admin.js          ← Dedicated CRUD endpoints for ALL 4 tables
│
└── CampusCart/               ← Frontend (React + Vite + Tailwind)
    └── src/
        ├── main.jsx          ← React entry point
        ├── App.jsx           ← Application routing
        ├── Navbar.jsx        ← Glassmorphic navigation bar with role badges
        ├── index.css         ← Global design tokens and glass utility classes
        ├── lib/
        │   ├── api.js        ← Centralized Axios instance with baseUrl and credentials
        │   └── utils.js      ← Class utility helpers
        ├── context/
        │   ├── AuthContext.jsx  ← Authentication state provider (user, admin status)
        │   └── CartContext.jsx  ← Shopping cart state (with localStorage persistence)
        └── pages/
            ├── Home.jsx      ← Hero page & featured products
            ├── Login.jsx     ← User & Admin sign in
            ├── Signup.jsx    ← User account registration
            ├── Products.jsx  ← Searchable & filterable catalogue
            ├── Cart.jsx      ← Cart management & checkout
            ├── Orders.jsx    ← Personal purchase history
            └── Admin.jsx     ← Full CRUD multi-tab dashboard for all 4 tables
```

---

## 🖥️ Application Features & SQL Mapping

### 1. Storefront

- **Home (`/`)**: Displays curated product catalog fetched with `SELECT * FROM Products LIMIT 6`.
- **Products Catalog (`/products`)**: Dynamic search and filtering using SQL queries:
  ```sql
  SELECT * FROM Products WHERE category = ? AND product_name LIKE ? ORDER BY product_id DESC;
  ```
- **Cart & Checkout (`/cart`)**: 
  - Validates stock in `Products`.
  - Atomically creates `Orders`, inserts into `OrderItems`, and decrements `stock_quantity` in `Products` using a MySQL transaction.
- **Order History (`/orders`)**: Fetches customer orders linked with product details using `JOIN`:
  ```sql
  SELECT oi.*, p.product_name, p.category 
  FROM OrderItems oi 
  JOIN Products p ON oi.product_id = p.product_id 
  WHERE oi.order_id = ?;
  ```

---

### 2. Full Admin Dashboard (`/admin`)

The Admin Panel features a **Tabbed Interface** allowing management of **every single table** in the schema:

```
[ 📦 Products ]  [ 👤 Users ]  [ 🧾 Orders ]  [ 📋 Order Items ]
```

#### A. 📦 Products Management
- **Add**: Opens dialog $\rightarrow$ `INSERT INTO Products (product_name, category, price, stock_quantity) VALUES (?, ?, ?, ?)`
- **Edit**: Updates fields $\rightarrow$ `UPDATE Products SET product_name=?, category=?, price=?, stock_quantity=? WHERE product_id=?`
- **Delete**: Foreign-key safe $\rightarrow$ If product has orders, marks stock as 0; otherwise runs `DELETE FROM Products WHERE product_id=?`.

#### B. 👤 Users Management
- **Add**: Hashes password with bcrypt $\rightarrow$ `INSERT INTO Users (username, email, password, phone) VALUES (?, ?, ?, ?)`
- **Edit**: Updates user details $\rightarrow$ `UPDATE Users SET username=?, email=?, phone=? WHERE user_id=?` (optionally updates password if provided)
- **Delete**: Prevents deleting active admin and checks for existing orders $\rightarrow$ `DELETE FROM Users WHERE user_id=?`.

#### C. 🧾 Orders Management
- **Add**: Manually creates orders $\rightarrow$ `INSERT INTO Orders (user_id, order_date, total_amount) VALUES (?, NOW(), ?)`
- **Edit**: Updates buyer or total $\rightarrow$ `UPDATE Orders SET user_id=?, total_amount=? WHERE order_id=?`
- **Delete**: Uses a transaction to remove related items first, then the order:
  ```sql
  DELETE FROM OrderItems WHERE order_id = ?;
  DELETE FROM Orders WHERE order_id = ?;
  ```

#### D. 📋 Order Items Management
- **Add**: Adds line item $\rightarrow$ `INSERT INTO OrderItems (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`
- **Edit**: Modifies quantities/price $\rightarrow$ `UPDATE OrderItems SET order_id=?, product_id=?, quantity=?, price=? WHERE order_item_id=?`
- **Delete**: Removes single item $\rightarrow$ `DELETE FROM OrderItems WHERE order_item_id=?`

---

## 🌐 API Route Reference

### Storefront & Auth Endpoints
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/auth/signup` | Register new user account | Public |
| POST | `/auth/login` | Authenticate user & issue JWT | Public |
| POST | `/auth/logout` | Clear JWT auth cookie | Public |
| GET | `/auth/me` | Fetch active session details | Authenticated |
| GET | `/products` | List & filter products | Public |
| GET | `/products/categories` | Distinct categories list | Public |
| GET | `/orders` | Logged-in user's order history | Authenticated |
| POST | `/orders` | Place order (transaction) | Authenticated |

### Admin Table CRUD Endpoints (`/admin/*`)
| Table | Method | Endpoint | Description |
|---|---|---|---|
| **Users** | `GET` | `/admin/users` | List all registered users |
| | `POST` | `/admin/users` | Create new user (hashed password) |
| | `PUT` | `/admin/users/:id` | Update user credentials or details |
| | `DELETE` | `/admin/users/:id` | Delete user (FK-safe check) |
| **Orders** | `GET` | `/admin/orders` | View all customer orders with user joins |
| | `POST` | `/admin/orders` | Manually insert new order record |
| | `PUT` | `/admin/orders/:id` | Edit order user or total amount |
| | `DELETE` | `/admin/orders/:id` | Cascade delete order & its line items |
| **OrderItems**| `GET` | `/admin/orderitems` | View all items joined with product names |
| | `POST` | `/admin/orderitems` | Insert item into an order |
| | `PUT` | `/admin/orderitems/:id` | Update item quantity or unit price |
| | `DELETE` | `/admin/orderitems/:id` | Remove item line from order |
| **Products** | `POST` | `/products` | Admin create product |
| | `PUT` | `/products/:id` | Admin update product |
| | `DELETE` | `/products/:id` | Admin delete product |

---

## 🚀 Setup & Execution Guide

### 1. Database Initialization
1. Start your local MySQL server.
2. In MySQL Workbench or MySQL CLI, run the `Server/schema.sql` script:
   ```bash
   mysql -u root -p < Server/schema.sql
   ```

### 2. Configure Environment Variables
Inside `Server/.env`:
```env
PORT=8080
CLIENT_URL=http://localhost:5173

DB_HOST=localhost
DB_USER=root
DB_PASSWORD="YourMySQLPassword"
DB_NAME=ecommerce_db

JWT_SECRET=supersecretjwtkey_changeme_in_production
JWT_EXPIRES_IN=7d
```
> **Tip:** If your MySQL password contains special characters like `#`, make sure it is enclosed in double quotes (`"..."`).

### 3. Seed Admin Credentials
Run the dedicated seeding script:
```bash
cd Server
node seed-admin.js
```
This ensures an admin record exists in the database with the properly salted bcrypt hash.

### 4. Run the Backend API
```bash
cd Server
npm run dev
```
*API runs at:* `http://localhost:8080`

### 5. Run the Frontend Client
In a separate terminal:
```bash
cd CampusCart
npm run dev
```
*Application runs at:* `http://localhost:5173`

---

## 🔑 Default Credentials

| Portal / Role | Email | Password |
|---|---|---|
| **Admin Panel** | `admin@gmail.com` | `admin` |
| **Customer Storefront** | Register via `/signup` or use existing seeded accounts | Defined at registration |

---

## 🎨 Visual Design Guidelines

- **Palette**: Monochromatic High Contrast (Pure Black `#0a0a0a` & Clean White `#ffffff`).
- **Surface**: Frosted glassmorphism using `backdrop-filter: blur(16px)` and translucent borders (`rgba(255, 255, 255, 0.1)`).
- **Feedback**: Color-accented status badges (Stock: Green/Yellow/Red; Actions: Danger alert tones for deletions).

---

*Prepared for DBMS Lab Project Presentation & Viva Assessment.*
