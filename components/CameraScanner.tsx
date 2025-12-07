import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, Zap, ZapOff, ZoomIn, ZoomOut } from 'lucide-react';

interface CameraScannerProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
}

export const CameraScanner: React.FC<CameraScannerProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  
  // Camera Capabilities State
  const [track, setTrack] = useState<MediaStreamTrack | null>(null);
  const [hasFlash, setHasFlash] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [hasZoom, setHasZoom] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [zoomRange, setZoomRange] = useState<{min: number, max: number, step: number}>({ min: 1, max: 1, step: 0.1 });

  useEffect(() => {
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCamera = async () => {
    try {
      // Request high resolution for better OCR
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Check capabilities for Zoom and Torch
      const videoTrack = mediaStream.getVideoTracks()[0];
      setTrack(videoTrack);

      const capabilities = videoTrack.getCapabilities() as any; // Type assertion for newer web features
      
      if (capabilities.torch) {
        setHasFlash(true);
      }

      if (capabilities.zoom) {
        setHasZoom(true);
        setZoomRange({
          min: capabilities.zoom.min,
          max: capabilities.zoom.max,
          step: capabilities.zoom.step
        });
        setZoom(capabilities.zoom.min);
      }

    } catch (err) {
      setError("Unable to access camera. Please allow permissions.");
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => {
        // Try to turn off flash before stopping
        if (flashOn) {
           try { track.applyConstraints({ advanced: [{ torch: false } as any] }); } catch(e) {}
        }
        track.stop();
      });
      setStream(null);
      setTrack(null);
    }
  };

  const toggleFlash = async () => {
    if (!track || !hasFlash) return;
    try {
      await track.applyConstraints({
        advanced: [{ torch: !flashOn } as any]
      });
      setFlashOn(!flashOn);
    } catch (err) {
      console.error("Failed to toggle flash", err);
    }
  };

  const handleZoomChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newZoom = parseFloat(e.target.value);
    setZoom(newZoom);
    if (!track || !hasZoom) return;
    
    try {
      await track.applyConstraints({
        advanced: [{ zoom: newZoom } as any]
      });
    } catch (err) {
       console.error("Failed to set zoom", err);
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        stopCamera();
        onCapture(imageData);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg relative bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700">
        
        {/* Top Controls */}
        <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start">
           {hasFlash ? (
              <button 
                onClick={toggleFlash} 
                className={`p-3 rounded-full transition shadow-lg ${flashOn ? 'bg-yellow-400 text-slate-900' : 'bg-slate-800/80 backdrop-blur-md text-white hover:bg-slate-700'}`}
              >
                {flashOn ? <Zap size={20} fill="currentColor" /> : <ZapOff size={20} />}
              </button>
           ) : (
             <div></div> /* Spacer to keep Close button right-aligned */
           )}
          
          <button onClick={() => { stopCamera(); onClose(); }} className="p-2 bg-slate-800/80 backdrop-blur-md rounded-full text-white hover:bg-slate-700 transition shadow-lg">
            <X size={24} />
          </button>
        </div>

        {error ? (
          <div className="h-96 flex flex-col items-center justify-center text-white p-6 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button onClick={onClose} className="px-4 py-2 bg-white text-black rounded-lg">Close</button>
          </div>
        ) : (
          <>
            <div className="relative h-[65vh] w-full bg-black">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              
              {/* Document Frame Guide */}
              <div className="absolute inset-8 border-2 border-dashed border-indigo-400/50 rounded-lg pointer-events-none flex items-center justify-center">
                 <p className="text-white/50 text-sm font-medium bg-black/50 px-3 py-1 rounded-full">Align document here</p>
              </div>

              {/* Zoom Control Overlay */}
              {hasZoom && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-3/4 max-w-xs bg-black/50 backdrop-blur-md rounded-full px-4 py-2 flex items-center gap-3 shadow-lg border border-white/10">
                  <ZoomOut size={16} className="text-white/70" />
                  <input 
                    type="range" 
                    min={zoomRange.min} 
                    max={zoomRange.max} 
                    step={zoomRange.step} 
                    value={zoom}
                    onChange={handleZoomChange}
                    className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <ZoomIn size={16} className="text-white/70" />
                </div>
              )}
            </div>
            
            <div className="p-6 flex justify-center items-center bg-slate-900 space-y-2 flex-col">
               <button 
                onClick={handleCapture}
                className="group relative flex items-center justify-center h-20 w-20 rounded-full bg-white hover:bg-gray-100 transition-all active:scale-95"
              >
                <div className="absolute inset-0 rounded-full border-4 border-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></div>
                <Camera size={32} className="text-slate-900" />
              </button>
              <p className="text-slate-400 text-sm mt-4">
                Take a photo of a resume, certificate, or activity log
              </p>
            </div>
          </>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};