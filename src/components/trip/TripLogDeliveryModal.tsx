import React, { useState, useRef, useEffect } from 'react';
import { X, MapPin, Camera, RotateCcw, ShieldCheck, Check } from 'lucide-react';
import { DeliveryPoint, TripHistoryRecord } from '../../types';

interface TripLogDeliveryModalProps {
  trip: TripHistoryRecord;
  dpPoint: DeliveryPoint;
  isOpen: boolean;
  onClose: () => void;
  onSaveDelivery: (updatedDp: DeliveryPoint) => void;
}

export default function TripLogDeliveryModal({
  trip,
  dpPoint,
  isOpen,
  onClose,
  onSaveDelivery
}: TripLogDeliveryModalProps) {
  const [receiverName, setReceiverName] = useState(dpPoint.receiverName || '');
  const [receiverMobile, setReceiverMobile] = useState(dpPoint.receiverMobile || '');
  const [invoiceNumber, setInvoiceNumber] = useState(dpPoint.invoiceNumber || dpPoint.id || '');
  const [podNumber, setPodNumber] = useState(dpPoint.podNumber || '');
  const [deliveryRemarks, setDeliveryRemarks] = useState(dpPoint.deliveryRemarks || dpPoint.remarks || '');
  const [gpsLocation, setGpsLocation] = useState(dpPoint.gpsLocation || '');
  const [deliveryTime, setDeliveryTime] = useState(dpPoint.deliveryTime || new Date().toTimeString().split(' ')[0].substring(0, 5));
  const [status, setStatus] = useState<'Delivered' | 'Reached' | 'Skipped'>(
    (dpPoint.status === 'Pending' ? 'Delivered' : dpPoint.status) as any
  );
  
  const [photoBase64, setPhotoBase64] = useState<string>(dpPoint.proofPhoto || '');
  const [isFetchingGps, setIsFetchingGps] = useState(false);

  // Signature Canvas state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      // Set default GPS mock if not present
      if (!gpsLocation) {
        setGpsLocation("28.6139, 77.2090"); // New Delhi standard fallback
      }
      // Re-init canvas if drawing exists
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.strokeStyle = '#1e3a8a'; // Deep blue ink
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
          }
        }
      }, 300);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Fetch current GPS Coordinates
  const fetchCurrentGps = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsFetchingGps(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
        setGpsLocation(coords);
        setIsFetchingGps(false);
      },
      (error) => {
        console.warn("Geolocation fetch failed, using custom preset:", error);
        // Fallback to dummy gps near New Delhi
        setGpsLocation("28.6139, 77.2090");
        setIsFetchingGps(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  // Base64 Photo Uploader
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Signature Canvas Event Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    const { x, y } = getCoord(e);
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoord(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const getCoord = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // Check if Touch
    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Get Signature data URL from canvas
    let signatureBase64 = dpPoint.receiverSignature || '';
    const canvas = canvasRef.current;
    if (canvas) {
      // Check if canvas has strokes (not blank)
      // For simplicity, we convert canvas contents to data URL
      const dataUrl = canvas.toDataURL();
      // Only set if not matching initial blank representation (approximate check or just store)
      signatureBase64 = dataUrl;
    }

    const updatedDp: DeliveryPoint = {
      ...dpPoint,
      receiverName: receiverName.trim() || undefined,
      receiverMobile: receiverMobile.trim() || undefined,
      invoiceNumber: invoiceNumber.trim() || undefined,
      podNumber: podNumber.trim() || undefined,
      deliveryRemarks: deliveryRemarks.trim() || undefined,
      deliveryTime,
      gpsLocation,
      status,
      proofPhoto: photoBase64 || undefined,
      receiverSignature: signatureBase64 || undefined
    };

    onSaveDelivery(updatedDp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-xs p-0 sm:p-4">
      <div 
        className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl shadow-xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Logistics Delivery Receipt
            </span>
            <h3 className="text-sm font-bold text-slate-800">
              Unloading Point: {dpPoint.location}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-150 rounded-lg text-slate-400 hover:text-slate-700 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body - naturalmente scorrevole */}
        <div className="p-5 overflow-y-auto space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Delivery Status Selector */}
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                Action / Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'Delivered', label: 'Delivered', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
                  { value: 'Reached', label: 'Reached Point', color: 'bg-blue-50 text-blue-600 border-blue-200' },
                  { value: 'Skipped', label: 'Skipped Point', color: 'bg-slate-50 text-slate-600 border-slate-200' }
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setStatus(item.value as any)}
                    className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                      status === item.value
                        ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                        : `${item.color} hover:opacity-90`
                    }`}
                  >
                    {status === item.value && <Check size={14} className="stroke-[3]" />}
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Receiver Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  Receiver Name
                </label>
                <input
                  type="text"
                  required={status === 'Delivered'}
                  placeholder="e.g. Ramesh Kumar (Store Manager)"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  Receiver Mobile / Phone
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +91 99887 76655"
                  value={receiverMobile}
                  onChange={(e) => setReceiverMobile(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800"
                />
              </div>
            </div>

            {/* Document Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  Invoice Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. INV-2026-904"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  POD / LR Receipt Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. LR-90087-A"
                  value={podNumber}
                  onChange={(e) => setPodNumber(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800"
                />
              </div>
            </div>

            {/* Delivery Time and GPS Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  Delivery Time
                </label>
                <input
                  type="time"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  GPS Location Coords
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g. 28.6139, 77.2090"
                    value={gpsLocation}
                    onChange={(e) => setGpsLocation(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={fetchCurrentGps}
                    className="px-3 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 flex items-center justify-center gap-1 cursor-pointer shrink-0"
                    disabled={isFetchingGps}
                  >
                    <MapPin size={13} />
                    {isFetchingGps ? '...' : 'Fetch'}
                  </button>
                </div>
              </div>
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Remarks / Shortage Details
              </label>
              <input
                type="text"
                placeholder="e.g. Received 10 boxes intact. No damage."
                value={deliveryRemarks}
                onChange={(e) => setDeliveryRemarks(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800"
              />
            </div>

            {/* Attach Photo (Base64 file) */}
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                Photo of Cargo / Consignee Receipt
              </label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-extrabold text-slate-700 cursor-pointer border border-slate-200">
                  <Camera size={14} />
                  Choose File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
                {photoBase64 ? (
                  <div className="flex items-center gap-2">
                    <img
                      src={photoBase64}
                      alt="Proof uploaded"
                      className="w-10 h-10 object-cover rounded-lg border"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      type="button"
                      onClick={() => setPhotoBase64('')}
                      className="text-[10px] font-bold text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-400">No receipt photo selected.</span>
                )}
              </div>
            </div>

            {/* Interactive Signature Pad Canvas */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Consignee Digital Signature (Draw Below)
                </label>
                <button
                  type="button"
                  onClick={clearSignature}
                  className="text-[10px] text-red-600 hover:underline flex items-center gap-0.5 font-bold cursor-pointer"
                >
                  <RotateCcw size={10} />
                  Clear Drawing
                </button>
              </div>
              
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 relative">
                <canvas
                  ref={canvasRef}
                  width={500}
                  height={120}
                  className="w-full h-[120px] block bg-slate-50 touch-none cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                <div className="absolute bottom-2 right-3 pointer-events-none text-[8px] font-mono text-slate-350 bg-white/75 px-1.5 py-0.5 rounded border border-slate-100 uppercase tracking-widest font-extrabold">
                  Draw Ink Area
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-extrabold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold shadow-sm transition cursor-pointer"
              >
                Submit Unloading Log
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
