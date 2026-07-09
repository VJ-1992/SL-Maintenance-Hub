import React, { useState } from 'react';
import { FileText, Upload, Eye, Image as ImageIcon, CheckCircle, Trash } from 'lucide-react';
import { TripHistoryRecord } from '../../types';

interface TripDocumentsSectionProps {
  trip: TripHistoryRecord;
  onUpdateDocuments: (updatedDocs: NonNullable<TripHistoryRecord['documents']>) => void;
}

export default function TripDocumentsSection({
  trip,
  onUpdateDocuments
}: TripDocumentsSectionProps) {
  const docs = trip.documents || {};
  const [previewDoc, setPreviewDoc] = useState<{ url: string; title: string } | null>(null);

  const handleUpload = (type: 'invoice' | 'lr' | 'eWayBill' | 'pod') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        onUpdateDocuments({
          ...docs,
          [type]: base64
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = (type: 'invoice' | 'lr' | 'eWayBill' | 'pod') => (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Remove this ${type.toUpperCase()} document?`)) {
      onUpdateDocuments({
        ...docs,
        [type]: undefined
      });
    }
  };

  const renderDocCard = (type: 'invoice' | 'lr' | 'eWayBill' | 'pod', label: string) => {
    const val = docs[type];
    return (
      <div className="bg-slate-50 rounded-xl border border-slate-200/60 p-4 flex flex-col justify-between hover:border-blue-200 transition duration-150">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg ${val ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
              <FileText size={18} />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Document Class
              </span>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-tight">{label}</h4>
            </div>
          </div>
          {val && (
            <div className="flex gap-1.5">
              <button
                onClick={() => setPreviewDoc({ url: val, title: label })}
                className="p-1.5 hover:bg-white text-slate-500 hover:text-blue-600 rounded-lg transition"
                title="Preview"
              >
                <Eye size={13} />
              </button>
              <button
                onClick={handleRemove(type)}
                className="p-1.5 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-lg transition"
                title="Delete"
              >
                <Trash size={13} />
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200/50 flex items-center justify-between">
          {val ? (
            <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-1 uppercase tracking-wider">
              <CheckCircle size={10} className="stroke-[2.5]" />
              Attached (Base64)
            </span>
          ) : (
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              No Document File
            </span>
          )}

          <label className="text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer flex items-center gap-1">
            <Upload size={10} />
            Upload
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleUpload(type)}
              className="hidden"
            />
          </label>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
        <div>
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
            Trip Dispatch Documents
          </span>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            LR, Invoice, E-Way Bill & POD
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {renderDocCard('invoice', 'Invoice Doc')}
        {renderDocCard('lr', 'Lorry Receipt (LR)')}
        {renderDocCard('eWayBill', 'E-Way Bill')}
        {renderDocCard('pod', 'Proof of Delivery')}
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4" onClick={() => setPreviewDoc(null)}>
          <div className="bg-white max-w-2xl w-full rounded-2xl shadow-xl border overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-3 border-b flex justify-between items-center bg-slate-50">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Document Preview: {previewDoc.title}
              </h3>
              <button onClick={() => setPreviewDoc(null)} className="p-1.5 hover:bg-slate-250 rounded-lg text-slate-400">
                <X size={15} />
              </button>
            </div>
            <div className="p-5 flex justify-center items-center max-h-[70vh] overflow-y-auto bg-slate-100/50">
              {previewDoc.url.startsWith('data:image') || previewDoc.url.startsWith('http') ? (
                <img
                  src={previewDoc.url}
                  alt={previewDoc.title}
                  className="max-w-full max-h-[60vh] object-contain rounded-lg border shadow-xs"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="p-10 text-center space-y-2">
                  <FileText size={48} className="text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">PDF / Binary Document File</p>
                  <p className="text-[10px] text-slate-400">Base64 source ready. External rendering is disabled in sandboxed mode.</p>
                </div>
              )}
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t flex justify-end">
              <button onClick={() => setPreviewDoc(null)} className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold">
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Icon for closing document preview modal
function X({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x">
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}
