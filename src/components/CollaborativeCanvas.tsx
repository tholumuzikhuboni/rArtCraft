
import { useRef, useState, useEffect } from 'react';
import { toast } from "sonner";
import { Toolbar } from './Toolbar';
import { 
  DrawingSettings, 
  clearCanvas, 
  drawLine, 
  getPointerPosition
} from '@/utils/canvasUtils';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Share2, Users, Download } from 'lucide-react';
import { Button } from './ui/button';

interface CollaborativeCanvasProps {
  communityId: string;
  width?: number;
  height?: number;
  showMembersList: () => void;
}

export const CollaborativeCanvas = ({ 
  communityId, 
  width = 800, 
  height = 600,
  showMembersList
}: CollaborativeCanvasProps) => {
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
  const [isLoadingCanvas, setIsLoadingCanvas] = useState(true);
  
  const { user } = useAuth();
  
  // Set up a channel for realtime collaboration
  useEffect(() => {
    if (!communityId) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Load the initial canvas data
    loadCommunityCanvas();
    
    // Subscribe to canvas changes
    const channel = supabase
      .channel(`canvas-${communityId}`)
      .on('broadcast', { event: 'canvas-draw' }, (payload) => {
        if (payload.payload.userId !== user?.id) {
          applyRemoteDrawOperation(payload.payload);
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [communityId, user?.id]);
  
  const loadCommunityCanvas = async () => {
    try {
      setIsLoadingCanvas(true);
      
      // First check if there's an existing drawing for this community
      const { data: drawingData, error: drawingError } = await supabase
        .from('community_drawings')
        .select('*')
        .eq('community_id', communityId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();
      
      if (drawingError && drawingError.code !== 'PGRST116') {
        console.error('Error loading community canvas:', drawingError);
        return;
      }
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Initialize with white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // If we have existing drawing data, load it
      if (drawingData && drawingData.image_data) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          saveToHistory();
        };
        img.src = drawingData.image_data;
        toast("Loaded community canvas");
      } else {
        saveToHistory();
      }
    } catch (error) {
      console.error('Error loading community canvas:', error);
      toast.error("Failed to load community canvas");
    } finally {
      setIsLoadingCanvas(false);
    }
  };
  
  const applyRemoteDrawOperation = (data: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Apply the remote drawing operation
    if (data.type === 'line') {
      drawLine(
        ctx, 
        data.fromX, 
        data.fromY, 
        data.toX, 
        data.toY, 
        {
          color: data.color,
          brushSize: data.brushSize,
          tool: data.tool as 'brush' | 'eraser'
        }
      );
    } else if (data.type === 'clear') {
      clearCanvas(canvas);
    }
  };
  
  const broadcastDrawOperation = (type: string, data: any) => {
    if (!communityId || !user) return;
    
    supabase
      .channel(`canvas-${communityId}`)
      .send({
        type: 'broadcast',
        event: 'canvas-draw',
        payload: {
          ...data,
          type,
          userId: user.id,
        },
      });
  };
  
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
    if (!canvas || isLoadingCanvas) return;
    
    if ('touches' in e) {
      e.preventDefault();
    }
    
    setIsDrawing(true);
    const pos = getPointerPosition(canvas, e.nativeEvent as any);
    lastPos.current = pos;
  };
  
  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || isLoadingCanvas) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const currentPos = getPointerPosition(canvas, e.nativeEvent as any);
    
    if (lastPos.current) {
      drawLine(ctx, lastPos.current.x, lastPos.current.y, currentPos.x, currentPos.y, settings);
      
      // Broadcast the drawing operation
      broadcastDrawOperation('line', {
        fromX: lastPos.current.x,
        fromY: lastPos.current.y,
        toX: currentPos.x,
        toY: currentPos.y,
        color: settings.color,
        brushSize: settings.brushSize,
        tool: settings.tool
      });
    }
    
    lastPos.current = currentPos;
  };
  
  const handlePointerUp = () => {
    if (isDrawing && !isLoadingCanvas) {
      setIsDrawing(false);
      lastPos.current = null;
      saveToHistory();
    }
  };
  
  const handleClear = () => {
    if (isLoadingCanvas) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    clearCanvas(canvas);
    saveToHistory();
    
    // Broadcast clear operation
    broadcastDrawOperation('clear', {});
    
    toast("Canvas cleared");
  };
  
  const handleSave = async () => {
    if (isLoadingCanvas || !communityId || !user) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    try {
      const dataURL = canvas.toDataURL('image/png');
      
      // Save to community_drawings table
      const { error } = await supabase
        .from('community_drawings')
        .insert([
          {
            community_id: communityId,
            title: `Community Canvas ${new Date().toLocaleDateString()}`,
            image_data: dataURL
          }
        ]);
        
      if (error) throw error;
      
      toast.success("Canvas saved to community");
    } catch (error) {
      console.error('Error saving community canvas:', error);
      toast.error("Failed to save canvas");
    }
  };
  
  const handleExport = () => {
    if (isLoadingCanvas) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `community-${communityId}-canvas.png`;
    link.href = dataURL;
    link.click();
    toast("Image downloaded");
  };
  
  const handleUndo = () => {
    if (historyIndex > 0 && !isLoadingCanvas) {
      restoreFromHistory(historyIndex - 1);
      toast("Undo");
    }
  };
  
  const handleRedo = () => {
    if (historyIndex < history.length - 1 && !isLoadingCanvas) {
      restoreFromHistory(historyIndex + 1);
      toast("Redo");
    }
  };

  // Add this function to handle loading saved canvas data
  const handleLoadCanvas = () => {
    loadCommunityCanvas();
    toast("Reloaded community canvas");
  };
  
  return (
    <div className="relative canvas-container">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-artcraft-primary">Community Canvas</h2>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={showMembersList}
            className="flex items-center gap-1"
          >
            <Users className="h-4 w-4" />
            <span>Members</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSave}
            className="flex items-center gap-1"
          >
            <Share2 className="h-4 w-4" />
            <span>Save</span>
          </Button>
        </div>
      </div>
      
      <Toolbar
        currentTool={settings.tool}
        currentColor={settings.color}
        currentBrushSize={settings.brushSize}
        onToolChange={(tool) => setSettings({ ...settings, tool })}
        onColorChange={(color) => setSettings({ ...settings, color })}
        onBrushSizeChange={(size) => setSettings({ ...settings, brushSize: size })}
        onSave={handleSave}
        onClear={handleClear}
        onLoad={handleLoadCanvas}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
      />
      
      <div className="rounded-xl overflow-hidden shadow-lg border border-canvas-border">
        {isLoadingCanvas && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
            <div className="flex flex-col items-center">
              <div className="animate-spin w-8 h-8 border-4 border-artcraft-accent/80 border-t-transparent rounded-full mb-2"></div>
              <p className="text-sm text-artcraft-secondary">Loading canvas...</p>
            </div>
          </div>
        )}
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className={`touch-none bg-canvas-background ${isLoadingCanvas ? 'opacity-70' : ''}`}
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
