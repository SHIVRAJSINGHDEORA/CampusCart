# 🛒 CampusCart — E-Commerce Platform

> A full-stack e-commerce web application built for a college DBMS project using **React**, **Node.js**, **Express**, and **MySQL**.

---

## 📌 Project Overview

CampusCart is an online marketplace where students can browse products, add them to a cart, and place orders. An admin account can manage all products directly from a dedicated admin panel — all data is stored in a MySQL database.

---

## 👥 Team Members

| Name          | Role                                      |
|---------------|-------------------------------------------|
| SHIVRAJ SINGH DEORA | Full Stack Lead & Backend Developer       |
| Garvit Choudhary      | Database Designer                         |
| Member 3      | Frontend Developer                        |
| Member 4      | UI/UX Designer                            |
| Member 5      | Security & Admin Module                   |

---

## 🗄️ Database Schema (MySQL)

We follow the exact schema given in the assignment:

```sql
Users       (user_id PK, username, email, password, phone)
Products    (product_id PK, product_name, category, price, stock_quantity)
Orders      (order_id PK, user_id FK → Users, order_date, total_amount)
OrderItems  (order_item_id PK, order_id FK → Orders, product_id FK → Products, quantity, price)
```

### Relationships
- One **User** can place many **Orders**
- One **Order** can have many **OrderItems**
- Each **OrderItem** links to one **Product**

---

## 🧰 Tech Stack

### Frontend (CampusCart/)
| Technology | Purpose |
|-----------|---------|
| **React 19** | UI framework — builds the pages as components |
| **React Router DOM** | Navigation between pages without page reload |
| **Tailwind CSS v4** | Utility-first CSS for styling |
| **Lucide React** | Icon library (cart, trash, pencil, etc.) |
| **Axios** | Makes HTTP requests from browser to server |
| **React Hot Toast** | Shows success/error notification popups |

### Backend (Server/)
| Technology | Purpose |
|-----------|---------|
| **Node.js** | JavaScript runtime on the server |
| **Express.js** | Web framework — handles API routes |
| **mysql2** | Connects Node.js to the MySQL database |
| **bcrypt** | Hashes passwords before storing (security) |
| **jsonwebtoken (JWT)** | Creates login tokens — keeps users logged in |
| **cookie-parser** | Reads JWT token stored in browser cookie |
| **dotenv** | Loads secret config from `.env` file |
| **cors** | Allows frontend (port 5173) to talk to backend (port 8080) |

---

## 🔐 Authentication Flow (JWT + bcrypt)

This is how login/signup works securely:

```
SIGNUP:
  User fills form → POST /auth/signup
  → Server hashes password with bcrypt (12 salt rounds)
  → Saves hashed password to MySQL Users table
  → Creates a JWT token
  → Sends token as httpOnly cookie to browser

LOGIN:
  User enters email + password → POST /auth/login
  → Server fetches user from MySQL by email
  → bcrypt.compare(entered password, stored hash)
  → If match → creates JWT token → sends as cookie

EVERY PROTECTED REQUEST:
  Browser automatically sends cookie
  → Server middleware (authMiddleware.js) verifies JWT
  → If valid → allows access, if not → 401 Unauthorized
```

> **Why bcrypt?** Plain text passwords are dangerous. bcrypt turns "admin" into something like `$2b$12$6AT4TcRF...` which cannot be reversed.

> **Why JWT?** Instead of checking the database on every request, a signed token proves who the user is without a DB lookup.

---

## 🗂️ Project Structure

