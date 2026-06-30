import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { api } from '../../api/axios';
import { fetchBotById } from '../../store/slices/chatbotSlice';
import type { AppDispatch } from '../../store';
import { Bot, Send, Loader2 } from 'lucide-react';

export const ChatEmbed: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  // const { bots } = useSelector((state: any) => state.chatbot);
  const [bot, setBot] = useState<any>(null);
  
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchBotById(id)).unwrap().then((data) => {
        setBot(data);
      });
    }
  }, [id, dispatch]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !bot) return;

    const userMessage = inputText;
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setInputText('');
    setIsTyping(true);

    try {
      const res = await api.post(`/chatbot/${id}/chat`, {
        message: userMessage,
        history: messages.map((m) => ({ role: m.role, content: m.text })),
      });

      setMessages((prev) => [...prev, { role: 'bot', text: res.data.reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'bot', text: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!bot) {
    return (
      <div className="flex items-center justify-center h-screen bg-transparent">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  const themeColor = bot.themeColor || '#8b5cf6';

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden font-sans">
      {/* Header */}
      <div 
        className="px-4 py-3 flex items-center gap-3 shadow-sm z-10"
        style={{ backgroundColor: themeColor, color: 'var(--text-primary)' }}
      >
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
            <Bot size={24} />
          </div>
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
        </div>
        <div>
          <div className="font-bold text-sm leading-tight">{bot.name}</div>
          <div className="text-[10px] opacity-80">Online | Powered by AI</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        <div className="flex justify-start">
          <div className="max-w-[85%] bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-gray-800 border border-gray-100">
            {bot.welcomeMessage || 'Hi! How can I help you today?'}
          </div>
        </div>

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div 
              className={`max-w-[85%] p-3 rounded-2xl shadow-sm text-sm ${
                m.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
              }`}
              style={m.role === 'user' ? { backgroundColor: themeColor } : {}}
            >
              {m.text}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 flex gap-1 items-center">
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t bg-white">
        <div className="relative flex items-center">
          <input
            type="text"
            className="w-full pl-4 pr-12 py-3 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 border-none transition-all"
            style={{ '--tw-ring-color': themeColor } as any}
            placeholder="Type a message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button
            onClick={handleSendMessage}
            disabled={isTyping || !inputText.trim()}
            className="absolute right-2 p-2 rounded-full text-white transition-all transform active:scale-95 disabled:opacity-50 disabled:grayscale"
            style={{ backgroundColor: themeColor }}
          >
            <Send size={18} />
          </button>
        </div>
        <div className="mt-2 text-[10px] text-center text-gray-400">
          Powered by Wheedle Technologies
        </div>
      </div>
    </div>
  );
};
