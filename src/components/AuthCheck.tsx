
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { AlertCircle, Home, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";

interface AuthCheckProps {
  children: React.ReactNode;
}

export function AuthCheck({ children }: AuthCheckProps) {
  const { user, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-artcraft-muted/50 mb-4"></div>
          <div className="h-4 w-48 bg-artcraft-muted/50 rounded"></div>
        </div>
      </div>
    );
  }
  
  // If not logged in, show message and redirect button
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-artcraft-muted/20">
        <Header onToggleSidebar={() => {}} />
        
        <div className="flex-grow flex items-center justify-center px-4 py-16">
          <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-xl p-8 border border-artcraft-muted/20 text-center max-w-lg w-full">
            <AlertCircle className="h-16 w-16 text-artcraft-accent mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-artcraft-primary mb-3">Authentication Required</h2>
            <p className="text-artcraft-secondary mb-8">
              You need to be logged in to access this feature. Please sign in or create an account to continue.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/">
                <Button variant="outline" className="w-full sm:w-auto">
                  <Home className="mr-2 h-4 w-4" />
                  Return Home
                </Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-artcraft-accent hover:bg-artcraft-accent/90 w-full sm:w-auto">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In / Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        <footer className="border-t border-artcraft-muted/50 py-6 bg-white/50">
          <div className="container text-center">
            <p className="text-sm text-artcraft-secondary">
              &copy; {new Date().getFullYear()} r/ArtCraft — All rights reserved
            </p>
          </div>
        </footer>
      </div>
    );
  }

  // If authenticated, render children
  return <>{children}</>;
}
