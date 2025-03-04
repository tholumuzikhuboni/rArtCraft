
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Download, Info } from 'lucide-react';

interface HeaderProps {
  onExport?: () => void;
}

export const Header = ({ onExport }: HeaderProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-20 transition-all duration-300",
      scrolled 
        ? "py-2 bg-white/90 backdrop-blur-md shadow-sm" 
        : "py-4 bg-transparent"
    )}>
      <div className="container flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-artcraft-primary to-artcraft-accent">
            r/ArtCraft
          </h1>
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
