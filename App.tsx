import React, { useState, useEffect } from 'react';
import { Uploader } from './components/Uploader';
import { Button } from './components/Button';
import { GlassCard } from './components/GlassCard';
import { AppState, ImageFile } from './types';
import { removeWatermark } from './services/geminiService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [imageFile, setImageFile] = useState<ImageFile | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Target selection state
  const [targetPos, setTargetPos] = useState<{x: number, y: number}>({ x: 90, y: 90 }); // Default bottom-right
  const [locationDescription, setLocationDescription] = useState<string>("in the bottom-right corner");

  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImageFile({
          file: file,
          previewUrl: URL.createObjectURL(file),
          base64: e.target.result as string
        });
        setAppState(AppState.PREVIEW);
        setError(null);
        setProcessedImage(null);
        // Reset target to default bottom-right on new file
        setTargetPos({ x: 85, y: 85 });
        setLocationDescription("in the bottom-right corner");
      }
    };
    reader.readAsDataURL(file);
  };

  const calculateLocationDescription = (x: number, y: number): string => {
    let h = 'center';
    let v = 'center';

    if (x < 33) h = 'left';
    else if (x > 66) h = 'right';

    if (y < 33) v = 'top';
    else if (y > 66) v = 'bottom';

    if (v === 'top' && h === 'left') return "in the top-left corner";
    if (v === 'top' && h === 'center') return "at the top edge";
    if (v === 'top' && h === 'right') return "in the top-right corner";
    
    if (v === 'center' && h === 'left') return "on the left side";
    if (v === 'center' && h === 'center') return "in the center";
    if (v === 'center' && h === 'right') return "on the right side";
    
    if (v === 'bottom' && h === 'left') return "in the bottom-left corner";
    if (v === 'bottom' && h === 'center') return "at the bottom edge";
    if (v === 'bottom' && h === 'right') return "in the bottom-right corner";

    return "in the bottom-right corner";
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (appState !== AppState.PREVIEW) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setTargetPos({ x, y });
    setLocationDescription(calculateLocationDescription(x, y));
  };

  const handleProcess = async () => {
    if (!imageFile) return;

    setAppState(AppState.PROCESSING);
    setError(null);

    try {
      const resultBase64 = await removeWatermark(imageFile.base64, locationDescription);
      setProcessedImage(resultBase64);
      setAppState(AppState.COMPLETE);
    } catch (err: any) {
      setError(err.message || "Failed to process image.");
      setAppState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setImageFile(null);
    setProcessedImage(null);
    setError(null);
  };

  return (
    <div className="min-h-screen w-full bg-[#0f172a] text-slate-200 selection:bg-cyan-500/30 overflow-x-hidden">
      
      {/* Abstract Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-cyan-900/20 rounded-full blur-[100px]"></div>
        <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[80px]"></div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8 max-w-4xl flex flex-col items-center min-h-screen justify-center">
        
        {/* Header */}
        <header className="mb-10 text-center">
          <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-slate-800/50 border border-slate-700 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse mr-3 shadow-[0_0_8px_#22d3ee]"></span>
            <span className="text-xs font-bold tracking-widest text-cyan-400 uppercase">AI Powered Eraser</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-500 mb-2">
            NeonEraser
          </h1>
          <p className="text-slate-400">Remove watermarks intelligently.</p>
        </header>

        {/* View Switching */}
        <div className="w-full transition-all duration-500 ease-in-out">
          
          {appState === AppState.IDLE && (
            <div className="max-w-md mx-auto animate-[fadeIn_0.5s_ease-out]">
              <Uploader onFileSelect={handleFileSelect} />
            </div>
          )}

          {(appState === AppState.PREVIEW || appState === AppState.PROCESSING || appState === AppState.COMPLETE || appState === AppState.ERROR) && imageFile && (
            <div className="flex flex-col gap-6 animate-[slideUp_0.5s_ease-out]">
              
              {/* Instructions Bar */}
              {appState === AppState.PREVIEW && (
                <div className="flex justify-between items-center px-2">
                  <p className="text-sm text-cyan-400 font-medium tracking-wide flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                    </span>
                    TAP ON WATERMARK TO TARGET
                  </p>
                  <p className="text-xs text-slate-500 uppercase tracking-widest">Target: {locationDescription.replace('in the ', '').replace('at the ', '').replace('on the ', '')}</p>
                </div>
              )}

              {/* Image Display Card */}
              <GlassCard className="relative w-full aspect-video md:aspect-[16/9] flex items-center justify-center bg-slate-900/60 !p-0 border-slate-700/50">
                
                {/* Image Container */}
                <div className="relative w-full h-full p-2">
                  <div 
                    className={`
                      w-full h-full relative rounded-2xl overflow-hidden bg-slate-950 shadow-inner 
                      ${appState === AppState.PREVIEW ? 'cursor-crosshair' : 'cursor-default'}
                    `}
                    onClick={handleImageClick}
                  >
                    <img 
                      src={appState === AppState.COMPLETE && processedImage ? processedImage : imageFile.previewUrl} 
                      alt="Target" 
                      className="w-full h-full object-contain pointer-events-none select-none"
                    />
                    
                    {/* Scanning Effect during processing */}
                    {appState === AppState.PROCESSING && (
                      <div className="scanning-line"></div>
                    )}
                    
                    {/* Before/After Label */}
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-xs font-semibold border border-white/10 text-white pointer-events-none">
                      {appState === AppState.COMPLETE ? 'PROCESSED' : 'ORIGINAL'}
                    </div>

                    {/* Interactive Target Marker */}
                    {appState === AppState.PREVIEW && (
                      <div 
                        className="absolute w-24 h-24 pointer-events-none transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-out"
                        style={{ left: `${targetPos.x}%`, top: `${targetPos.y}%` }}
                      >
                         {/* Outer Dashed Box */}
                        <div className="absolute inset-0 border-2 border-dashed border-red-500/70 rounded-lg animate-[spin_10s_linear_infinite]"></div>
                         {/* Inner Corners */}
                        <div className="absolute inset-0 border border-transparent">
                            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400"></div>
                            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400"></div>
                            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400"></div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400"></div>
                        </div>
                        {/* Center Point */}
                        <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-red-500 rounded-full shadow-[0_0_10px_#ef4444] transform -translate-x-1/2 -translate-y-1/2"></div>
                        {/* Label */}
                        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                           <span className="text-[9px] font-bold bg-red-500/20 text-red-200 px-2 py-0.5 rounded border border-red-500/30 backdrop-blur-sm">TARGET LOCKED</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </GlassCard>

              {/* Control Panel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Status/Info */}
                <GlassCard className="flex flex-col justify-center min-h-[120px]">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Status</h3>
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-10 h-10 rounded-xl flex items-center justify-center border
                      ${appState === AppState.COMPLETE ? 'bg-green-500/10 border-green-500/30 text-green-400' : 
                        appState === AppState.ERROR ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                        appState === AppState.PROCESSING ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' :
                        'bg-slate-700/30 border-slate-600 text-slate-300'}
                    `}>
                      {appState === AppState.COMPLETE && <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                      {appState === AppState.ERROR && <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}
                      {appState === AppState.PROCESSING && <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>}
                      {appState === AppState.PREVIEW && <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                    </div>
                    <div>
                      <p className="font-semibold text-lg text-white">
                        {appState === AppState.PREVIEW && "Ready to Process"}
                        {appState === AppState.PROCESSING && "AI is Working..."}
                        {appState === AppState.COMPLETE && "Cleaned Successfully"}
                        {appState === AppState.ERROR && "Processing Failed"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {appState === AppState.PREVIEW && `Targeting watermark ${locationDescription}.`}
                        {appState === AppState.PROCESSING && "Erasing watermark..."}
                        {appState === AppState.COMPLETE && "Watermark removed."}
                        {appState === AppState.ERROR && error}
                      </p>
                    </div>
                  </div>
                </GlassCard>

                {/* Actions */}
                <GlassCard className="flex flex-col justify-center gap-3 min-h-[120px]">
                   {appState === AppState.PREVIEW && (
                      <div className="flex gap-3">
                         <Button onClick={handleReset} variant="secondary" className="flex-1">Cancel</Button>
                         <Button onClick={handleProcess} variant="primary" className="flex-1">Remove Watermark</Button>
                      </div>
                   )}
                   {appState === AppState.PROCESSING && (
                      <Button disabled className="w-full opacity-80" variant="primary" isLoading={true}>Removing...</Button>
                   )}
                   {appState === AppState.COMPLETE && processedImage && (
                      <div className="flex gap-3">
                        <Button onClick={handleReset} variant="secondary" className="flex-1">New Image</Button>
                        <a href={processedImage} download="neon-erased.png" className="flex-1">
                          <Button variant="primary" className="w-full">
                             Download
                          </Button>
                        </a>
                      </div>
                   )}
                   {appState === AppState.ERROR && (
                      <Button onClick={handleReset} variant="secondary" className="w-full">Try Again</Button>
                   )}
                </GlassCard>

              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer / Branding */}
      <footer className="fixed bottom-4 w-full text-center text-slate-600 text-xs pointer-events-none">
        <span className="opacity-50">Powered by Gemini 2.5 Flash Image</span>
      </footer>

      {/* Global Styles for Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default App;