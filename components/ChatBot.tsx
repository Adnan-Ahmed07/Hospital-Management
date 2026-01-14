import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Minimize2, Maximize2, Sparkles, User, Bot } from 'lucide-react';
import { chatApi } from '../services/api';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'model', text: "Hello! I'm the AD Hospital Assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Prepare history for context
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      const response = await chatApi.sendMessage(userMsg.text, history);
      
      const botMsg: Message = { 
          id: (Date.now() + 1).toString(), 
          role: 'model', 
          text: response.text 
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      const errorMsg: Message = { 
          id: (Date.now() + 1).toString(), 
          role: 'model', 
          text: "I'm sorry, I encountered an error. Please try again later." 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 bg-gradient-to-r from-teal-600 to-emerald-600 text-white p-4 rounded-full shadow-2xl hover:scale-105 hover:shadow-teal-600/30 transition-all z-50 group"
        aria-label="Open Chat"
      >
        <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-75 group-hover:opacity-100"></div>
        <MessageCircle className="w-8 h-8 relative z-10" />
      </button>
    );
  }

  return (
    <div 
        className={`fixed z-50 transition-all duration-300 ease-in-out shadow-2xl overflow-hidden bg-white border border-slate-200
        ${isMinimized 
            ? 'bottom-6 right-6 w-72 h-16 rounded-t-xl rounded-b-none' 
            : 'bottom-6 right-6 w-[90vw] md:w-96 h-[500px] max-h-[80vh] rounded-2xl'
        }`}
    >
      {/* Header */}
      <div 
        className="bg-slate-900 p-4 flex items-center justify-between cursor-pointer"
        onClick={() => isMinimized ? setIsMinimized(false) : null}
      >
        <div className="flex items-center gap-3">
            <div className="p-1.5 bg-teal-500/20 rounded-lg backdrop-blur-md">
                 <Sparkles className="w-5 h-5 text-teal-300" />
            </div>
            <div>
                <h3 className="font-bold text-white text-sm">AI Assistant</h3>
                <span className="flex items-center gap-1.5 text-[10px] text-teal-400 font-medium">
                    <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse"></span> Online
                </span>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <button 
                onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 transition-colors"
            >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button 
                onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                className="p-1.5 hover:bg-red-500/20 text-slate-300 hover:text-red-400 rounded-lg transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 h-[380px] space-y-4 scroll-smooth">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm border
                    ${msg.role === 'user' ? 'bg-slate-200 border-slate-300' : 'bg-teal-100 border-teal-200 text-teal-700'}`}
                >
                    {msg.role === 'user' ? <User className="w-4 h-4 text-slate-600" /> : <Bot className="w-4 h-4" />}
                </div>
                
                <div 
                    className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm
                    ${msg.role === 'user' 
                        ? 'bg-slate-800 text-white rounded-tr-none' 
                        : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'}`}
                >
                   {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                 <div className="w-8 h-8 rounded-full bg-teal-100 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about doctors, services..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
            />
            <button 
                type="submit" 
                disabled={loading || !input.trim()}
                className="bg-teal-600 text-white p-2.5 rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-teal-600/20"
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default ChatBot;