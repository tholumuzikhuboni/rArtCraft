
import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, PanInfo } from "framer-motion";

interface MovableDialogProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  initialPosition?: { x: number; y: number };
}

export const MovableDialog = ({
  title,
  isOpen,
  onClose,
  children,
  initialPosition = { x: 0, y: 0 },
  className,
  ...props
}: MovableDialogProps) => {
  if (!isOpen) return null;
  
  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={initialPosition}
      className={cn(
        "fixed z-50 bg-white border border-artcraft-muted/20 rounded-lg shadow-md",
        "flex flex-col w-full max-w-md",
        className
      )}
      // Remove any onDrag from props to avoid type conflicts
      {...Object.fromEntries(Object.entries(props).filter(([key]) => key !== 'onDrag'))}
    >
      <div 
        className="flex items-center justify-between p-4 border-b border-artcraft-muted/10 cursor-move"
        style={{ touchAction: "none" }}
      >
        <h3 className="font-medium text-artcraft-primary">{title}</h3>
        <button 
          onClick={onClose}
          className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-artcraft-muted/10"
        >
          <X className="h-4 w-4 text-artcraft-secondary" />
        </button>
      </div>
      <div className="p-4 overflow-y-auto max-h-[70vh]">
        {children}
      </div>
    </motion.div>
  );
};
