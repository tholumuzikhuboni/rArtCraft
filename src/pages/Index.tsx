
import { useState } from 'react';
import { Canvas } from '@/components/Canvas';
import { Header } from '@/components/Header';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const isMobile = useIsMobile();
  const [exportedImage, setExportedImage] = useState<string | null>(null);
  
  const handleExport = (dataURL: string) => {
    setExportedImage(dataURL);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-artcraft-muted/20">
      <Header onExport={() => {
        const canvas = document.querySelector('canvas');
        if (canvas) {
          const dataURL = canvas.toDataURL('image/png');
          handleExport(dataURL);
        }
      }} />
      
      <main className="container pt-24 pb-12">
        <div className="mb-8 animate-slide-down">
          <div className="inline-block px-3 py-1 rounded-full bg-artcraft-accent/10 text-artcraft-accent text-xs font-medium mb-3 animate-fade-in">
            Collaborative Art
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-artcraft-primary mb-3 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-artcraft-primary to-artcraft-accent">Create Together</span>
          </h2>
          <p className="text-artcraft-secondary max-w-2xl animate-fade-in delay-100">
            Express your creativity on a shared canvas. Use the tools on the left to draw, erase, and save your artwork.
          </p>
        </div>
        
        <div className="flex flex-col items-center justify-center mb-12 relative animate-fade-in">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-artcraft-accent/30 to-artcraft-primary/30 rounded-xl blur-md"></div>
            <Canvas 
              width={isMobile ? 350 : 800} 
              height={isMobile ? 400 : 600}
              onExport={handleExport}
            />
          </div>
        </div>
        
        {exportedImage && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-30 p-4 animate-fade-in">
            <div className="glass rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-auto animate-scale-in">
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
              
              <div className="flex justify-end">
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
      
      <footer className="border-t border-artcraft-muted/50 py-6 bg-white/50">
        <div className="container flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-artcraft-secondary mb-4 sm:mb-0">
            r/ArtCraft — A collaborative canvas experience
          </p>
          <div className="flex items-center gap-4">
            <a 
              href="#" 
              className="text-sm text-artcraft-secondary hover:text-artcraft-primary transition-colors"
            >
              Terms
            </a>
            <a 
              href="#" 
              className="text-sm text-artcraft-secondary hover:text-artcraft-primary transition-colors"
            >
              Privacy
            </a>
            <a 
              href="#" 
              className="text-sm text-artcraft-secondary hover:text-artcraft-primary transition-colors"
            >
              Help
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
