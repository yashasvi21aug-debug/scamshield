import React, { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';
import { Camera, Upload, X, AlertTriangle, CheckCircle, RefreshCw, Smartphone } from 'lucide-react';

export default function QrScannerModal({ isOpen, onClose, onPayloadDecoded }) {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'camera'
  const [previewUrl, setPreviewUrl] = useState(null);
  const [decodedResult, setDecodedResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const mediaStreamRef = useRef(null);

  // Stop camera when closing modal or switching tabs
  useEffect(() => {
    if (!isOpen || activeTab !== 'camera') {
      stopCamera();
    }
    if (isOpen && activeTab === 'camera') {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab]);

  // Decode an image file using an off-screen canvas and jsQR
  const handleImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setErrorMsg("Please select a valid image file (PNG, JPG, WebP).");
      return;
    }
    setErrorMsg(null);
    setDecodedResult(null);

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);

      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (code && code.data) {
        setDecodedResult(code.data);
      } else {
        setErrorMsg("No QR code detected in this image. Please ensure the code is clear and properly illuminated.");
      }
    };
    img.onerror = () => {
      setErrorMsg("Failed to read image file.");
    };
    img.src = objectUrl;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  // Live Camera Scanner
  const startCamera = async () => {
    setErrorMsg(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErrorMsg("Camera access is not supported by your browser environment.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", true);
        videoRef.current.play();
        setIsCameraActive(true);
        scanFrame();
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setErrorMsg("Unable to access camera. Please check permissions or upload a QR image instead.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const scanFrame = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert"
        });

        if (code && code.data) {
          setDecodedResult(code.data);
          stopCamera();
          return;
        }
      }
    }
    animationFrameRef.current = requestAnimationFrame(scanFrame);
  };

  const handleConfirmAndAnalyze = () => {
    if (decodedResult) {
      onPayloadDecoded(decodedResult);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-cyber-900 border border-cyber-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-cyber-800 bg-cyber-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">QR Code Scanner</h3>
              <p className="text-xs text-slate-400">Decode and extract destination from QR images or webcam</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-cyber-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-cyber-800 bg-cyber-950/20">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'upload' 
                ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyber-800/40' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Image</span>
          </button>
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'camera' 
                ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyber-800/40' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Live Camera</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2.5 text-xs text-red-300">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'upload' && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-cyber-700 hover:border-cyan-500/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-cyber-950/40 hover:bg-cyber-950/70"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])}
              />

              {previewUrl ? (
                <div className="flex flex-col items-center">
                  <img
                    src={previewUrl}
                    alt="Uploaded QR Preview"
                    className="w-40 h-40 object-contain rounded-lg border border-cyber-700 shadow-md mb-3"
                  />
                  <span className="text-xs text-cyan-400 font-medium flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" /> Click to choose another image
                  </span>
                </div>
              ) : (
                <>
                  <div className="p-4 rounded-2xl bg-cyber-900 border border-cyber-700 text-cyan-400 mb-3 shadow-inner">
                    <Upload className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-semibold text-slate-200">
                    Click to browse or drag & drop QR image
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Supports PNG, JPG, WebP screenshots or downloaded images
                  </p>
                </>
              )}
            </div>
          )}

          {activeTab === 'camera' && (
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-cyber-700">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Scanning visual reticle */}
              {isCameraActive && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-cyan-400/80 rounded-xl relative animate-pulse">
                    <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />
                    <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent top-1/2 animate-scan-line" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Decoded Output Box */}
          {decodedResult && (
            <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/40 space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                <CheckCircle className="w-4 h-4 text-cyan-400" />
                <span>QR Payload Decoded Successfully</span>
              </div>
              <div className="p-3 bg-cyber-950 rounded-lg border border-cyber-800 text-xs font-mono text-slate-200 break-all max-h-24 overflow-y-auto">
                {decodedResult}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-cyber-800 bg-cyber-950/40 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-cyber-800 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!decodedResult}
            onClick={handleConfirmAndAnalyze}
            className="px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Load into Scanner
          </button>
        </div>
      </div>
    </div>
  );
}
