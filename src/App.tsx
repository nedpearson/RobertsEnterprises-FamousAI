
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import BookAppointment from "./pages/BookAppointment";
import PayInvoice from "./pages/PayInvoice";
import SignContract from "./pages/SignContract";
import BridePortal from "./pages/BridePortal";
import NotFound from "./pages/NotFound";
import { CombinedOperationsCalendar } from "./pages/scheduling/CombinedOperationsCalendar";

import { VowosErrorBoundary } from "@/components/vowos/ErrorBoundary";

import { DemoProvider } from "@/lib/demo/demoContext";
import { DeviceModeProvider } from "@/contexts/DeviceModeContext";

const queryClient = new QueryClient();

const App = () => (
  <VowosErrorBoundary>
    <ThemeProvider defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <DeviceModeProvider>
              <DemoProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/book" element={<BookAppointment />} />
                  <Route path="/pay/:invoiceId" element={<PayInvoice />} />
                  <Route path="/sign/:contractId" element={<SignContract />} />
                  <Route path="/portal/:brideId" element={<BridePortal />} />
                  
                  {/* Canonical Scheduling Route */}
                  <Route path="/scheduling/unified" element={<CombinedOperationsCalendar />} />
                  
                  {/* Legacy scheduling routes — redirect to canonical */}
                  <Route path="/scheduling/calendar" element={<Navigate to="/scheduling/unified" replace />} />
                  <Route path="/scheduling/assignment-center" element={<Navigate to="/scheduling/unified" replace />} />
                  <Route path="/scheduling/appointments" element={<Navigate to="/scheduling/unified" replace />} />
                  <Route path="/booking-request" element={<Navigate to="/scheduling/unified" replace />} />

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </DemoProvider>
            </DeviceModeProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </VowosErrorBoundary>
);

export default App;
