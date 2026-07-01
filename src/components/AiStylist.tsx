import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Sparkles, Send, Bot, User, RefreshCw, Loader2 } from 'lucide-react';

export const AiStylist: React.FC = () => {
  const { t } = useStore();
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: t('aiStylistIntro') }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested Starter Questions
  const starterQuestions = [
    "What pairs well with a traditional crimson Saree?",
    "Suggest a minimalist gold band for daily stack.",
    "Explain the difference between 18k and 22k gold.",
    "What is the significance of the Mandala design in jewelry?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] })
      });

      const data = await response.json();
      if (response.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `I apologize, my premium connection is offline. Details: ${data.error || 'Server error'}. Please verify your GEMINI_API_KEY.` 
        }]);
      }
    } catch (error) {
      console.error('Stylist request error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I am unable to access the styling mainframe right now. Please check your network connection or server status." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: t('aiStylistIntro') }]);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Intro Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#1A1A1A] text-white shadow-md ring-4 ring-[#C5A059]/20 mb-3 animate-bounce">
          <Sparkles className="h-7 w-7 text-[#C5A059]" />
        </div>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
          {t('aiStylistTitle')}
        </h1>
        <p className="mx-auto mt-2 max-w-lg font-sans text-sm font-medium text-stone-500">
          Powered by Gemini Pro with Deep Reasoning. Get tailored gemstone curation, matching outfits advice, and legacy styling secrets instantly.
        </p>
      </div>

      {/* Main Chat Interface */}
      <div className="flex h-[550px] flex-col rounded-2xl border border-[#E5E5E5] bg-white shadow-sm overflow-hidden">
        
        {/* Chat Header Control */}
        <div className="flex items-center justify-between bg-stone-50 border-b border-[#E5E5E5] px-6 py-4">
          <div className="flex items-center space-x-2.5">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
              Gemini 3.1 Pro Stylist • Online
            </span>
          </div>
          <button 
            onClick={clearChat}
            className="flex items-center space-x-1 text-xs font-bold text-stone-500 hover:text-[#C5A059] transition-colors"
            title="Reset Chat"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#FDFCFB]/30">
          {messages.map((msg, idx) => (
            <div 
              key={idx}
              className={`flex items-start gap-3.5 max-w-[85%] ${
                msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar */}
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-[#C5A059] text-white' 
                  : 'bg-[#1A1A1A] text-white'
              }`}>
                {msg.role === 'user' ? <User className="h-4.5 w-4.5" /> : <Bot className="h-4.5 w-4.5 text-[#C5A059]" />}
              </div>

              {/* Balloon */}
              <div className={`rounded-2xl px-4.5 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#1A1A1A] text-white rounded-tr-none'
                  : 'bg-white text-stone-800 border border-stone-100 shadow-sm rounded-tl-none'
              }`}>
                <p className="whitespace-pre-wrap font-sans font-medium">{msg.content}</p>
              </div>
            </div>
          ))}

          {/* Loader */}
          {isLoading && (
            <div className="flex items-start gap-3.5 mr-auto max-w-[85%]">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1A1A1A] text-white shadow-sm">
                <Bot className="h-4.5 w-4.5 text-[#C5A059]" />
              </div>
              <div className="rounded-2xl rounded-tl-none border border-stone-100 bg-stone-50 px-5 py-3 shadow-sm flex items-center space-x-2.5">
                <Loader2 className="h-4 w-4 animate-spin text-[#1A1A1A]" />
                <span className="text-xs font-medium text-[#1A1A1A] italic">AI Stylist is thinking deeply...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompt Rails */}
        {messages.length === 1 && (
          <div className="px-6 py-3 border-t border-[#E5E5E5] bg-stone-50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5A059] block mb-2">
              Suggested styling queries:
            </span>
            <div className="flex flex-wrap gap-2">
              {starterQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-700 font-medium shadow-sm transition-all hover:bg-[#1A1A1A] hover:text-white hover:border-[#1A1A1A]"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="border-t border-[#E5E5E5] px-6 py-4 bg-white">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="flex items-center space-x-3"
          >
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('aiStylistPlaceholder')}
              disabled={isLoading}
              className="flex-1 rounded-xl border border-stone-200 bg-[#FDFCFB]/50 px-4 py-3 text-sm focus:border-[#C5A059] focus:outline-none focus:ring-1 focus:ring-[#C5A059] disabled:opacity-50"
            />
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1A1A1A] text-white shadow transition-all hover:bg-[#C5A059] active:scale-95 disabled:bg-stone-100 disabled:text-stone-400 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
