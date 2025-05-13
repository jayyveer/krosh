import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import Layout from './components/layout/Layout';
import Home from './screens/Home';
import Shop from './screens/Shop';
import Search from './screens/Search';
import Profile from './screens/Profile';
import Login from './screens/Login';
import Cart from './screens/Cart';
import Categories from './screens/Categories';
import ProductDetail from './screens/ProductDetail';
import Admin from './screens/Admin';
import AdminDebug from './screens/AdminDebug';
import NotFound from './screens/NotFound';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <div className="bg-krosh-background min-h-screen text-krosh-text font-sans">
            <AnimatePresence mode="wait">
              <Routes>
                {/* Login route outside of Layout */}
                <Route path="/login" element={<Login />} />

                {/* Routes with Layout (header, sidebar, bottom tabs) */}
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="shop" element={<Shop />} />
                  <Route path="search" element={<Search />} />
                  <Route path="categories" element={<Categories />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="cart" element={<Cart />} />
                  <Route path="product/:id" element={<ProductDetail />} />
                  <Route path="admin" element={<Admin />} />
                  <Route path="admin-debug" element={<AdminDebug />} />
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