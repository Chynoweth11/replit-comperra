import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
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
import { ProfessionalNetwork } from "@/components/ProfessionalNetwork";
import { ToastProvider } from "@/context/ToastContext";

function Router() {
  return (
    <>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/comparison/:category" component={Comparison} />
        <Route path="/product/:id" component={ProductDetail} />
        <Route path="/article/:id" component={ArticleDetail} />
        <Route path="/compare" component={ProductCompare} />
        <Route path="/product-compare" component={ProductCompare} />
        <Route path="/admin/import" component={DataImport} />
        <Route path="/categories" component={Categories} />
        <Route path="/brands" component={Brands} />
        <Route path="/vendors" component={Vendors} />
        <Route path="/professionals" component={ProfessionalNetwork} />
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
        <Route path="/dashboard">
          {() => (
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="*" component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
