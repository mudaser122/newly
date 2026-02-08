import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RefreshCw, Copy, Check, Trash2, Edit2, Mail, Crown, Layers, QrCode } from 'lucide-react';
import { mailService } from './services/mailService';
import Inbox from './components/Inbox';
import EmailView from './components/EmailView';
import QRCodeModal from './components/QRCodeModal';

function App() {
  const [emailAddress, setEmailAddress] = useState('');
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  
  const pollingRef = useRef(null);
  const initRef = useRef(false);
  const startPollingRef = useRef(null);

  // 1. Helper Functions (Must be defined first to avoid TDZ)
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
    }
  }, []);

  const generateNewEmail = useCallback(async () => {
    setIsLoading(true);
    stopPolling();
    setSelectedMessage(null);
    setMessages([]);
    try {
      const email = await mailService.generateEmail();
      setEmailAddress(email);
    } catch (error) {
      console.error('Failed to generate email:', error);
      // If we hit a rate limit here, we might want to show a user-friendly message
      // or try again after a delay. For now, simple error logging.
    } finally {
      setIsLoading(false);
    }
  }, [stopPolling]);

  const fetchMessages = useCallback(async () => {
    if (!emailAddress) return;
    setIsRefreshing(true);
    try {
      const msgs = await mailService.getMessages(emailAddress);
      
      // Simple diff check to avoid unnecessary re-renders if deep comparison needed
      // For now, just setting it works fine with React's reconciliation
      if (JSON.stringify(msgs) !== JSON.stringify(messages)) {
         setMessages(msgs);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      if (error.message.includes('429')) {
         console.warn('Rate limited. Stopping polling for a while.');
         stopPolling();
         // Optionally restart polling after a longer delay, e.g., 30s
         setTimeout(() => {
             if (startPollingRef.current) startPollingRef.current();
         }, 30000);
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [emailAddress, messages, stopPolling]);

  const startPolling = useCallback(() => {
    if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
    }
    fetchMessages();
    pollingRef.current = setInterval(fetchMessages, 10000); // 10s interval
  }, [fetchMessages]);

  // 2. Effects
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const initSession = async () => {
      const restoredEmail = await mailService.restoreSession();
      if (restoredEmail) {
        setEmailAddress(restoredEmail);
        setIsLoading(false);
      } else {
        generateNewEmail();
      }
    };
    initSession();
    return () => stopPolling();
  }, [generateNewEmail, stopPolling]);

  useEffect(() => {
    if (emailAddress) {
      startPolling();
    }
  }, [emailAddress, startPolling]);

  // Keep startPollingRef in sync
  useEffect(() => {
    startPollingRef.current = startPolling;
  }, [startPolling]);

  const handleSelectMessage = async (id) => {
    try {
        const fullMessage = await mailService.getMessage(emailAddress, id);
        const summary = messages.find(m => m.id === id);
        setSelectedMessage({ ...fullMessage, date: summary?.date });
    } catch (error) {
        console.error("Failed to load message body", error);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(emailAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-100 bg-black">
      
      {/* 1. Header */}
      <header className="bg-black border-b border-[#222] text-white py-4 px-4 sticky top-0 z-50">
        <div className="container-custom flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">TEMPMAIL</span>
          </div>
          
          <div className="flex items-center gap-3">
             <button className="hidden md:flex items-center gap-2 bg-[#111] hover:bg-[#222] px-4 py-2 rounded-full text-sm font-medium transition-colors border border-[#333]">
               <span className="text-slate-400">Temp Number</span>
             </button>
             <button className="flex items-center gap-2 bg-[#10b981] hover:bg-[#059669] text-white px-5 py-2 rounded-full text-sm font-bold transition-transform hover:scale-105 shadow-lg shadow-emerald-500/20">
               <Crown className="w-4 h-4" />
               Premium
             </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section (Email input) */}
      <section className="bg-black text-white pt-12 pb-24 relative overflow-hidden">
        {/* Abstract Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ 
               backgroundImage: 'radial-gradient(circle at 20% 20%, #444 1px, transparent 1px), radial-gradient(circle at 80% 80%, #444 1px, transparent 1px)', 
               backgroundSize: '40px 40px' 
             }}>
        </div>

        <div className="container-custom relative z-10 flex flex-col items-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Your Temporary Email Address</h2>
          
          <div className="w-full max-w-3xl bg-[#111] rounded-2xl p-2 pl-6 flex items-center shadow-2xl shadow-emerald-900/10 border border-[#222] mx-4">
            {isLoading ? (
               <div className="flex-1 flex items-center gap-3 py-3 text-slate-400">
                 <RefreshCw className="w-5 h-5 animate-spin" />
                 <span>Generating secure address...</span>
               </div>
            ) : (
                <input 
                  type="text" 
                  value={emailAddress} 
                  readOnly 
                  className="flex-1 bg-transparent border-none outline-none text-xl md:text-2xl text-white font-mono tracking-wide placeholder-slate-700 truncate"
               />
            )}
            
            <div className="flex items-center gap-2 ml-4">
              <button 
                onClick={() => setShowQR(true)}
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#222] hover:bg-[#333] text-slate-400 transition-colors"
                title="QR Code"
              >
                <QrCode className="w-6 h-6" />
              </button>
              <button 
                onClick={copyToClipboard}
                className={`
                  w-14 h-14 flex items-center justify-center rounded-xl transition-all duration-300 shadow-lg
                  ${copied ? 'bg-emerald-500 text-white scale-110' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}
                `}
                title="Copy to Clipboard"
              >
                {copied ? <Check className="w-7 h-7" /> : <Copy className="w-7 h-7" />}
              </button>
            </div>
          </div>
          
          <p className="mt-8 text-slate-400 text-sm md:text-base text-center max-w-2xl px-4 leading-relaxed">
            Forget about spam, advertising mailings, hacking and attacking robots. 
            Keep your real mailbox clean and secure. Temp Mail provides temporary, secure, anonymous, free, disposable email address.
          </p>
        </div>
      </section>

      {/* 3. Action Bar */}
      <div className="container-custom -mt-8 relative z-20 mb-4">
        <div className="bg-[#111] rounded-2xl shadow-xl shadow-black border border-[#222] p-2 md:p-4 flex flex-wrap justify-center gap-4 md:gap-8 mx-auto max-w-4xl">
           <button 
             onClick={copyToClipboard}
             className="flex flex-col md:flex-row items-center gap-2 px-6 py-3 rounded-xl hover:bg-emerald-300 transition-colors group min-w-[100px] md:min-w-0"
           >
             <Copy className="w-5 h-5 text-slate-500 group-hover:text-emerald-500 mb-1 md:mb-0" />
             <span className="font-medium text-slate-400 group-hover:text-white transition-colors">Copy</span>
           </button>
           
           <div className="w-px h-10 bg-[#333] hidden md:block"></div>
           
           <button 
             onClick={fetchMessages}
             disabled={isRefreshing}
             className="flex flex-col md:flex-row items-center gap-2 px-6 py-3 rounded-xl hover:bg-amber-300 transition-colors group min-w-[100px] md:min-w-0"
           >
             <RefreshCw className={`w-5 h-5 text-slate-500 group-hover:text-emerald-500 mb-1 md:mb-0 ${isRefreshing ? 'animate-spin' : ''}`} />
             <span className="font-medium text-slate-400 group-hover:text-white transition-colors">Refresh</span>
           </button>
           
           <div className="w-px h-10 bg-[#333] hidden md:block"></div>
           
           <button 
             onClick={generateNewEmail}
             className="flex flex-col md:flex-row items-center gap-2 px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors group min-w-[100px] md:min-w-0"
           >
             <Edit2 className="w-5 h-5 text-slate-500 group-hover:text-emerald-500 mb-1 md:mb-0" />
             <span className="font-medium text-slate-400 group-hover:text-white transition-colors">Change</span>
           </button>
           
           <div className="w-px h-10 bg-[#333] hidden md:block"></div>
           
           <button 
             onClick={generateNewEmail}
             className="flex flex-col md:flex-row items-center gap-2 px-6 py-3 rounded-xl hover:bg-red-50 transition-colors group min-w-[100px] md:min-w-0"
           >
             <Trash2 className="w-5 h-5 text-slate-500 group-hover:text-red-500 mb-1 md:mb-0" />
             <span className="font-medium text-slate-400 group-hover:text-red-500 transition-colors">Delete</span>
           </button>
        </div>
      </div>

      {/* 2-Column Layout for Main Content & Sidebar */}
      <div className="container-custom flex flex-col lg:flex-row gap-8 pb-12">
        
        {/* Left Column: Content */}
        <div className="flex-1 min-w-0">
          


          {/* Main Content (Inbox / Email View) */}
          <main className="w-full">
            {selectedMessage ? (
              <EmailView 
                email={selectedMessage} 
                onClose={() => setSelectedMessage(null)} 
              />
            ) : (
              <Inbox 
                messages={messages} 
                onSelect={handleSelectMessage} 
                isLoading={isRefreshing}
              />
            )}
          </main>
          

        </div>



      </div>

      {/* Footer */}
      <footer className="bg-black border-t border-[#222] py-8 mt-auto">
        <div className="container-custom text-center text-slate-600 text-sm">
          &copy; {new Date().getFullYear()} TempMail. All rights reserved.
        </div>
      </footer>

      {/* QR Code Modal */}
      {showQR && (
        <QRCodeModal 
            email={emailAddress} 
            onClose={() => setShowQR(false)} 
        />
      )}

    </div>
  );
}

export default App;
