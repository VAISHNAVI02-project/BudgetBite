import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts & Guards
import Layout from './layouts/Layout';
import AdminLayout from './pages/admin/AdminLayout';
import AdminRoute from './components/AdminRoute';
import ProtectedRoute from './components/ProtectedRoute';

// Customer Pages
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import BudgetPlannerPage from './pages/BudgetPlannerPage';
import CombosPage from './pages/CombosPage';
import CraveMatchPage from './pages/CraveMatchPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import TrackOrderPage from './pages/TrackOrderPage';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminFoods from './pages/admin/AdminFoods';
import AdminCategories from './pages/admin/AdminCategories';
import AdminCombos from './pages/admin/AdminCombos';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminReviews from './pages/admin/AdminReviews';
import AdminReports from './pages/admin/AdminReports';

function App() {
  return (
    <Routes>
      {/* Public auth landing — guests cannot browse the storefront */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Customer storefront — JWT required for every nested route */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="menu" element={<MenuPage />} />
        <Route path="budget-planner" element={<BudgetPlannerPage />} />
        <Route path="combos" element={<CombosPage />} />
        <Route path="crave-match" element={<CraveMatchPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="track-order" element={<TrackOrderPage />} />
        <Route path="track-order/:orderId" element={<TrackOrderPage />} />
        <Route path="my-orders" element={<OrdersPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Admin console — admin role required */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="foods" element={<AdminFoods />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="combos" element={<AdminCombos />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="reports" element={<AdminReports />} />
      </Route>

      {/* Unknown paths → home (guests are then sent to login by ProtectedRoute) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
