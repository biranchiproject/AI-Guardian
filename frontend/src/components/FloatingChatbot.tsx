import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Shield, Bot } from "lucide-react";
import { chatbot } from "@/lib/api-service";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  advice?: string;
  timestamp: Date;
}

export const FloatingChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your AI Guardian Assistant. How can I help you stay safe today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      // For now, we don't have analysis context here, but we could pass it
      const response = await chatbot(userMessage.text);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.reply,
        advice: response.advice,
        sender: "bot",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 w-80 sm:w-96 overflow-hidden rounded-2xl border border-red-500/30 bg-[#0B0F19] shadow-2xl shadow-red-500/10 backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 bg-gradient-to-r from-red-950/20 to-transparent p-4">
              <div className="flex items-center gap-2">
                <div className="relative">
                   <Bot className="h-5 w-5 text-red-500" />
                   <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                </div>
                <span className="font-semibold text-white tracking-tight">AI Guardian Expert</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="h-80 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10"
            >
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                    m.sender === "user" 
                      ? "bg-red-600 text-white shadow-lg shadow-red-600/20" 
                      : "bg-white/5 text-slate-200 border border-white/5"
                  }`}>
                    {m.text}
                    {m.advice && (
                      <div className="mt-2 border-t border-white/10 pt-2 text-[11px] text-red-400 font-medium italic">
                        🛡️ Tip: {m.advice}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/5 text-slate-400 rounded-2xl px-4 py-2 text-xs border border-white/5 animate-pulse">
                    Expert is typing...
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/5">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="relative"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your security..."
                  className="w-full rounded-full border border-white/10 bg-white/5 py-2 pl-4 pr-12 text-sm text-white placeholder:text-slate-500 focus:border-red-500/50 focus:outline-none focus:ring-0 transition-all"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="absolute right-1 top-1 rounded-full bg-red-600 p-1.5 text-white shadow-lg shadow-red-600/30 hover:bg-red-500 disabled:opacity-50 transition-all"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-xl transition-all duration-300 ${
          isOpen ? "rotate-90" : "animate-bounce shadow-red-600/40"
        }`}
      >
        {isOpen ? <X className="h-7 w-7" /> : <MessageCircle className="h-7 w-7" />}
      </motion.button>
    </div>
  );
};
