import React, { useState, useRef, useEffect } from 'react';
import { getHealthChatResponse } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Send, X, Bot, User, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function HealthuChat({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage: ChatMessage = { role: 'user', parts: [{ text: input }] };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const history = [...messages, userMessage];
    const responseText = await getHealthChatResponse(history);
    
    setIsTyping(false);
    setMessages(prev => [...prev, { role: 'model', parts: [{ text: responseText }] }]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          className="fixed bottom-4 right-4 left-4 z-[100] flex flex-col sm:left-auto sm:w-[400px] h-[600px] max-h-[85vh] bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-blue-600 p-5 flex items-center justify-between text-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold flex items-center gap-1.5">
                  Healthu AI <Sparkles className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                </h3>
                <p className="text-[10px] uppercase font-bold tracking-widest text-blue-100">Medical Assistant</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Warning */}
          <div className="bg-amber-50 px-4 py-2 flex items-center gap-2 border-b border-amber-100">
            <AlertCircle className="w-3 h-3 text-amber-600" />
            <p className="text-[10px] font-bold text-amber-700 uppercase">Not a substitute for professional clinical advice.</p>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-[20px] flex items-center justify-center">
                  <Bot className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Hi! I'm Healthu</h4>
                  <p className="text-sm text-slate-500 mt-1">Ask me about your health reports, symptoms, or medication guidance.</p>
                </div>
              </div>
            )}
            
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`p-4 rounded-[20px] text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-none whitespace-pre-wrap'
                  }`}>
                    {msg.parts[0].text}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-[85%]">
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white p-4 rounded-[20px] rounded-tl-none shadow-sm border border-slate-100 flex gap-1 items-center">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-slate-100">
            <form onSubmit={handleSend} className="relative flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="How can I help you today?"
                className="flex-1 bg-slate-50 border-none rounded-2xl py-4 pl-5 pr-12 text-sm focus:ring-2 focus:ring-blue-600 transition-all font-medium"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="absolute right-2 w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center transition-all hover:bg-blue-700 active:scale-95 disabled:bg-slate-300"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
