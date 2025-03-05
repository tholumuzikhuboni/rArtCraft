import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  onChange: (color: string) => void;
  color: string;
}

const PRESET_COLORS = [
  '#000000', // Black
  '#FFFFFF', // White
  '#FF0000', // Red
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#FFA500', // Orange
  '#800080', // Purple
  '#008080', // Teal
  '#A52A2A', // Brown
];

export const ColorPicker = ({ onChange, color }: ColorPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="tool-button overflow-hidden relative border hover:scale-105 transition-transform"
        aria-label="Color picker"
        title="Color picker"
      >
        <div 
          className="absolute inset-1 rounded-sm transition-transform duration-300"
          style={{ backgroundColor: color }}
        ></div>
      </button>
      
      {isOpen && (
        <div 
          className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg p-3 glass animate-scale-in z-10 w-64"
        >
          <div className="grid grid-cols-4 gap-2">
            {PRESET_COLORS.map((presetColor) => (
              <button
                key={presetColor}
                onClick={() => {
                  onChange(presetColor);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full h-8 rounded-md border transition-all duration-200 hover:scale-105 hover:shadow-sm",
                  color === presetColor && "ring-2 ring-artcraft-accent"
                )}
                style={{ backgroundColor: presetColor }}
                aria-label={`Select color ${presetColor}`}
              />
            ))}
          </div>
          
          <div className="mt-3 flex flex-col space-y-2">
            <label htmlFor="custom-color" className="text-sm text-artcraft-primary">
              Custom color
            </label>
            <input
              type="color"
              id="custom-color"
              value={color}
              onChange={(e) => onChange(e.target.value)}
              className="w-full h-10 rounded-md cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
};
