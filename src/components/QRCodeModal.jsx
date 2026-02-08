import React from 'react';
import { X, Download } from 'lucide-react';

const QRCodeModal = ({ email, onClose }) => {
  if (!email) return null;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(email)}&bgcolor=111&color=fff&margin=10`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="bg-[#111] border border-[#222] rounded-2xl p-6 max-w-sm w-full relative shadow-2xl shadow-emerald-500/10 flex flex-col items-center"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-white mb-6">Scan QR Code</h3>

        <div className="bg-white p-2 rounded-xl mb-6">
            <img 
                src={qrUrl} 
                alt={`QR Code for ${email}`} 
                className="w-48 h-48 rounded-lg"
            />
        </div>

        <div className="w-full bg-[#1a1a1a] rounded-lg p-3 mb-6 text-center">
            <p className="text-slate-400 text-sm mb-1">Email Address</p>
            <p className="text-white font-mono break-all font-medium select-all">{email}</p>
        </div>

        <a 
            href={qrUrl} 
            download={`qr-${email}.png`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-medium transition-colors w-full justify-center"
        >
            <Download className="w-4 h-4" />
            Download QR
        </a>
      </div>
    </div>
  );
};

export default QRCodeModal;
