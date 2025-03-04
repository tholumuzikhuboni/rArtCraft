
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthCheck } from "@/components/AuthCheck";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import Gallery from "./pages/Gallery";
import Communities from "./pages/Communities";
import Challenges from "./pages/Challenges";
import Leaderboard from "./pages/Leaderboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={
              <AuthCheck>
                <Profile />
              </AuthCheck>
            } />
            <Route path="/user/:userId" element={<UserProfile />} />
            <Route path="/gallery" element={
              <AuthCheck>
                <Gallery />
              </AuthCheck>
            } />
            <Route path="/communities" element={
              <AuthCheck>
                <Communities />
              </AuthCheck>
            } />
            <Route path="/challenges" element={
              <AuthCheck>
                <Challenges />
              </AuthCheck>
            } />
            <Route path="/leaderboard" element={
              <AuthCheck>
                <Leaderboard />
              </AuthCheck>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
