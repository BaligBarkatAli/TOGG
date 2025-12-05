import React, { useState, useRef, useEffect } from 'react';
import { useHome } from './HomeContext';
import { Send, X, Bot, User, Mic } from 'lucide-react';

const AiChat: React.FC = () => {
  const { isAiOpen, toggleAiChat, chatHistory, sendAiMessage, isListening, startVoiceControl, stopVoiceControl } = useHome();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isAiOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendAiMessage(input);
    setInput('');
  };

  if (!isAiOpen) return null;

  return (
    <div className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-50 w-[90vw] md:w-96 h-[500px] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 p-4 flex justify-between items-center text-white">
        <div className="flex items-center gap-2">
          <Bot className="w-6 h-6" />
          <div>
            <h3 className="font-bold text-sm">TOGG Assistant</h3>
            <p className="text-[10px] opacity-80">Powered by Gemini AI</p>
          </div>
        </div>
        <button onClick={toggleAiChat} className="p-1 hover:bg-white/20 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950">
        {chatHistory.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${
              msg.sender === 'user' 
                ? 'bg-violet-600 text-white rounded-br-none' 
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none shadow-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        <button 
          type="button"
          onMouseDown={startVoiceControl}
          onMouseUp={stopVoiceControl}
          onTouchStart={startVoiceControl}
          onTouchEnd={stopVoiceControl}
          className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white' : 'text-slate-400 hover:text-violet-500'}`}
        >
          <Mic className="w-5 h-5" />
        </button>
        <button 
          type="submit" 
          disabled={!input.trim()}
          className="p-2 bg-violet-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-violet-500 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default AiChat;