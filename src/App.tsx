
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import BookAppointment from "./pages/BookAppointment";
import PayInvoice from "./pages/PayInvoice";
import SignContract from "./pages/SignContract";
import BridePortal from "./pages/BridePortal";
import NotFound from "./pages/NotFound";
import EmployeeScheduleCalendar from "./pages/scheduling/EmployeeScheduleCalendar";
import AssignmentCenter from "./pages/scheduling/AssignmentCenter";
import ConfirmedAppointments from "./pages/scheduling/ConfirmedAppointments";
import { CombinedOperationsCalendar } from "./pages/scheduling/CombinedOperationsCalendar";
import BookingRequestForm from "./pages/public/BookingRequestForm";

import { VowosErrorBoundary } from "@/components/vowos/ErrorBoundary";

import { DemoProvider } from "@/lib/demo/demoContext";

const queryClient = new QueryClient();

const App = () => (
  <VowosErrorBoundary>
    <ThemeProvider defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <DemoProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/book" element={<BookAppointment />} />
                  <Route path="/pay/:invoiceId" element={<PayInvoice />} />
                  <Route path="/sign/:contractId" element={<SignContract />} />
                  <Route path="/portal/:brideId" element={<BridePortal />} />
                  
                  {/* Scheduling Routes */}
                  <Route path="/scheduling/calendar" element={<EmployeeScheduleCalendar />} />
                  <Route path="/scheduling/assignment-center" element={<AssignmentCenter />} />
                  <Route path="/scheduling/appointments" element={<ConfirmedAppointments />} />
                  <Route path="/scheduling/unified" element={<CombinedOperationsCalendar />} />
                  <Route path="/booking-request" element={<BookingRequestForm />} />

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </DemoProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </VowosErrorBoundary>
);

export default App;
