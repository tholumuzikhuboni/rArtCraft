
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Download, Info, Menu, LogIn, UserCircle, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onExport?: () => void;
  onToggleSidebar?: () => void;
}

export const Header = ({ onExport, onToggleSidebar }: HeaderProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, signOut } = useAuth();
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const handleUserMenuToggle = () => {
    setShowUserMenu(!showUserMenu);
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
          <div className="h-6 w-px bg-artcraft-muted mx-4"></div>
          <p className="text-sm text-artcraft-secondary hidden sm:block">
            Collaborative Canvas
          </p>
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
            <div className="relative">
              <button
                onClick={handleUserMenuToggle}
                className="w-8 h-8 rounded-full flex items-center justify-center text-artcraft-primary hover:bg-artcraft-muted transition-colors"
                title="User menu"
              >
                <UserCircle className="h-5 w-5" />
              </button>
              
              {showUserMenu && (
                <div className="absolute top-full right-0 mt-1 glass rounded-lg p-2 w-48 animate-scale-in z-30 shadow-lg">
                  <div className="px-3 py-2 border-b border-artcraft-muted/30">
                    <p className="font-medium text-artcraft-primary text-sm">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      signOut();
                      setShowUserMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left flex items-center gap-2 text-sm text-artcraft-secondary hover:bg-artcraft-muted/50 rounded-md transition-colors mt-1"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
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
};
