.
import { Paintbrush, Eraser, Save, Trash, FileUp, FileDown, Undo, Redo } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ColorPicker } from './ColorPicker';
import { useState } from 'react';

export interface ToolbarProps {
  onToolChange: (tool: 'brush' | 'eraser') => void;
  onColorChange: (color: string) => void;
  onBrushSizeChange: (size: number) => void;
  onSave: () => void;
  onClear: () => void;
  onLoad: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  currentTool: 'brush' | 'eraser';
  currentColor: string;
  currentBrushSize: number;
  canUndo?: boolean;
  canRedo?: boolean;
}

export const Toolbar = ({
  onToolChange,
  onColorChange,
  onBrushSizeChange,
  onSave,
  onClear,
  onLoad,
  onUndo,
  onRedo,
  currentTool,
  currentColor,
  currentBrushSize,
  canUndo = false,
  canRedo = false,
}: ToolbarProps) => {
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  
  return (
    <div className="glass rounded-xl p-3 flex flex-col gap-4 items-center w-16 fixed left-4 top-1/2 transform -translate-y-1/2 z-10 transition-all duration-300 hover:shadow-lg">
      <div className="flex flex-col gap-2">
        <button
          onClick={() => onToolChange('brush')}
          className={cn(
            "tool-button transition-all duration-200", 
            currentTool === 'brush' 
              ? "active bg-artcraft-accent/10 text-artcraft-accent shadow-inner" 
              : "hover:bg-artcraft-muted/80"
          )}
          aria-label="Brush tool"
          title="Brush"
        >
          <Paintbrush className={cn("h-5 w-5", currentTool === 'brush' && "animate-pulse-subtle")} />
        </button>
        
        <button
          onClick={() => onToolChange('eraser')}
          className={cn(
            "tool-button transition-all duration-200", 
            currentTool === 'eraser' 
              ? "active bg-artcraft-accent/10 text-artcraft-accent shadow-inner" 
              : "hover:bg-artcraft-muted/80"
          )}
          aria-label="Eraser tool"
          title="Eraser"
        >
          <Eraser className={cn("h-5 w-5", currentTool === 'eraser' && "animate-pulse-subtle")} />
        </button>
        
        <ColorPicker color={currentColor} onChange={onColorChange} />
        
        <div className="h-px w-full bg-artcraft-muted my-1"></div>
        
        <div className="relative py-2">
          <input
            type="range"
            min="1"
            max="30"
            value={currentBrushSize}
            onChange={(e) => onBrushSizeChange(parseInt(e.target.value))}
            className="w-20 rotate-90 absolute -left-8 h-0 cursor-pointer"
            style={{ 
              transform: 'rotate(90deg) translateX(-100%)', 
              transformOrigin: 'left'
            }}
            title={`Brush size: ${currentBrushSize}px`}
          />
        </div>
        
        <div className="h-px w-full bg-artcraft-muted my-1"></div>
      </div>
      
      <div className="flex flex-col gap-2">
        {onUndo && (
          <button
            onClick={onUndo}
            className={cn(
              "tool-button transition-all duration-200", 
              !canUndo 
                ? "opacity-50 cursor-not-allowed" 
                : "hover:bg-artcraft-muted/80"
            )}
            aria-label="Undo"
            title="Undo"
            disabled={!canUndo}
          >
            <Undo className="h-5 w-5" />
          </button>
        )}
        
        {onRedo && (
          <button
            onClick={onRedo}
            className={cn(
              "tool-button transition-all duration-200", 
              !canRedo 
                ? "opacity-50 cursor-not-allowed" 
                : "hover:bg-artcraft-muted/80"
            )}
            aria-label="Redo"
            title="Redo"
            disabled={!canRedo}
          >
            <Redo className="h-5 w-5" />
          </button>
        )}
        
        <button
          onClick={onSave}
          className="tool-button hover:bg-artcraft-muted/80 transition-all duration-200 hover:scale-105"
          aria-label="Save canvas"
          title="Save"
        >
          <Save className="h-5 w-5" />
        </button>
        
        <button
          onClick={onLoad}
          className="tool-button hover:bg-artcraft-muted/80 transition-all duration-200 hover:scale-105"
          aria-label="Load saved canvas"
          title="Load"
        >
          <FileUp className="h-5 w-5" />
        </button>
        
        <button
          onClick={() => setShowConfirmClear(true)}
          className="tool-button hover:bg-red-100 hover:text-red-500 hover:border-red-200 transition-all duration-200"
          aria-label="Clear canvas"
          title="Clear"
        >
          <Trash className="h-5 w-5" />
        </button>
      </div>
      
      {showConfirmClear && (
        <div className="absolute left-full ml-3 glass rounded-lg p-3 w-40 animate-scale-in z-10 shadow-lg border border-white/30">
          <p className="text-sm font-medium text-artcraft-primary mb-2">Clear canvas?</p>
          <div className="flex justify-between gap-2">
            <button
              onClick={() => {
                onClear();
                setShowConfirmClear(false);
              }}
              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm transition-colors"
            >
              Clear
            </button>
            <button
              onClick={() => setShowConfirmClear(false)}
              className="px-3 py-1 bg-artcraft-muted hover:bg-artcraft-muted/80 text-artcraft-primary rounded-md text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
