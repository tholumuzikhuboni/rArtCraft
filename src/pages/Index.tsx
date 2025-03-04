
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
    <div className="min-h-screen bg-background">
      <Header onExport={() => {
        const canvas = document.querySelector('canvas');
        if (canvas) {
          const dataURL = canvas.toDataURL('image/png');
          handleExport(dataURL);
        }
      }} />
      
      <main className="container pt-24 pb-12">
        <div className="mb-8 animate-slide-down">
          <div className="inline-block px-3 py-1 rounded-full bg-artcraft-accent/10 text-artcraft-accent text-xs font-medium mb-3">
            Collaborative Art
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-artcraft-primary mb-3">
            Create Together
          </h2>
          <p className="text-artcraft-secondary max-w-2xl">
            Express your creativity on a shared canvas. Use the tools on the left to draw, erase, and save your artwork.
          </p>
        </div>
        
        <div className="flex flex-col items-center justify-center mb-12 relative animate-fade-in">
          <Canvas 
            width={isMobile ? 350 : 800} 
            height={isMobile ? 400 : 600}
            onExport={handleExport}
          />
        </div>
        
        {exportedImage && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-30 p-4 animate-fade-in">
            <div className="glass rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-artcraft-primary">Your Artwork</h3>
                <button
                  onClick={() => setExportedImage(null)}
                  className="text-artcraft-secondary hover:text-artcraft-primary"
                >
                  Close
                </button>
              </div>
              
              <div className="rounded-lg overflow-hidden shadow-lg mb-4">
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
                  className="px-4 py-2 bg-artcraft-accent text-white rounded-lg hover:bg-artcraft-accent/90 transition-colors"
                >
                  Download
                </a>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <footer className="border-t border-artcraft-muted/50 py-6">
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
