import React, { useState, useRef, useEffect } from 'react';
import { Minus, Square, X, Maximize2, Shield } from 'lucide-react';
import { WindowId, WindowState } from '../types';

interface WindowFrameProps {
  windowState: WindowState;
  isActive: boolean;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onUpdatePosition: (pos: { x: number; y: number }) => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({
  windowState,
  isActive,
  onFocus,
  onClose,
  onMinimize,
  onToggleMaximize,
  onUpdatePosition,
  children,
  icon,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; winX: number; winY: number }>({
    mouseX: 0,
    mouseY: 0,
    winX: 0,
    winY: 0,
  });

  const { isMinimized, isMaximized, position, size, title, zIndex } = windowState;

  if (isMinimized) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMaximized) return;
    onFocus();
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      winX: position.x,
      winY: position.y,
    };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isMaximized) return;
    onFocus();
    setIsDragging(true);
    const touch = e.touches[0];
    dragStartRef.current = {
      mouseX: touch.clientX,
      mouseY: touch.clientY,
      winX: position.x,
      winY: position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || isMaximized) return;
      const dx = e.clientX - dragStartRef.current.mouseX;
      const dy = e.clientY - dragStartRef.current.mouseY;
      const newX = Math.max(0, Math.min(window.innerWidth - 100, dragStartRef.current.winX + dx));
      const newY = Math.max(0, Math.min(window.innerHeight - 80, dragStartRef.current.winY + dy));
      onUpdatePosition({ x: newX, y: newY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || isMaximized) return;
      const touch = e.touches[0];
      const dx = touch.clientX - dragStartRef.current.mouseX;
      const dy = touch.clientY - dragStartRef.current.mouseY;
      const newX = Math.max(0, Math.min(window.innerWidth - 100, dragStartRef.current.winX + dx));
      const newY = Math.max(0, Math.min(window.innerHeight - 80, dragStartRef.current.winY + dy));
      onUpdatePosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, isMaximized, onUpdatePosition]);

  return (
    <div
      onMouseDown={onFocus}
      onTouchStart={onFocus}
      style={{
        zIndex,
        ...(isMaximized
          ? { top: 0, left: 0, width: '100vw', height: 'calc(100vh - 48px)' }
          : {
              top: `${position.y}px`,
              left: `${position.x}px`,
              width: `min(94vw, ${size.width}px)`,
              height: `min(80vh, ${size.height}px)`,
            }),
      }}
      className={`fixed flex flex-col bg-[#030d06]/95 backdrop-blur-md border-2 transition-shadow duration-150 rounded-sm overflow-hidden ${
        isActive
          ? 'border-[#00ff66] shadow-[0_0_20px_rgba(0,255,102,0.35)]'
          : 'border-[#00ff66]/40 shadow-[0_0_8px_rgba(0,0,0,0.8)] opacity-95'
      }`}
    >
      {/* Title Bar */}
      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className={`flex items-center justify-between px-2.5 py-1.5 cursor-grab active:cursor-grabbing select-none border-b transition-colors ${
          isActive
            ? 'bg-[#00ff66] text-black font-bold border-[#00ff66]'
            : 'bg-[#011a09] text-[#00ff66] font-semibold border-[#00ff66]/30'
        }`}
      >
        {/* Title & Icon */}
        <div className="flex items-center gap-2 text-xs truncate mr-2">
          {icon || <Shield className="w-3.5 h-3.5" />}
          <span className="truncate tracking-wide font-mono uppercase">{title}</span>
        </div>

        {/* Window controls (Min, Max, Close) */}
        <div className="flex items-center gap-1" onMouseDown={(e) => e.stopPropagation()}>
          <button
            onClick={onMinimize}
            className={`w-5 h-5 flex items-center justify-center border transition-colors rounded-xs cursor-pointer ${
              isActive
                ? 'border-black hover:bg-black/20 text-black'
                : 'border-[#00ff66]/40 hover:bg-[#00ff66]/20 text-[#00ff66]'
            }`}
            title="Minimize"
          >
            <Minus className="w-3 h-3" />
          </button>

          <button
            onClick={onToggleMaximize}
            className={`w-5 h-5 flex items-center justify-center border transition-colors rounded-xs cursor-pointer ${
              isActive
                ? 'border-black hover:bg-black/20 text-black'
                : 'border-[#00ff66]/40 hover:bg-[#00ff66]/20 text-[#00ff66]'
            }`}
            title={isMaximized ? 'Restore' : 'Maximize'}
          >
            {isMaximized ? <Maximize2 className="w-2.5 h-2.5" /> : <Square className="w-2.5 h-2.5" />}
          </button>

          <button
            onClick={onClose}
            className={`w-5 h-5 flex items-center justify-center border transition-colors rounded-xs cursor-pointer ${
              isActive
                ? 'border-black hover:bg-red-600 hover:text-white text-black'
                : 'border-[#00ff66]/40 hover:bg-red-900/60 hover:text-red-300 text-[#00ff66]'
            }`}
            title="Close"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Window Body */}
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
};
