import React, { useRef } from 'react';
import { GlassCard } from './GlassCard';

interface UploaderProps {
  onFileSelect: (file: File) => void;
}

export const Uploader: React.FC<UploaderProps> = ({ onFileSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <GlassCard className="w-full h-80 flex flex-col items-center justify-center border-dashed border-2 border-slate-600/50 hover:border-cyan-500/50 group cursor-pointer" hoverEffect={true}>
      <div 
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="w-full h-full flex flex-col items-center justify-center text-center p-8"
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />
        
        {/* Isometric-style Icon Placeholder - Skew removed to fix distortion */}
        <div className="relative w-24 h-24 mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-2">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-cyan-500/20 rounded-2xl rotate-45 blur-lg group-hover:blur-xl transition-all"></div>
          
          {/* Main Diamond Shape */}
          <div className="absolute inset-0 bg-slate-800 rounded-2xl border border-cyan-500/30 flex items-center justify-center shadow-2xl z-10 rotate-45">
             {/* Counter-rotated Icon to stand upright */}
             <svg className="w-10 h-10 text-cyan-400 -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
             </svg>
          </div>
        </div>

        <h3 className="text-xl font-medium text-slate-200 mb-2">Upload Image</h3>
        <p className="text-sm text-slate-400 max-w-xs">
          Drag & drop or click to upload.
          <br/>
          <span className="text-xs opacity-60">Supports PNG, JPG, WEBP</span>
        </p>
      </div>
    </GlassCard>
  );
};