```
Project/
│
├── Server/                   ← Node.js + Express backend
│   ├── index.js              ← App entry point, starts server on port 8080
│   ├── db.js                 ← MySQL connection pool (mysql2)
│   ├── .env                  ← Secret config (DB password, JWT secret)
│   ├── schema.sql            ← Run this in MySQL Workbench to create tables
│   ├── seed-admin.js         ← Run once to create admin@gmail.com account
│   ├── middleware/
│   │   └── authMiddleware.js ← JWT verification for protected routes
│   └── routes/
│       ├── auth.js           ← /auth/signup, /auth/login, /auth/logout, /auth/me
│       ├── products.js       ← /products (GET, POST, PUT, DELETE)
│       └── orders.js         ← /orders (GET, POST)
│
└── CampusCart/               ← React frontend
    └── src/
        ├── main.jsx          ← React app entry point
        ├── App.jsx           ← All routes defined here
        ├── Navbar.jsx        ← Top navigation bar
        ├── index.css         ← Global styles + glass effect CSS
        ├── lib/
        │   ├── api.js        ← Axios instance (base URL + cookies)
        │   └── utils.js      ← cn() class merge utility
        ├── context/
        │   ├── AuthContext.jsx  ← Manages logged-in user state globally
        │   └── CartContext.jsx  ← Manages cart state + localStorage
        └── pages/
            ├── Home.jsx      ← Landing page with featured products
            ├── Login.jsx     ← Login form
            ├── Signup.jsx    ← Registration form
            ├── Products.jsx  ← Browse all products with search + filter
            ├── Cart.jsx      ← Shopping cart + checkout
            ├── Orders.jsx    ← Order history for logged-in user
            └── Admin.jsx     ← Admin panel (add/edit/delete products)
```

---

## 🖥️ Pages & Features

### 🏠 Home Page (`/`)
- Shows a hero banner with "Shop Now" button
- Displays 6 featured products fetched from MySQL
- Each product card has an **Add to Cart** button

### 🛍️ Products Page (`/products`)
- Fetches **all products** from MySQL (`SELECT * FROM Products`)
- **Search bar** — filters by product name using `LIKE %keyword%`
- **Category dropdown** — filters by category
- Every card shows: name, category, price, stock count
- **Add to Cart** button — adds item to cart (stored in localStorage)

### 🔐 Login Page (`/login`)
- Takes email and password
- Calls `POST /auth/login` → server checks bcrypt hash → returns JWT cookie
- On success, redirects to Home

### 📝 Signup Page (`/signup`)
- Takes username, email, phone, password
- Calls `POST /auth/signup` → server hashes password → saves to MySQL → returns JWT cookie
- Logged in automatically after signup

### 🛒 Cart Page (`/cart`)
- Shows all items added to cart (saved in browser localStorage)
- **`+` / `−` buttons** — increase or decrease quantity
- **🗑️ Delete button** — removes item from cart
- Shows running total price
- **"Place Order" button**:
  1. Calls `POST /orders` with item list
  2. Server validates stock in MySQL
  3. Server creates row in `Orders` table
  4. Server creates rows in `OrderItems` table
  5. Server decrements `stock_quantity` in `Products` table
  6. All in a **MySQL Transaction** (if anything fails, everything rolls back)

### 📦 Orders Page (`/orders`)
- Only visible when logged in (redirects to login otherwise)
- Calls `GET /orders` → server fetches from MySQL with JOIN:
  ```sql
  SELECT oi.*, p.product_name, p.category
  FROM OrderItems oi
  JOIN Products p ON oi.product_id = p.product_id
  WHERE oi.order_id = ?
  ```
- Shows each order with date, total, and all items inside

### 🛡️ Admin Page (`/admin`)
- **Only accessible when logged in as `admin@gmail.com`**
- Anyone else is redirected away immediately
- Shows all products in a table with live stats

#### Admin Buttons — What MySQL query runs:

| Button | MySQL Query |
|--------|-------------|
| **➕ Add Product** | `INSERT INTO Products (product_name, category, price, stock_quantity) VALUES (?, ?, ?, ?)` |
| **✏️ Edit** | `UPDATE Products SET product_name=?, category=?, price=?, stock_quantity=? WHERE product_id=?` |
| **🗑️ Delete** | `DELETE FROM Products WHERE product_id=?` *(if product has orders, sets stock=0 instead)* |

