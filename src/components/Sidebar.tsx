
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Palette, Users, Trophy, Star, LayoutGrid } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
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
          <a 
            href="#" 
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-artcraft-muted text-artcraft-primary transition-colors"
          >
            <Palette className="h-5 w-5 text-artcraft-accent" />
            <span>Your Canvas</span>
          </a>
          
          <a 
            href="#" 
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-artcraft-muted text-artcraft-primary transition-colors"
          >
            <LayoutGrid className="h-5 w-5 text-artcraft-accent" />
            <span>Gallery</span>
          </a>
          
          <a 
            href="#" 
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-artcraft-muted text-artcraft-primary transition-colors"
          >
            <Users className="h-5 w-5 text-artcraft-accent" />
            <span>Communities</span>
          </a>
          
          <a 
            href="#" 
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-artcraft-muted text-artcraft-primary transition-colors"
          >
            <Trophy className="h-5 w-5 text-artcraft-accent" />
            <span>Challenges</span>
          </a>
          
          <a 
            href="#" 
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-artcraft-muted text-artcraft-primary transition-colors"
          >
            <Star className="h-5 w-5 text-artcraft-accent" />
            <span>Featured</span>
          </a>
        </nav>
        
        <div className="mt-8 p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
          <h3 className="font-medium text-artcraft-primary mb-2">Weekly Challenge</h3>
          <p className="text-sm text-artcraft-secondary mb-3">
            Create a pixel art version of your favorite Reddit mascot!
          </p>
          <button className="text-xs font-medium text-artcraft-accent hover:underline">
            Join Challenge
          </button>
        </div>
      </div>
    </div>
  );
};
