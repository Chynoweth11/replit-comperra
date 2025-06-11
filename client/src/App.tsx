import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Comparison from "@/pages/comparison";
import ProductDetail from "@/pages/product-detail";
import ProductCompare from "@/pages/product-compare";
import DataImport from "@/pages/data-import";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/comparison/:category?" component={Comparison} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/compare" component={ProductCompare} />
      <Route path="/admin/import" component={DataImport} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
