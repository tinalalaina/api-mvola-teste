import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import RoleRoute from './components/RoleRoute'
import CartPage from './pages/CartPage'
import ClientDashboard from './pages/dashboards/ClientDashboard'
import AdminDashboard from './pages/dashboards/AdminDashboard'
import PrestataireDashboard from './pages/dashboards/PrestataireDashboard'
import Home from './pages/Home'
import Login from './pages/Login'
import OrdersPage from './pages/OrdersPage'
import Register from './pages/Register'
import SellerProducts from './pages/SellerProducts'
import Settings from './pages/Settings'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import './App.css'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard/client"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRole="CLIENT">
                <ClientDashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/prestataire"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRole="PRESTATAIRE">
                <PrestataireDashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRole="ADMIN">
                <AdminDashboard />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRole="CLIENT">
                <CartPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/products"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRole="PRESTATAIRE">
                <SellerProducts />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App
