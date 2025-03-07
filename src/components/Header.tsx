import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Download, Info, Menu, LogIn, UserCircle, LogOut, Image, Users, Trophy, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';

interface HeaderProps {
  onExport?: () => void;
  onToggleSidebar?: () => void;
}

export const Header = ({ onExport, onToggleSidebar }: HeaderProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const { user, profile, signOut } = useAuth();
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const getAvatarUrl = () => {
    if (!profile?.avatar_url) return undefined;
    
    return supabase.storage
      .from('avatars')
      .getPublicUrl(profile.avatar_url)
      .data.publicUrl;
  };
  
  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-20 transition-all duration-300 shadow-md",
      scrolled 
        ? "py-2 bg-white/90 backdrop-blur-md" 
        : "py-4 bg-white/95"
    )}>
      <div className="container flex justify-between items-center">
        <div className="flex items-center">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="mr-3 w-8 h-8 rounded-full flex items-center justify-center text-artcraft-primary hover:bg-artcraft-muted transition-colors"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-artcraft-accent to-orange-300">
            r/ArtCraft
          </Link>
          <div className="h-6 w-px bg-artcraft-muted mx-4 hidden md:block"></div>
          
          <nav className="hidden md:flex items-center space-x-1">
            <Link 
              to="/gallery" 
              className="px-3 py-2 rounded-md text-sm text-artcraft-secondary hover:text-artcraft-primary hover:bg-artcraft-muted/50 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Image className="h-4 w-4" />
                <span>Gallery</span>
              </span>
            </Link>
            
            <Link 
              to="/communities" 
              className="px-3 py-2 rounded-md text-sm text-artcraft-secondary hover:text-artcraft-primary hover:bg-artcraft-muted/50 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                <span>Communities</span>
              </span>
            </Link>
            
            <Link 
              to="/challenges" 
              className="px-3 py-2 rounded-md text-sm text-artcraft-secondary hover:text-artcraft-primary hover:bg-artcraft-muted/50 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Trophy className="h-4 w-4" />
                <span>Challenges</span>
              </span>
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-2">
          {onExport && (
            <button
              onClick={onExport}
              className="px-3 py-1.5 rounded-lg flex items-center gap-1.5 bg-artcraft-muted hover:bg-artcraft-muted/80 text-artcraft-primary text-sm transition-colors hover:shadow-sm"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}
          
          {!user ? (
            <Link
              to="/auth"
              className="px-3 py-1.5 rounded-lg flex items-center gap-1.5 bg-artcraft-accent hover:bg-artcraft-accent/90 text-white text-sm transition-colors hover:shadow-sm"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Sign In</span>
            </Link>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 hover:bg-artcraft-muted/50 rounded-full p-1 transition-colors">
                  <Avatar className="h-8 w-8 border border-artcraft-muted">
                    <AvatarImage src={getAvatarUrl()} />
                    <AvatarFallback className="bg-artcraft-accent text-white text-xs">
                      {profile?.username?.substring(0, 2).toUpperCase() || user.email?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-artcraft-primary hidden sm:block">
                    {profile?.username || user.email?.split('@')[0]}
                  </span>
                </button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2 border-b border-artcraft-muted/30">
                  <p className="font-medium text-artcraft-primary text-sm">{user.email}</p>
                  {profile?.username && <p className="text-xs text-artcraft-secondary">@{profile.username}</p>}
                </div>
                
                <Link to="/profile">
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="h-4 w-4 mr-2" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                </Link>
                
                <Link to="/gallery">
                  <DropdownMenuItem className="cursor-pointer">
                    <Image className="h-4 w-4 mr-2" />
                    <span>My Gallery</span>
                  </DropdownMenuItem>
                </Link>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  className="cursor-pointer text-red-500 focus:text-red-500"
                  onClick={() => signOut()}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-artcraft-primary hover:bg-artcraft-muted transition-colors"
            title="Information"
          >
            <Info className="h-4 w-4" />
          </button>
          
          {showInfo && (
            <div className="absolute top-full right-4 mt-2 glass rounded-lg p-4 max-w-xs animate-scale-in">
              <h3 className="font-medium text-artcraft-primary mb-2">About r/ArtCraft</h3>
              <p className="text-sm text-artcraft-secondary mb-3">
                A collaborative canvas where users can create art together in real-time.
                Draw, erase, and save your creations.
              </p>
              <button
                onClick={() => setShowInfo(false)}
                className="text-xs text-artcraft-accent hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
