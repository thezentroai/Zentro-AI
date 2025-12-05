import React, { useState, useEffect, useRef } from 'react';
import { Menu, X } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { InputArea } from './components/InputArea';
import { MessageBubble } from './components/MessageBubble';
import { TypingIndicator } from './components/TypingIndicator';
import { geminiService } from './services/geminiService';
import { Message, Role } from './types';
import { WELCOME_MESSAGE } from './constants';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    const initialMessage: Message = {
      id: 'welcome',
      role: Role.MODEL,
      text: WELCOME_MESSAGE,
      timestamp: Date.now(),
    };
    setMessages([initialMessage]);
  }, []);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleNewChat = () => {
    setMessages([{
      id: Date.now().toString(),
      role: Role.MODEL,
      text: WELCOME_MESSAGE,
      timestamp: Date.now(),
    }]);
    geminiService.startNewChat();
    setIsSidebarOpen(false);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add User Message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      text: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Create a placeholder for the bot response
      const botMessageId = (Date.now() + 1).toString();
      let botMessageText = "";
      
      const botMessage: Message = {
        id: botMessageId,
        role: Role.MODEL,
        text: "",
        timestamp: Date.now(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, botMessage]);

      const stream = geminiService.sendMessageStream(text);

      for await (const chunk of stream) {
        botMessageText += chunk;
        setMessages((prev) => 
          prev.map((msg) => 
            msg.id === botMessageId 
              ? { ...msg, text: botMessageText } 
              : msg
          )
        );
      }

      // Finalize message
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === botMessageId 
            ? { ...msg, isStreaming: false } 
            : msg
        )
      );

    } catch (error: any) {
      console.error(error);
      
      // Determine user-friendly error message
      let errorText = "I'm sorry, I encountered an error while processing your request. Please try again later.";
      
      if (error.message && (error.message.includes("API Key") || error.message.includes("API_KEY"))) {
        errorText = "Setup Error: The API Key is missing. If you are running this on GitHub Pages, you must configure your build process to inject `process.env.API_KEY`.";
      }

      const errorMessage: Message = {
        id: Date.now().toString(),
        role: Role.MODEL,
        text: errorText,
        timestamp: Date.now(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        onNewChat={handleNewChat} 
        isOpen={isSidebarOpen} 
        onCloseMobile={() => setIsSidebarOpen(false)} 
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative">
        
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 z-10">
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-gray-800 text-lg">Zentro AI</h1>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8 bg-gray-50 scroll-smooth">
          <div className="max-w-3xl mx-auto">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isTyping && messages[messages.length - 1]?.role === Role.USER && (
               <TypingIndicator />
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>

        {/* Input Area */}
        <InputArea onSendMessage={handleSendMessage} disabled={isTyping} />
      </div>
    </div>
  );
};

export default App;
