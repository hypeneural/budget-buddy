import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import QuotesList from "./pages/QuotesList";
import QuoteDetail from "./pages/QuoteDetail";
import NewQuote from "./pages/NewQuote";
import SuppliersList from "./pages/SuppliersList";
import WhatsAppInstances from "./pages/WhatsAppInstances";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();
const baseUrl =
  import.meta.env.BASE_URL === "/"
    ? "/"
    : import.meta.env.BASE_URL.replace(/\/$/, "");

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename={baseUrl}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quotes"
              element={
                <ProtectedRoute>
                  <QuotesList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quotes/new"
              element={
                <ProtectedRoute>
                  <NewQuote />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quotes/:id"
              element={
                <ProtectedRoute>
                  <QuoteDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/suppliers"
              element={
                <ProtectedRoute>
                  <SuppliersList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/whatsapp"
              element={
                <ProtectedRoute>
                  <WhatsAppInstances />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
