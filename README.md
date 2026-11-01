# BudgetBite – Delicious Food. Smarter Budgets.

> **A Complete, Production-Grade Full-Stack Smart Budget-Based Food Ordering Platform**

BudgetBite is a modern food-tech web application built from scratch with React.js, Node.js/Express, and MySQL. It empowers customers to discover authentic food, set an exact dining budget, construct optimized meal combinations with real-time balance calculations, receive recommendations for items fitting their remaining balance, and place orders with end-to-end transactional integrity and live order tracking.

---

## 🌟 Key Features

### 1. Smart Budget Planner (USP)
- **Interactive Budget Input:** Set any budget (e.g., ₹200) or select from popular presets (₹100, ₹150, ₹200, ₹250, ₹300, ₹500).
- **Live Mathematical Balance:** Dynamically computes total planned amount, remaining balance, and utilization gauge on every add, remove, or quantity modifier.
- **Budget Guard:** Prevents selected combinations from exceeding the target budget with friendly inline guidance.
- **Affordable Additions Recommendation Engine:** Analyzes remaining balance and suggests actual database dishes that fit the remaining budget, prioritizing dish diversity.
- **1-Click Batch Cart Addition:** Transfers the entire balanced meal combination directly into the customer's cart.

### 2. Handcrafted Food Menu
- All 16 authentic starter, rice, noodle, fast food, pizza, and beverage dishes loaded dynamically from MySQL.
- Veg / Non-Veg diet filters with official green/red indicator badges.
- Category filters (Rice, Noodles, Starters, Fast Food, Pizza, Drinks).
- Price range slider and sorting (Low to High, High to Low, Highest Rated, Newest).
- Real-time search by dish title, ingredients, or description.

### 3. Curated Pocket-Friendly Combos
- Real multi-dish packages:
  - **Student Combo (₹99)** – Veg Noodles + French Fries + Cool Drinks (Save ₹51)
  - **Budget Combo (₹149)** – Veg Fried Rice + Gobi Manchurian + Cool Drinks (Save ₹51)
  - **Family Combo (₹299)** – Chicken Fried Rice + Cheese Pizza + French Fries + Fresh Juice (Save ₹71)
- Admins can create, edit, activate/deactivate, and price combos dynamically.

### 4. Crave Match Interactive Quiz
- "What are you craving today?" mood discovery:
  - 🌶️ Something Spicy
  - 🧀 Something Cheesy
  - 🥢 Something Crunchy
  - 🥗 Something Light
  - 🍛 Something Filling
  - 🥤 Something Sweet
- Matches tags stored directly on MySQL food records.

### 5. Persistent Shopping Cart & Checkout
- Persistent cart state saved across page reloads.
- Strict backend price re-validation — client-submitted totals are never trusted.
- Database transactions ensure atomicity during order creation.
- Unique human-readable Order Numbers (e.g. `BB-20261031-4829`).

### 6. Live Order Tracking
- 4-stage visual tracker: **Order Placed** ➔ **Preparing Food** ➔ **Out for Delivery** ➔ **Delivered**.
- Periodic polling updates order status in real time when modified by administrators.

### 7. Customer Reviews & Feedback
- Verified customers can rate (1 to 5 stars) and review completed, delivered meals.
- Prevents duplicate reviews per order.
- Dynamically updates food dish average rating and review counts.

### 8. Executive Admin Dashboard
- **KPI Metrics:** Total Revenue, Total Orders, Registered Diners, Active Menu Dishes.
- **Status Pipeline:** Real-time counts of pending, preparing, out for delivery, and delivered orders.
- **Manage Food:** Add, edit, delete dishes, toggle stock availability, upload photos.
- **Manage Combos:** Bundle dishes, configure savings, toggle status.
- **Manage Orders:** Change live statuses with immediate customer synchronization.
- **Manage Customers:** View customer database with lifetime spending.
- **Sales Reports:** Daily revenue graphs, top-selling dishes, and order status breakdown.

---

## 🎨 Premium Visual Identity & Design Tokens

