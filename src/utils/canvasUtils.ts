export interface DrawingSettings {
  color: string;
  brushSize: number;
  tool: 'brush' | 'eraser';
}

export const getPointerPosition = (canvas: HTMLCanvasElement, event: MouseEvent | TouchEvent): { x: number; y: number } => {
  const rect = canvas.getBoundingClientRect();
  let x: number, y: number;
  
  if ('touches' in event) {
    // Touch event
    x = event.touches[0].clientX - rect.left;
    y = event.touches[0].clientY - rect.top;
  } else {
    // Mouse event
    x = event.clientX - rect.left;
    y = event.clientY - rect.top;
  }
  
  // Adjust for any CSS sizing of the canvas
  x = Math.round(x * (canvas.width / rect.width));
  y = Math.round(y * (canvas.height / rect.height));
  
  return { x, y };
};

export const drawLine = (
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  settings: DrawingSettings
) => {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = settings.tool === 'eraser' ? '#FFFFFF' : settings.color;
  ctx.lineWidth = settings.brushSize;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
  ctx.closePath();
};

export const clearCanvas = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
};

export const saveCanvasToLocalStorage = (canvas: HTMLCanvasElement) => {
  localStorage.setItem('artcraft_canvas', canvas.toDataURL());
};

export const loadCanvasFromLocalStorage = (canvas: HTMLCanvasElement) => {
  const dataURL = localStorage.getItem('artcraft_canvas');
  if (!dataURL) return false;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;
  
  const img = new Image();
  img.onload = () => {
    ctx.drawImage(img, 0, 0);
  };
  img.src = dataURL;
  return true;
};
