import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Dashboard from "@/pages/Dashboard";
import PatientDetails from "@/pages/PatientDetails";
import MedicationAdmin from "@/pages/MedicationAdmin";
import Alerts from "@/pages/Alerts";
import ISBARPage from "@/pages/ISBARPage";
import VitalSignsEntry from "@/pages/VitalSignsEntry";
import Navbar from "@/components/Navbar";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { signalRService } from "../lib/signalr";

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/alerts" element={<Alerts />} />
      <Route path="/patient/:id" element={<PatientDetails />} />
      <Route
        path="/patient/:id/medication/:medicationId"
        element={<MedicationAdmin />}
      />
      <Route path="/patient/:id/isbar" element={<ISBARPage />} />
      <Route path="/patient/:id/vitals" element={<VitalSignsEntry />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  useEffect(() => {
    signalRService.start();
    return () => signalRService.stop();
  }, []);

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ThemeProvider defaultTheme="light" switchable={true}>
          <TooltipProvider>
            <Navbar />
            <AppRouter />
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
