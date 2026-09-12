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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-[#E2E2D9] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-[#464B71] text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 text-[#7CD5C7] border border-white/10">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">QR Code Scanner</h3>
              <p className="text-xs text-slate-300">Decode and extract destination from QR images or webcam</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-[#E2E2D9] bg-[#F9F9F6]">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              activeTab === 'upload' 
                ? 'text-[#118AB2] border-b-2 border-[#118AB2] bg-white' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Image</span>
          </button>
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              activeTab === 'camera' 
                ? 'text-[#118AB2] border-b-2 border-[#118AB2] bg-white' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Live Camera</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'upload' && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#E2E2D9] hover:border-[#118AB2]/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-[#F9F9F6] hover:bg-[#F2F2ED]"
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
                    className="w-40 h-40 object-contain rounded-lg border border-[#E2E2D9] shadow-md mb-3"
                  />
                  <span className="text-xs text-[#118AB2] font-medium flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" /> Click to choose another image
                  </span>
                </div>
              ) : (
                <>
                  <div className="p-4 rounded-2xl bg-white border border-[#E2E2D9] text-[#118AB2] mb-3 shadow-sm">
                    <Upload className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-semibold text-[#2A2E45]">
                    Click to browse or drag & drop QR image
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports PNG, JPG, WebP screenshots or downloaded images
                  </p>
                </>
              )}
            </div>
          )}

          {activeTab === 'camera' && (
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-[#E2E2D9]">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Scanning visual reticle */}
              {isCameraActive && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-[#118AB2]/80 rounded-xl relative animate-pulse">
                    <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#118AB2]" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[#118AB2]" />
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[#118AB2]" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#118AB2]" />
                    <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#118AB2] to-transparent top-1/2 animate-scan-line" />
                  </div>
                </div>
              )}
            </div>
          )}

          {decodedResult && (
            <div className="p-4 rounded-xl bg-[#7CD5C7]/15 border border-[#7CD5C7]/50 space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0F766E] uppercase tracking-wider">
                <CheckCircle className="w-4 h-4 text-[#0F766E]" />
                <span>QR Payload Decoded Successfully</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-[#E2E2D9] text-xs font-mono text-[#2A2E45] break-all max-h-24 overflow-y-auto">
                {decodedResult}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E2E2D9] bg-[#F9F9F6] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!decodedResult}
            onClick={handleConfirmAndAnalyze}
            className="px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#118AB2] hover:bg-[#0E7490] text-white shadow-lg shadow-[#118AB2]/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Load into Scanner
          </button>
        </div>
      </div>
    </div>
  );
}
