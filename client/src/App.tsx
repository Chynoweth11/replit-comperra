import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider as SupabaseAuthProvider } from "@/contexts/SupabaseAuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import CategoryNav from "@/components/category-nav";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Comparison from "@/pages/comparison";
import ProductDetail from "@/pages/product-detail";
import ArticleDetail from "@/pages/article-detail";
import ProductCompare from "@/pages/product-compare";
import DataImport from "@/pages/data-import";
import Categories from "@/pages/categories";
import Brands from "@/pages/brands";
import Specs from "@/pages/specs";
import Pricing from "@/pages/pricing";
import BuyingGuides from "@/pages/buying-guides";
import Installation from "@/pages/installation";
import FAQ from "@/pages/faq";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import Press from "@/pages/press";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import DataUsage from "@/pages/data-usage";
import Cookies from "@/pages/cookies";
import Vendors from "@/pages/vendors";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import CustomerDashboard from "@/pages/CustomerDashboard";
import VendorDashboardPage from "@/pages/vendor-dashboard";
import TradeDashboardPage from "@/pages/trade-dashboard";
import VendorDashboard from "@/pages/VendorDashboard";
import TradeDashboard from "@/pages/TradeDashboard";
import RegistrationPage from "@/pages/RegistrationPage";
import VendorLeads from "@/pages/vendor/leads";
import TradeLeads from "@/pages/trade/leads";
import QuotesPage from "@/pages/quotes";
import ProfilePage from "@/pages/profile";
import DashboardLeads from "@/pages/dashboard-leads";
import DashboardProducts from "@/pages/dashboard-products";
import DashboardSubscription from "@/pages/dashboard-subscription";
import DashboardSettings from "@/pages/dashboard-settings";
import DashboardMyLeads from "@/pages/dashboard-my-leads";
import DashboardCurrentLeads from "@/pages/dashboard-current-leads";
import DashboardPotentialLeads from "@/pages/dashboard-potential-leads";
import DashboardLeadsHistory from "@/pages/dashboard-leads-history";
import { ProfessionalNetwork } from "@/components/ProfessionalNetwork";
import SupabaseAuthPage from "@/pages/auth";
import SupabaseProfilePage from "@/pages/supabase-profile";
import EnhancedAdminDashboard from "@/pages/enhanced-admin-dashboard";
import { ToastProvider } from "@/context/ToastContext";

function Router() {
  return (
    <>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/comparison" component={Categories} />
        <Route path="/comparison/:category" component={Comparison} />
        <Route path="/product/:id" component={ProductDetail} />
        <Route path="/article/:id" component={ArticleDetail} />
        <Route path="/compare" component={ProductCompare} />
        <Route path="/product-compare" component={ProductCompare} />
        <Route path="/admin/import" component={DataImport} />
        <Route path="/admin/enhanced" component={EnhancedAdminDashboard} />
        <Route path="/categories" component={Categories} />
        <Route path="/brands" component={Brands} />
        <Route path="/vendors" component={Vendors} />
        <Route path="/professionals" component={() => <ProfessionalNetwork />} />
        <Route path="/professionals/customer" component={() => <ProfessionalNetwork skipToCustomer={true} />} />
        <Route path="/professionals/register" component={() => <ProfessionalNetwork skipToProfessional={true} />} />
        <Route path="/professional-network" component={() => <ProfessionalNetwork />} />
        {/* Firebase components removed - using Supabase only */}
        <Route path="/supabase-auth" component={SupabaseAuthPage} />
        <Route path="/supabase-profile" component={SupabaseProfilePage} />
        <Route path="/standalone-auth" component={() => window.location.href = '/index.html'} />
        <Route path="/standalone-profile" component={() => window.location.href = '/profile.html'} />
        {/* Firebase auth routes removed */}
        <Route path="/specs" component={Specs} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/buying-guides" component={BuyingGuides} />
        <Route path="/installation" component={Installation} />
        <Route path="/faq" component={FAQ} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/press" component={Press} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />
        <Route path="/data-usage" component={DataUsage} />
        <Route path="/cookies" component={Cookies} />
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/registration" component={RegistrationPage} />
        <Route path="/vendor-dashboard">
          {() => (
            <ProtectedRoute requiredRole="vendor">
              <VendorDashboard />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/trade-dashboard">
          {() => (
            <ProtectedRoute requiredRole="trade">
              <TradeDashboard />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/dashboard">
          {() => (
            <ProtectedRoute>
              <CustomerDashboard />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/dashboard/leads">
          {() => (
            <ProtectedRoute>
              <DashboardLeads />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/dashboard/products">
          {() => (
            <ProtectedRoute>
              <DashboardProducts />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/dashboard/subscription">
          {() => (
            <ProtectedRoute>
              <DashboardSubscription />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/dashboard/settings">
          {() => (
            <ProtectedRoute>
              <DashboardSettings />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/dashboard/my-leads">
          {() => (
            <ProtectedRoute>
              <DashboardMyLeads />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/dashboard/current-leads">
          {() => (
            <ProtectedRoute>
              <DashboardCurrentLeads />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/dashboard/potential-leads">
          {() => (
            <ProtectedRoute>
              <DashboardPotentialLeads />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/dashboard/leads-history">
          {() => (
            <ProtectedRoute>
              <DashboardLeadsHistory />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/vendor-dashboard">
          {() => (
            <ProtectedRoute>
              <VendorDashboardPage />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/trade-dashboard">
          {() => (
            <ProtectedRoute>
              <TradeDashboardPage />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/vendor/leads">
          {() => (
            <ProtectedRoute>
              <VendorLeads />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/trade/leads">
          {() => (
            <ProtectedRoute>
              <TradeLeads />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/quotes">
          {() => (
            <ProtectedRoute>
              <QuotesPage />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/profile">
          {() => (
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          )}
        </Route>
        {/* Removed Firebase-only components */}
        <Route path="*" component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <SupabaseAuthProvider>
          <TooltipProvider>
            <div style={{ direction: 'ltr', textAlign: 'left' }}>
              <Toaster />
              <Router />
            </div>
          </TooltipProvider>
        </SupabaseAuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
