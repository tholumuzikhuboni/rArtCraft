.
import { useRef, useState, useEffect } from 'react';
import { toast } from "sonner";
import { Toolbar } from './Toolbar';
import { Download, Save } from 'lucide-react';
import { 
  DrawingSettings, 
  clearCanvas, 
  drawLine, 
  getPointerPosition, 
  loadCanvasFromLocalStorage, 
  saveCanvasToLocalStorage 
} from '@/utils/canvasUtils';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

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
  
  const { user } = useAuth();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [drawingTitle, setDrawingTitle] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const loaded = loadCanvasFromLocalStorage(canvas);
    
    saveToHistory();
    
    if (loaded) {
      toast("Loaded saved artwork");
    }
  }, []);
  
  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataURL = canvas.toDataURL();
    
    if (historyIndex !== history.length - 1 && historyIndex !== -1) {
      setHistory((prev) => [...prev.slice(0, historyIndex + 1), dataURL]);
    } else {
      setHistory((prev) => [...prev, dataURL]);
    }
    
    setHistoryIndex((prev) => prev + 1);
  };
  
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
  
  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    if ('touches' in e) {
      e.preventDefault();
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
  
  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    clearCanvas(canvas);
    saveToHistory();
    toast("Canvas cleared");
  };
  
  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    if (user) {
      setShowSaveDialog(true);
      setDrawingTitle('');
    } else {
      saveCanvasToLocalStorage(canvas);
      toast("Artwork saved locally");
    }
  };
  
  const handleSaveToSupabase = async () => {
    if (!user) {
      toast.error("You must be logged in to save drawings");
      return;
    }
    
    if (!drawingTitle.trim()) {
      toast.error("Please enter a title for your drawing");
      return;
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setIsSaving(true);
    
    try {
      const dataURL = canvas.toDataURL('image/png');
      
      const { data, error } = await supabase
        .from('saved_drawings')
        .insert([
          {
            user_id: user.id,
            title: drawingTitle.trim(),
            image_data: dataURL,
            is_public: isPublic
          }
        ]);
        
      if (error) {
        throw error;
      }
      
      saveCanvasToLocalStorage(canvas);
      
      toast.success("Drawing saved successfully!");
      setShowSaveDialog(false);
    } catch (error) {
      console.error("Error saving drawing:", error);
      toast.error("Failed to save drawing");
    } finally {
      setIsSaving(false);
    }
  };
  
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
  
  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataURL = canvas.toDataURL('image/png');
    
    if (onExport) {
      onExport(dataURL);
    } else {
      const link = document.createElement('a');
      link.download = 'artcraft-creation.png';
      link.href = dataURL;
      link.click();
      toast("Image downloaded");
    }
  };
  
  const handleUndo = () => {
    if (historyIndex > 0) {
      restoreFromHistory(historyIndex - 1);
      toast("Undo");
    }
  };
  
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
      
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Your Drawing</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="My Awesome Drawing"
                value={drawingTitle}
                onChange={(e) => setDrawingTitle(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is-public"
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
              <Label htmlFor="is-public">Make this drawing public</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSaveDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveToSupabase}
              disabled={isSaving || !drawingTitle.trim()}
            >
              {isSaving ? "Saving..." : "Save Drawing"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
