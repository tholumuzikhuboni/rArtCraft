.
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Palette, Users, Trophy, LayoutGrid, User, Image } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  const { user } = useAuth();
  const location = useLocation();
  const [activeChallenge, setActiveChallenge] = useState<{
    id: string;
    title: string;
    description: string;
    days_remaining: number;
  } | null>(null);

  useEffect(() => {
    fetchActiveChallenge();
  }, []);

  const fetchActiveChallenge = async () => {
    try {
      const now = new Date();
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true)
        .gt('end_date', now.toISOString())
        .order('end_date', { ascending: true })
        .limit(1)
        .single();
      
      if (error) {
        if (error.code !== 'PGRST116') { // Not found error
          console.error('Error fetching challenge:', error);
        }
        return;
      }
      
      // Calculate days remaining
      const endDate = new Date(data.end_date);
      const diffTime = endDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      setActiveChallenge({
        id: data.id,
        title: data.title,
        description: data.description,
        days_remaining: diffDays > 0 ? diffDays : 0
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div 
      className={cn(
        "fixed left-0 top-0 h-full bg-white z-10 shadow-lg transition-all duration-300 pt-20",
        isOpen ? "w-64" : "w-0 overflow-hidden"
      )}
    >
      <button
        onClick={onToggle}
        className="absolute -right-4 top-24 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md border border-gray-100"
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isOpen ? <ChevronLeft className="h-5 w-5 text-artcraft-primary" /> : <ChevronRight className="h-5 w-5 text-artcraft-primary" />}
      </button>
      
      <div className="p-4">
        <h2 className="font-bold text-lg mb-6 text-artcraft-primary">Menu</h2>
        
        <nav className="flex flex-col gap-2">
          <Link 
            to="/" 
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-artcraft-muted text-artcraft-primary transition-colors",
              isActive('/') && "bg-artcraft-muted/70 font-medium"
            )}
          >
            <Palette className="h-5 w-5 text-artcraft-accent" />
            <span>Your Canvas</span>
          </Link>
          
          <Link 
            to="/gallery" 
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-artcraft-muted text-artcraft-primary transition-colors",
              isActive('/gallery') && "bg-artcraft-muted/70 font-medium"
            )}
          >
            <Image className="h-5 w-5 text-artcraft-accent" />
            <span>Gallery</span>
          </Link>
          
          <Link 
            to="/communities" 
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-artcraft-muted text-artcraft-primary transition-colors",
              isActive('/communities') && "bg-artcraft-muted/70 font-medium"
            )}
          >
            <Users className="h-5 w-5 text-artcraft-accent" />
            <span>Communities</span>
          </Link>
          
          <Link 
            to="/challenges" 
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-artcraft-muted text-artcraft-primary transition-colors",
              isActive('/challenges') && "bg-artcraft-muted/70 font-medium"
            )}
          >
            <Trophy className="h-5 w-5 text-artcraft-accent" />
            <span>Challenges</span>
          </Link>
          
          <Link 
            to="/leaderboard" 
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-artcraft-muted text-artcraft-primary transition-colors",
              isActive('/leaderboard') && "bg-artcraft-muted/70 font-medium"
            )}
          >
            <LayoutGrid className="h-5 w-5 text-artcraft-accent" />
            <span>Leaderboard</span>
          </Link>
          
          {user && (
            <Link 
              to="/profile" 
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-artcraft-muted text-artcraft-primary transition-colors",
                isActive('/profile') && "bg-artcraft-muted/70 font-medium"
              )}
            >
              <User className="h-5 w-5 text-artcraft-accent" />
              <span>Profile</span>
            </Link>
          )}
        </nav>
        
        {activeChallenge && (
          <div className="mt-8 p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
            <h3 className="font-medium text-artcraft-primary mb-2">Weekly Challenge</h3>
            <p className="text-sm text-artcraft-secondary mb-3">
              {activeChallenge.title}
            </p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-artcraft-primary/70">
                {activeChallenge.days_remaining} days left
              </span>
              <Link to={`/challenges/${activeChallenge.id}`} className="text-xs font-medium text-artcraft-accent hover:underline">
                Join Challenge
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
