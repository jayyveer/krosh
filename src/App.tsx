import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import Layout from './components/layout/Layout';
import AdminLayout from './components/admin/AdminLayout';
import Home from './screens/Home';
import Shop from './screens/Shop';
import Search from './screens/Search';
import Profile from './screens/Profile';
import Login from './screens/Login';
import Register from './screens/Register';
import ForgotPassword from './screens/ForgotPassword';
import ResetPassword from './screens/ResetPassword';
import Cart from './screens/Cart';
import Orders from './screens/Orders';
import Categories from './screens/Categories';
import ProductDetail from './screens/ProductDetail';
import AdminDashboard from './screens/admin/AdminDashboard';
import AdminProducts from './screens/admin/AdminProducts';
import AdminCategories from './screens/admin/AdminCategories';
import AdminUsers from './screens/admin/AdminUsers';
import AdminOrders from './screens/admin/AdminOrders';
import AdminSettings from './screens/admin/AdminSettings';
import AdminProductVariants from './screens/admin/AdminProductVariants';
import NotFound from './screens/NotFound';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <div className="bg-krosh-background min-h-screen text-krosh-text font-sans">
            <AnimatePresence mode="wait">
              <Routes>
                {/* Auth routes outside of Layout */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Admin routes with AdminLayout */}
                <Route path="/admin-access" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="products/:productId/variants" element={<AdminProductVariants />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="*" element={<NotFound />} />
                </Route>

                {/* Store routes with Layout (header, sidebar, bottom tabs) */}
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="shop" element={<Shop />} />
                  <Route path="search" element={<Search />} />
                  <Route path="categories" element={<Categories />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="cart" element={<Cart />} />
                  <Route path="orders" element={<Orders />} />
                  <Route path="product/:id" element={<ProductDetail />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </AnimatePresence>
          </div>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App