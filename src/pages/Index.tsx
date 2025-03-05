
import { useState } from 'react';
import { Canvas } from '@/components/Canvas';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { Github, Heart, Palette, MessageSquare, Twitter } from 'lucide-react';
import { cn } from '@/lib/utils';

const Index = () => {
  const isMobile = useIsMobile();
  const [exportedImage, setExportedImage] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const handleExport = (dataURL: string) => {
    setExportedImage(dataURL);
  };
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-artcraft-muted/20">
      <Header 
        onExport={() => {
          const canvas = document.querySelector('canvas');
          if (canvas) {
            const dataURL = canvas.toDataURL('image/png');
            handleExport(dataURL);
          }
        }} 
        onToggleSidebar={toggleSidebar}
      />
      
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      
      <main className={cn(
        "container pt-24 pb-12 transition-all duration-300",
        sidebarOpen ? "ml-64" : "ml-0"
      )}>
        <div className="mb-8 animate-slide-down">
          <div className="inline-block px-3 py-1 rounded-full bg-artcraft-accent/10 text-artcraft-accent text-xs font-medium mb-3 animate-fade-in">
            Collaborative Art
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-artcraft-primary mb-3 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-artcraft-accent to-orange-400">Create Together</span>
          </h2>
          <p className="text-artcraft-secondary max-w-2xl animate-fade-in delay-100">
            Express your creativity on a shared canvas. Use the tools on the left to draw, erase, and save your artwork.
          </p>
        </div>
        
        <div className="flex flex-col items-center justify-center mb-12 relative animate-fade-in">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-artcraft-accent/30 to-orange-300/30 rounded-xl blur-md"></div>
            <Canvas 
              width={isMobile ? 350 : 800} 
              height={isMobile ? 400 : 600}
              onExport={handleExport}
            />
          </div>
        </div>
        
        {exportedImage && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-30 p-4 animate-fade-in">
            <div className="glass rounded-xl p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-auto animate-scale-in mx-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-artcraft-primary">Your Artwork</h3>
                <button
                  onClick={() => setExportedImage(null)}
                  className="text-artcraft-secondary hover:text-artcraft-primary transition-colors"
                >
                  Close
                </button>
              </div>
              
              <div className="rounded-lg overflow-hidden shadow-lg mb-4 transition-all duration-300 hover:shadow-xl">
                <img 
                  src={exportedImage} 
                  alt="Exported artwork" 
                  className="max-w-full h-auto"
                />
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setExportedImage(null)}
                  className="px-4 py-2 bg-artcraft-muted text-artcraft-primary rounded-lg hover:bg-artcraft-muted/80 transition-colors"
                >
                  Cancel
                </button>
                <a 
                  href={exportedImage}
                  download="artcraft-creation.png"
                  className="px-4 py-2 bg-gradient-to-r from-artcraft-accent to-artcraft-accent/80 text-white rounded-lg hover:from-artcraft-accent/90 hover:to-artcraft-accent transition-colors shadow-sm hover:shadow"
                >
                  Download
                </a>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <footer className="border-t border-artcraft-muted/50 py-8 bg-white/50">
        <div className="container">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <div className="flex items-center mb-4 sm:mb-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-artcraft-accent to-orange-400 flex items-center justify-center text-white mr-3">
                <Palette className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-artcraft-primary">r/ArtCraft</h3>
                <p className="text-xs text-artcraft-secondary">A collaborative canvas experience</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <a 
                href="#" 
                className="w-8 h-8 rounded-full bg-artcraft-muted flex items-center justify-center text-artcraft-primary hover:bg-artcraft-accent hover:text-white transition-colors"
                aria-label="Reddit"
              >
                <MessageSquare className="h-4 w-4" />
              </a>
              <a 
                href="#" 
                className="w-8 h-8 rounded-full bg-artcraft-muted flex items-center justify-center text-artcraft-primary hover:bg-artcraft-accent hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a 
                href="#" 
                className="w-8 h-8 rounded-full bg-artcraft-muted flex items-center justify-center text-artcraft-primary hover:bg-artcraft-accent hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
            </div>
          </div>
          
          <div className="border-t border-artcraft-muted/30 pt-6 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-artcraft-secondary mb-4 sm:mb-0">
              &copy; {new Date().getFullYear()} r/ArtCraft — Made with <Heart className="h-3 w-3 inline text-red-500" /> for Reddit Hackathon
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="#" 
                className="text-sm text-artcraft-secondary hover:text-artcraft-accent transition-colors"
              >
                Terms
              </a>
              <a 
                href="#" 
                className="text-sm text-artcraft-secondary hover:text-artcraft-accent transition-colors"
              >
                Privacy
              </a>
              <a 
                href="#" 
                className="text-sm text-artcraft-secondary hover:text-artcraft-accent transition-colors"
              >
                Help
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
