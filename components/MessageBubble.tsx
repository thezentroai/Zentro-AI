import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { User, Bot, AlertCircle, Check, Copy } from 'lucide-react';
import { Message, Role } from '../types';

interface MessageBubbleProps {
  message: Message;
}

const CodeBlock = ({ language, children, ...props }: any) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(String(children));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <div className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleCopy}
          className="p-1.5 bg-gray-700/50 hover:bg-gray-700 text-white rounded-md backdrop-blur-sm transition-colors border border-gray-600"
          title="Copy code"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      <SyntaxHighlighter
        {...props}
        style={vscDarkPlus}
        language={language}
        PreTag="div"
        customStyle={{ margin: '1em 0', borderRadius: '0.5rem', padding: '1.5em 1em 1em 1em' }}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    </div>
  );
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === Role.USER;
  const isError = message.isError;

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`
          flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center
          ${isUser ? 'bg-indigo-600' : isError ? 'bg-red-500' : 'bg-zentro-600'}
          text-white shadow-sm mt-1
        `}>
          {isUser ? <User size={16} /> : isError ? <AlertCircle size={16} /> : <Bot size={16} />}
        </div>

        {/* Bubble Content */}
        <div className={`
          flex flex-col
          ${isUser ? 'items-end' : 'items-start'}
        `}>
          <div className={`
            px-5 py-3.5 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed overflow-hidden
            ${isUser 
              ? 'bg-white text-gray-800 border border-gray-100 rounded-tr-none' 
              : isError
                ? 'bg-red-50 text-red-800 border border-red-100 rounded-tl-none'
                : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
            }
          `}>
             {isError ? (
               <p>{message.text}</p>
             ) : (
               <div className="markdown-body">
                 <ReactMarkdown
                  components={{
                    code({node, inline, className, children, ...props}: any) {
                      const match = /language-(\w+)/.exec(className || '')
                      return !inline && match ? (
                        <CodeBlock language={match[1]} {...props}>
                          {children}
                        </CodeBlock>
                      ) : (
                        <code {...props} className={`${className} bg-gray-100 text-red-500 px-1 py-0.5 rounded text-xs md:text-sm font-mono`}>
                          {children}
                        </code>
                      )
                    }
                  }}
                 >
                   {message.text}
                 </ReactMarkdown>
               </div>
             )}
          </div>
          <span className="text-xs text-gray-400 mt-1 px-1">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};
