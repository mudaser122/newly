import React from 'react';
import { Mail, ChevronRight, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const Inbox = ({ messages, onSelect, isLoading }) => {
  if (messages.length === 0) {
    return (
      <div className="w-full bg-[#111] rounded-xl border border-[#222] min-h-[400px] flex flex-col items-center justify-center p-8">
        <div className="relative mb-6">
           <div className="w-24 h-24 rounded-full bg-[#1a1a1a] flex items-center justify-center border-4 border-[#222]">
             <Mail className="w-10 h-10 text-[#444]" />
           </div>
           {isLoading && (
             <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center animate-spin border-2 border-black">
               <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full"></div>
             </div>
           )}
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2">Your inbox is empty</h3>
        <div className="text-slate-500 animate-pulse text-center">
          Waiting for incoming emails<span className="typing-dots">...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#111] rounded-xl border border-[#222] overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-12 bg-black text-slate-400 py-3 px-6 text-sm font-semibold uppercase tracking-wider border-b border-[#222]">
        <div className="col-span-3 md:col-span-3">Sender</div>
        <div className="col-span-6 md:col-span-7">Subject</div>
        <div className="col-span-3 md:col-span-2 text-right">View</div>
      </div>

      {/* Message List */}
      <div className="divide-y divide-[#222]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            onClick={() => onSelect(msg.id)}
            className="grid grid-cols-12 py-4 px-6 items-center hover:bg-[#1a1a1a] cursor-pointer transition-colors group"
          >
            <div className="col-span-3 md:col-span-3 pr-2">
              <div className="font-semibold text-white truncate" title={msg.from}>
                {msg.from.split('<')[0].trim()}
              </div>
              <div className="text-xs text-slate-500 mt-0.5" title={new Date(msg.date).toLocaleString()}>
                {formatDistanceToNow(new Date(msg.date), { addSuffix: true })}
              </div>
            </div>
            
            <div className="col-span-6 md:col-span-7 pr-2">
              <div className="font-medium text-slate-300 truncate bg-[#222] inline-block px-2 py-0.5 rounded text-sm md:bg-transparent md:px-0 md:text-base">
                {msg.subject || '(No Subject)'}
              </div>
              <div className="md:hidden text-xs text-slate-600 truncate mt-1">
                {msg.intro}
              </div>
            </div>
            
            <div className="col-span-3 md:col-span-2 flex justify-end">
              <button className="flex items-center gap-2 text-sm font-semibold text-white bg-[#064e3b] hover:bg-[#065f46] px-3 py-1.5 rounded-lg transition-colors border border-emerald-900/50">
                <span className="hidden md:inline">Open</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Inbox;
