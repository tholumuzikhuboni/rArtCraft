
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Lock, User as UserIcon, Heart } from "lucide-react";
import { Navigate } from "react-router-dom";
import { Header } from "@/components/Header";

export default function Auth() {
  const { user, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Redirect if user is logged in
  if (user && !isLoading) {
    return <Navigate to="/" />;
  }
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-artcraft-muted/20">
      <Header onToggleSidebar={toggleSidebar} />
      
      <div className="flex-grow container max-w-md mx-auto pt-32 pb-16">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-3">
            Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-artcraft-accent to-orange-400">r/ArtCraft</span>
          </h1>
          <p className="text-artcraft-secondary">
            Sign in to save your artwork and collaborate with others
          </p>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-xl p-8 border border-artcraft-muted/20">
          <AuthTabs />
        </div>
      </div>
      
      <footer className="border-t border-artcraft-muted/50 py-6 bg-white/50">
        <div className="container text-center">
          <p className="text-sm text-artcraft-secondary">
            &copy; {new Date().getFullYear()} r/ArtCraft — Made with <Heart className="h-3 w-3 inline text-red-500" /> for Reddit Hackathon
          </p>
        </div>
      </footer>
    </div>
  );
}

function AuthTabs() {
  return (
    <Tabs defaultValue="signin" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="signin">Sign In</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>
      
      <TabsContent value="signin">
        <SignInForm />
      </TabsContent>
      
      <TabsContent value="signup">
        <SignUpForm />
      </TabsContent>
    </Tabs>
  );
}

function SignInForm() {
  const { signIn, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn(email, password);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-artcraft-primary">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-artcraft-secondary" />
          <Input 
            id="email" 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password" className="text-artcraft-primary">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-artcraft-secondary" />
          <Input 
            id="password" 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="pl-10"
          />
        </div>
      </div>
      
      <Button type="submit" className="w-full bg-artcraft-accent hover:bg-artcraft-accent/90" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
            Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  );
}

function SignUpForm() {
  const { signUp, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signUp(email, password, username);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username" className="text-artcraft-primary">Username</Label>
        <div className="relative">
          <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-artcraft-secondary" />
          <Input 
            id="username" 
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="artlover123"
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email-signup" className="text-artcraft-primary">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-artcraft-secondary" />
          <Input 
            id="email-signup" 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password-signup" className="text-artcraft-primary">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-artcraft-secondary" />
          <Input 
            id="password-signup" 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            minLength={6}
            className="pl-10"
          />
        </div>
      </div>
      
      <Button type="submit" className="w-full bg-artcraft-accent hover:bg-artcraft-accent/90" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
            Creating account...
          </>
        ) : (
          "Sign Up"
        )}
      </Button>
    </form>
  );
}
