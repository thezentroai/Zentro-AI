import React from 'react';
import { PlusCircle, MessageSquare, ExternalLink, Github, Zap } from 'lucide-react';

interface SidebarProps {
  onNewChat: () => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNewChat, isOpen, onCloseMobile }) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-20 md:hidden backdrop-blur-sm"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed md:relative z-30 flex flex-col h-full w-64 bg-gray-900 text-white transition-transform duration-300 ease-in-out border-r border-gray-800
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        
        {/* Header */}
        <div className="p-5 flex items-center gap-3 border-b border-gray-800">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-zentro-400 to-zentro-600 flex items-center justify-center shadow-lg shadow-zentro-500/20">
            <Zap size={20} className="text-white fill-current" />
          </div>
          <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Zentro AI
          </h1>
        </div>

        {/* Actions */}
        <div className="p-4">
          <button
            onClick={() => {
              onNewChat();
              onCloseMobile();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 bg-zentro-600 hover:bg-zentro-700 text-white rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 group"
          >
            <PlusCircle size={20} className="group-hover:rotate-90 transition-transform" />
            <span className="font-medium">New Chat</span>
          </button>
        </div>

        {/* Navigation / Placeholder History */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-2">Recents</div>
            <div className="space-y-1">
                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 rounded-lg transition-colors text-left truncate">
                    <MessageSquare size={16} className="flex-shrink-0" />
                    <span className="truncate">Current Session</span>
                </button>
            </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-gray-900/50">
           <div className="flex flex-col gap-2">
             <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800">
                <ExternalLink size={16} />
                <span>Help & FAQ</span>
             </a>
              <div className="text-xs text-gray-600 px-3 mt-2">
                Powered by Gemini 2.5 Flash
              </div>
           </div>
        </div>
      </div>
    </>
  );
};
