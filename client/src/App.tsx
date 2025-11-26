import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CartProvider } from "@/contexts/CartContext";
import { AdminGuard } from "@/components/admin/AdminGuard";

// Store Pages
import Home from "@/pages/Home";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Categories from "@/pages/Categories";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";

// Courier App
import CourierApp from "@/pages/CourierApp";
import CourierBalance from "@/pages/CourierBalance";

// Admin Pages
import Admin from "@/pages/Admin";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminProducts from "@/pages/admin/Products";
import AdminOrders from "@/pages/admin/Orders";
import AdminCustomers from "@/pages/admin/Customers";
import AdminPromoCodes from "@/pages/admin/PromoCodes";
import AdminRassilka from "@/pages/admin/Rassilka";
import AdminSettings from "@/pages/admin/Settings";
import AdminCouriers from "@/pages/admin/Couriers";
import AdminBanners from "@/pages/admin/Banners";

import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* Courier Routes */}
      <Route path="/courier" component={CourierBalance} />
      <Route path="/courier/dashboard" component={CourierApp} />

      {/* Store Routes */}
      <Route path="/" component={Home} />
      <Route path="/products" component={Products} />
      <Route path="/products/:slug" component={ProductDetail} />
      <Route path="/categories" component={Categories} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />

      {/* Admin Routes */}
      <Route path="/admin" component={Admin} />
      <Route
        path="/admin/dashboard"
        component={() => (
          <AdminGuard>
            <AdminDashboard />
          </AdminGuard>
        )}
      />
      <Route
        path="/admin/products"
        component={() => (
          <AdminGuard>
            <AdminProducts />
          </AdminGuard>
        )}
      />
      <Route
        path="/admin/products/new"
        component={() => (
          <AdminGuard>
            <AdminProducts />
          </AdminGuard>
        )}
      />
      <Route
        path="/admin/orders"
        component={() => (
          <AdminGuard>
            <AdminOrders />
          </AdminGuard>
        )}
      />
      <Route
        path="/admin/customers"
        component={() => (
          <AdminGuard>
            <AdminCustomers />
          </AdminGuard>
        )}
      />
      <Route
        path="/admin/couriers"
        component={() => (
          <AdminGuard>
            <AdminCouriers />
          </AdminGuard>
        )}
      />
      <Route
        path="/admin/promo-codes"
        component={() => (
          <AdminGuard>
            <AdminPromoCodes />
          </AdminGuard>
        )}
      />
      <Route
        path="/admin/rassilka"
        component={() => (
          <AdminGuard>
            <AdminRassilka />
          </AdminGuard>
        )}
      />
      <Route
        path="/admin/banners"
        component={() => (
          <AdminGuard>
            <AdminBanners />
          </AdminGuard>
        )}
      />
      <Route
        path="/admin/settings"
        component={() => (
          <AdminGuard>
            <AdminSettings />
          </AdminGuard>
        )}
      />

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </CartProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
