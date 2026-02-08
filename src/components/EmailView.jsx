import React from 'react';
import { ArrowLeft, User, Calendar, Download, AlertCircle } from 'lucide-react';

const EmailView = ({ email, onClose }) => {
  if (!email) return null;

  const createMarkup = (htmlContent) => {
    return { __html: htmlContent };
  };

  return (
    <div className="bg-[#111] rounded-xl border border-[#222] overflow-hidden animate-fade-in min-h-[500px] flex flex-col">
      {/* Header */}
      <div className="bg-[#222] border-b border-gray-800 p-6">
        <button 
          onClick={onClose}
          className="mb-4 inline-flex items-center gap-2 text-slate-400 hover:text-emerald-500 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Inbox
        </button>

        <h1 className="text-2xl font-bold text-white mb-4 leading-tight">
          {email.subject || '(No Subject)'}
        </h1>

        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#222] flex items-center justify-center text-emerald-500 font-bold text-xl border border-[#333]">
              {email.from.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-white font-semibold text-lg">
                {email.from}
              </div>
              <div className="text-sm text-slate-400">To: {email.to || 'Me'}</div>
            </div>
          </div>
          
          <div className="text-sm text-slate-400 bg-[#222] border border-[#333] px-4 py-2 rounded-lg flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            {new Date(email.date).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Attachments */}
      {email.attachments && email.attachments.length > 0 && (
        <div className="px-6 py-4 bg-[#262626] border-b border-gray-800 flex flex-wrap gap-3">
          {email.attachments.map((file, idx) => (
            <a 
              key={idx}
              href={file.downloadUrl || '#'} 
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#333] border border-gray-700 text-emerald-400 text-sm hover:border-emerald-500 hover:shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              {file.filename}
              <span className="text-slate-500 ml-1 internal-fs">({file.size})</span>
            </a>
          ))}
        </div>
      )}

      {/* Body */}
      <div className="flex-1 p-8 bg-black overflow-hidden relative">
        <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-3 mb-6 flex items-start gap-2 text-sm text-yellow-500">
           <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
           <p>For security, external images and scripts might be blocked by your browser in this preview.</p>
        </div>

        {email.htmlBody ? (
          <div 
            className="prose prose-invert max-w-none text-slate-300"
            dangerouslySetInnerHTML={createMarkup(email.htmlBody)}
          />
        ) : (
          <div className="whitespace-pre-wrap text-slate-300 font-mono text-sm leading-relaxed bg-[#111] p-6 rounded-lg border border-gray-800">
            {email.body}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailView;