Built around an artisanal, warm culinary color palette:
- **Cream (`#F7F5EF`):** Clean, inviting background surfaces
- **Terracotta (`#E87945`):** Primary action buttons, badges, highlights
- **Forest (`#315541`):** Secondary buttons, icons, trustworthy accents
- **Gold (`#D6AE62`):** Ratings, combo savings, budget highlights
- **Sage (`#78966B`):** Vegetarian indicators, status tags
- **Plum (`#332940`):** Bold headlines, primary brand typography, admin sidebar

---

## 📁 Project Architecture

```
budgetbite/
│
├── frontend/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx & Navbar.css
│   │   │   ├── Footer.jsx & Footer.css
│   │   │   ├── FoodCard.jsx & FoodCard.css
│   │   │   ├── ComboCard.jsx & ComboCard.css
│   │   │   └── AdminRoute.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx & HomePage.css
│   │   │   ├── MenuPage.jsx & MenuPage.css
│   │   │   ├── BudgetPlannerPage.jsx & BudgetPlannerPage.css (STAR USP)
│   │   │   ├── CombosPage.jsx & CombosPage.css
│   │   │   ├── CraveMatchPage.jsx & CraveMatchPage.css
│   │   │   ├── CartPage.jsx & CartPage.css
│   │   │   ├── CheckoutPage.jsx & CheckoutPage.css
│   │   │   ├── TrackOrderPage.jsx & TrackOrderPage.css
│   │   │   ├── OrdersPage.jsx & OrdersPage.css
│   │   │   ├── ProfilePage.jsx & ProfilePage.css
│   │   │   ├── LoginPage.jsx, RegisterPage.jsx & Auth.css
│   │   │   └── admin/
│   │   │       ├── AdminLayout.jsx & Admin.css
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── AdminFoods.jsx
│   │   │       ├── AdminCategories.jsx
│   │   │       ├── AdminCombos.jsx
│   │   │       ├── AdminOrders.jsx
│   │   │       ├── AdminCustomers.jsx
│   │   │       ├── AdminReviews.jsx
│   │   │       └── AdminReports.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── CartContext.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── styles/
│   │   │   ├── variables.css
│   │   │   └── global.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   ├── .env.example
│   ├── vite.config.js
│   └── package.json
│
├── backend/
│   ├── config/
│   │   └── db.js (MySQL2 connection pool)
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── foodController.js
│   │   ├── categoryController.js
│   │   ├── comboController.js
│   │   ├── orderController.js
│   │   ├── profileController.js
│   │   ├── customerController.js
│   │   ├── reviewController.js
│   │   └── adminController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── foodRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── comboRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── profileRoutes.js
│   │   ├── customerRoutes.js
│   │   ├── reviewRoutes.js
│   │   └── adminRoutes.js
│   ├── middleware/
│   │   ├── auth.js (JWT validation & Role-based access)
│   │   ├── errorHandler.js
│   │   └── upload.js (Multer)
│   ├── utils/
│   │   └── orderUtils.js
│   ├── uploads/
│   ├── test_integration.js (Complete 26-step automated test suite)
│   ├── server.js
│   ├── .env
│   ├── .env.example
│   └── package.json
│
├── database/
│   └── database.sql (Complete MySQL schema & initial seed data)
│
├── package.json (Root orchestrator)
├── .gitignore
└── README.md
```

---

