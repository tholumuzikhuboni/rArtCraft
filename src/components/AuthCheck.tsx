
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

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
      <div className="container max-w-md mx-auto py-16">
        <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-xl p-8 border border-artcraft-muted/20 text-center">
          <AlertCircle className="h-12 w-12 text-artcraft-accent mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-artcraft-primary mb-2">Authentication Required</h2>
          <p className="text-artcraft-secondary mb-6">
            You need to be logged in to access this feature.
          </p>
          <Link to="/auth">
            <Button className="bg-artcraft-accent hover:bg-artcraft-accent/90">
              Sign In / Sign Up
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // If authenticated, render children
  return <>{children}</>;
}
