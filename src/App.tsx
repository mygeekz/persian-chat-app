import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster as HotToaster } from 'react-hot-toast';
import { AppProvider } from './context/AppContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Login } from "./pages/Login";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ChatAgent } from "./pages/ChatAgent";
import { TasksKanban } from "./pages/TasksKanban";
import { FilesPage } from "./pages/FilesPage";
import { Settings } from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HotToaster 
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: 'Vazirmatn, sans-serif',
              direction: 'rtl'
            }
          }}
        />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><ChatAgent /></ProtectedRoute>} />
            <Route path="/tasks" element={<ProtectedRoute><TasksKanban /></ProtectedRoute>} />
            <Route path="/files" element={<ProtectedRoute><FilesPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