## 🛠️ Step-by-Step Windows & XAMPP Setup Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ or v20+)
- [XAMPP for Windows](https://www.apachefriends.org/) (with Apache and MySQL)

### Step 1: Start XAMPP MySQL
1. Open the **XAMPP Control Panel**.
2. Click **Start** next to **MySQL** (and optionally **Apache** if you want to use phpMyAdmin via browser).
3. Verify MySQL is running on default port `3306`.

### Step 2: Import the Database
#### Option A: Via phpMyAdmin (Browser)
1. Open `http://localhost/phpmyadmin` in your browser.
2. Click the **Import** tab at the top.
3. Choose the file located at:
   ```
   D:\budgetbite\database\database.sql
   ```
4. Click **Go** / **Import**. The `budgetbite` database will be created with all 9 tables and initial seed data.

#### Option B: Via Command Prompt / PowerShell
Run:
```powershell
Get-Content database/database.sql -Raw | & "C:\xampp\mysql\bin\mysql.exe" -u root
```

---

## 🚀 Running the Application

### 1. Backend Server (Port 5000)
Open a terminal in the root directory:
```powershell
cd backend
npm install
npm start
```
*The backend server will start on `http://localhost:5000` and confirm connection to MySQL.*

### 2. Frontend Application (Port 5173)
Open a second terminal in the root directory:
```powershell
cd frontend
npm install
npm run dev
```
*The React application will open on `http://localhost:5173`.*

---

## 🔑 Default Credentials

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@budgetbite.com` | `Admin@123` | Full access to Admin Console, order management, menus, reports |
| **Customer** | `customer@budgetbite.com` | `Customer@123` | Ordering, Budget Planner, order tracking, personal reviews |

> **Pro-Tip:** The login page features 1-click **"Fill Customer"** and **"Fill Admin"** quick buttons for instant testing without manual typing.

---

## 🧪 Comprehensive Automated Testing

BudgetBite includes a standalone 26-step automated test suite that validates every REST API endpoint, database query, role-based permission check, transaction, and edge case against MySQL.

To run the test suite:
```powershell
node backend/test_integration.js
```

### Verified Test Suite Results (26/26 Passed):
- `[PASS]` 1. Server Health Check online
- `[PASS]` 2. Customer Login successful
- `[PASS]` 3. Admin Login & Role Verification
- `[PASS]` 4. Customer Registration endpoint
- `[PASS]` 5. Food Menu loaded from MySQL (16 items)
- `[PASS]` 6. Food Search for "Fried Rice" works
- `[PASS]` 7. Category Filter (Rice) works
- `[PASS]` 8. Vegetarian Filter works
- `[PASS]` 9. Combos retrieved with item breakdowns & savings
- `[PASS]` 10. Crave Match tag query works (8 spicy dishes found)
- `[PASS]` 11. Transactional Order Creation
- `[PASS]` 12. Backend Price Validation accurate: Grand Total is ₹210
- `[PASS]` 13. Live Order Tracking by BB-OrderNumber
- `[PASS]` 14. Customer My Orders history includes new order
- `[PASS]` 15. Admin updates status to "Preparing Food"
- `[PASS]` 16. Admin updates status to "Out for Delivery"
- `[PASS]` 17. Admin updates status to "Delivered"
- `[PASS]` 18. Customer Tracking reflects updated "Delivered" status
- `[PASS]` 19. Customer review submitted on eligible delivered order
- `[PASS]` 20. Duplicate review correctly prevented (409 Conflict)
- `[PASS]` 21. Admin Dashboard KPI Statistics
- `[PASS]` 22. Admin Reports & Best Selling Foods
- `[PASS]` 23. Admin adds new food dish
- `[PASS]` 24. Admin toggles food availability to Sold Out
- `[PASS]` 25. Admin deletes test food dish
- `[PASS]` 26. Customer adds and saves new address in profile

---

## 🛒 End-to-End User Flow Demonstration

1. **Visit Home Page (`http://localhost:5173`):**
   - Enter ₹200 in the hero quick budget bar and click **Plan My Meal**.
2. **Interact with the Smart Budget Planner:**
   - Watch the remaining balance update as you add Chicken Fried Rice (₹130) and French Fries (₹50).
   - Total planned: ₹180 | Remaining: ₹20.
   - Notice the system dynamically recommends items fitting ₹20 (e.g. extra dip or Cool Drinks).
   - Click **"Add Entire Meal to Cart"**.
3. **Cart & Checkout:**
   - Verify item quantities in the cart, click **Proceed to Checkout**.
   - Fill delivery address or select a saved address.
   - Choose **Cash on Delivery** and click **Confirm & Place Order**.
4. **Live Order Tracking:**
   - Immediately redirect to `/track-order/BB-XXXXXXXX-XXXX`.
   - Observe live progress tracker at **Order Placed**.
5. **Admin Status Update:**
   - Log into `/admin` using `admin@budgetbite.com` / `Admin@123`.
   - Navigate to **Orders**, locate the order, and switch status to **Preparing Food** or **Out for Delivery**.
   - Switch back to the customer tracking tab — within seconds, the customer's page automatically updates to the new status via periodic synchronization!
6. **Submit Rating & Review:**
   - Once marked **Delivered**, open **My Orders** as customer and submit a 5-star rating with review feedback.
   - Observe the updated review in the Admin **Reviews** console.

---

## 📜 License
Developed with culinary passion for BudgetBite Technologies. ISC License.
