
import { useRef, useState, useEffect } from 'react';
import { toast } from "sonner";
import { Toolbar } from './Toolbar';
import { Download } from 'lucide-react'; // Add this import
import { DrawingSettings, clearCanvas, drawLine, getPointerPosition, loadCanvasFromLocalStorage, saveCanvasToLocalStorage } from '@/utils/canvasUtils';

interface CanvasProps {
  width?: number;
  height?: number;
  onExport?: (dataURL: string) => void;
}

export const Canvas = ({ width = 800, height = 600, onExport }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [settings, setSettings] = useState<DrawingSettings>({
    color: '#000000',
    brushSize: 5,
    tool: 'brush',
  });
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set initial background to white
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Try to load from localStorage
    const loaded = loadCanvasFromLocalStorage(canvas);
    
    // Save initial state to history
    saveToHistory();
    
    if (loaded) {
      toast("Loaded saved artwork");
    }
  }, []);
  
  // Save current state to history
  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataURL = canvas.toDataURL();
    
    // If we're in the middle of the history and make a new change,
    // discard all future history
    if (historyIndex !== history.length - 1 && historyIndex !== -1) {
      setHistory((prev) => [...prev.slice(0, historyIndex + 1), dataURL]);
    } else {
      setHistory((prev) => [...prev, dataURL]);
    }
    
    setHistoryIndex((prev) => prev + 1);
  };
  
  // Restore from history
  const restoreFromHistory = (index: number) => {
    if (index < 0 || index >= history.length) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = history[index];
    
    setHistoryIndex(index);
  };
  
  // Handle touch/mouse events
  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    if ('touches' in e) {
      e.preventDefault(); // Prevent scrolling on touch
    }
    
    setIsDrawing(true);
    const pos = getPointerPosition(canvas, e.nativeEvent as any);
    lastPos.current = pos;
  };
  
  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const currentPos = getPointerPosition(canvas, e.nativeEvent as any);
    
    if (lastPos.current) {
      drawLine(ctx, lastPos.current.x, lastPos.current.y, currentPos.x, currentPos.y, settings);
    }
    
    lastPos.current = currentPos;
  };
  
  const handlePointerUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      lastPos.current = null;
      saveToHistory();
    }
  };
  
  // Handle clear
  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    clearCanvas(canvas);
    saveToHistory();
    toast("Canvas cleared");
  };
  
  // Handle save
  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    saveCanvasToLocalStorage(canvas);
    toast("Artwork saved locally");
  };
  
  // Handle load
  const handleLoad = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const loaded = loadCanvasFromLocalStorage(canvas);
    if (loaded) {
      toast("Artwork loaded");
      saveToHistory();
    } else {
      toast("No saved artwork found");
    }
  };
  
  // Handle export
  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataURL = canvas.toDataURL('image/png');
    
    if (onExport) {
      onExport(dataURL);
    } else {
      // Create a download link
      const link = document.createElement('a');
      link.download = 'artcraft-creation.png';
      link.href = dataURL;
      link.click();
      toast("Image downloaded");
    }
  };
  
  // Handle undo
  const handleUndo = () => {
    if (historyIndex > 0) {
      restoreFromHistory(historyIndex - 1);
      toast("Undo");
    }
  };
  
  // Handle redo
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      restoreFromHistory(historyIndex + 1);
      toast("Redo");
    }
  };
  
  return (
    <div className="relative canvas-container">
      <Toolbar
        currentTool={settings.tool}
        currentColor={settings.color}
        currentBrushSize={settings.brushSize}
        onToolChange={(tool) => setSettings({ ...settings, tool })}
        onColorChange={(color) => setSettings({ ...settings, color })}
        onBrushSizeChange={(size) => setSettings({ ...settings, brushSize: size })}
        onSave={handleSave}
        onClear={handleClear}
        onLoad={handleLoad}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
      />
      
      <div className="rounded-xl overflow-hidden shadow-lg border border-canvas-border">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="touch-none bg-canvas-background"
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        />
      </div>
      
      <div className="absolute bottom-4 right-4">
        <button
          onClick={handleExport}
          className="tool-button glass hover:scale-105 transition-all duration-200"
          aria-label="Export artwork"
          title="Export as PNG"
        >
          <Download className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
