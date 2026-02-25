import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import NurseDashboard from "./pages/NurseDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import PharmacyDashboard from "./pages/PharmacyDashboard";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children, role }) => {
  const { user, token } = useAuth();

  if (!token) return <Navigate to="/login" replace />;

  if (role && user?.role !== role) {
    // If user tries to access wrong dashboard, redirect to their own if possible, or 404/Login
    // For simplicity redirect to login or show alert (but inside render we redirect)
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner position="top-right" richColors closeButton />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route path="/nurse" element={
              <ProtectedRoute role="Nurse">
                <NurseDashboard />
              </ProtectedRoute>
            } />

            <Route path="/doctor" element={
              <ProtectedRoute role="Doctor">
                <DoctorDashboard />
              </ProtectedRoute>
            } />

            <Route path="/pharmacy" element={
              <ProtectedRoute role="Pharmacist">
                <PharmacyDashboard />
              </ProtectedRoute>
            } />

            {/* Default Route Logic */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