After every operation the table **re-fetches from MySQL** to show live data.

---

## 🔒 Security Features

| Feature | How it works |
|---------|-------------|
| **Password Hashing** | bcrypt with 12 salt rounds — cannot be reversed |
| **JWT Tokens** | Signed with secret key, expire in 7 days |
| **httpOnly Cookie** | Token stored in cookie JavaScript cannot read — prevents XSS |
| **Server-side Admin Guard** | Every admin route checks `req.user.email === 'admin@gmail.com'` |
| **MySQL Transactions** | Order placement is atomic — partial orders never saved |
| **Stock Validation** | Server checks stock before creating order |

---

## ⚙️ How to Run

### Step 1 — Setup MySQL Database
Open MySQL Workbench and run `Server/schema.sql`:
```sql
-- Creates database, all 4 tables, and seeds 12 sample products
```

### Step 2 — Configure Environment
Edit `Server/.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD="YourMySQLPassword"   ← wrap in quotes if it has special chars like #
DB_NAME=ecommerce_db
JWT_SECRET=supersecretjwtkey_changeme_in_production
```

### Step 3 — Create Admin Account
```bash
cd Server
node seed-admin.js
```
This inserts `admin@gmail.com` with bcrypt-hashed password `admin` into MySQL.

### Step 4 — Start the Server
```bash
cd Server
npm run dev        ← runs with nodemon (auto-restarts on changes)
```
Server runs at: `http://localhost:8080`

### Step 5 — Start the Frontend
```bash
cd CampusCart
npm run dev
```
Frontend runs at: `http://localhost:5173`

---

## 👤 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@gmail.com | admin |
| **Regular User** | Sign up from the website | your choice |

---

## 🌐 API Endpoints

### Auth Routes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/signup` | Register new user | No |
| POST | `/auth/login` | Login, receive JWT cookie | No |
| POST | `/auth/logout` | Clear cookie | No |
| GET | `/auth/me` | Get logged-in user info | ✅ Yes |

### Product Routes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/products` | List all products (search, filter) | No |
| GET | `/products/categories` | List all unique categories | No |
| GET | `/products/:id` | Get single product | No |
| POST | `/products` | Add new product | ✅ Admin only |
| PUT | `/products/:id` | Update product | ✅ Admin only |
| DELETE | `/products/:id` | Delete product | ✅ Admin only |

### Order Routes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/orders` | Place a new order | ✅ Yes |
| GET | `/orders` | Get user's order history | ✅ Yes |
| GET | `/orders/:id` | Get single order details | ✅ Yes |

---

## 🎨 UI Design

- **Color theme:** Strict black and white
- **Effect:** Glass morphism (`backdrop-blur`, semi-transparent backgrounds)
- **Background:** `#0a0a0a` (near black)
- **Cards:** `rgba(255,255,255,0.05)` with `blur(16px)` — glass look
- **Buttons:** White = primary action, Outlined = secondary, Red = delete

---

## 📊 How Data Flows

```
Browser (React)
     │
     │  HTTP Request (Axios + JWT cookie)
     ▼
Express Server (Node.js) — port 8080
     │
     ├── authMiddleware.js   →  verifies JWT token
     ├── routes/auth.js      →  bcrypt + JWT logic
     ├── routes/products.js  →  CRUD queries
     └── routes/orders.js    →  transaction queries
          │
          │  mysql2 driver
          ▼
    MySQL Database (ecommerce_db)
    ┌──────────┐     ┌────────────┐
    │  Users   │     │  Products  │
    └──────────┘     └────────────┘
    ┌──────────┐     ┌────────────┐
    │  Orders  │────▶│ OrderItems │
    └──────────┘     └────────────┘
```

---

*Built for DBMS Lab Project — using mysql2 + Express + React*
