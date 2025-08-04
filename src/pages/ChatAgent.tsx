import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';
import { chatApi } from '@/utils/api';
import { strings } from '@/utils/strings';
import { ChatSkeleton } from '@/components/common/SkeletonLoader';
import { LoadingButton } from '@/components/common/LoadingButton';
import { PersianInput } from '@/components/ui/PersianInput';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  message: string;
  response: string;
  source: 'redis' | 'pg' | 'openai';
  timestamp: string;
  isUser: boolean;
}

const SourceBadge: React.FC<{ source: 'redis' | 'pg' | 'openai' }> = ({ source }) => {
  const badgeConfig = {
    redis: { label: 'Redis', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
    pg: { label: 'PostgreSQL', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
    openai: { label: 'OpenAI', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' }
  };

  const config = badgeConfig[source];

  return (
    <span className={cn(
      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
      config.className
    )}>
      {config.label}
    </span>
  );
};

const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.isUser;
  
  return (
    <div className={cn(
      'flex mb-4',
      isUser ? 'justify-end' : 'justify-start'
    )}>
      <div className={cn(
        'max-w-xs lg:max-w-md px-4 py-2 rounded-lg space-y-2',
        isUser 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-card border border-border'
      )}>
        <p className="text-sm font-vazir break-words">
          {isUser ? message.message : message.response}
        </p>
        
        <div className="flex items-center justify-between text-xs opacity-70">
          <span className="numbers-ltr">
            {new Date(message.timestamp).toLocaleTimeString('fa-IR')}
          </span>
          {!isUser && (
            <SourceBadge source={message.source} />
          )}
        </div>
      </div>
    </div>
  );
};

export const ChatAgent: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const result = await chatApi.getHistory();
      if (result.success && result.data) {
        const formattedMessages: ChatMessage[] = result.data.flatMap(item => [
          {
            id: `${item.id}-user`,
            message: item.message,
            response: item.response,
            source: item.source,
            timestamp: item.timestamp,
            isUser: true
          },
          {
            id: `${item.id}-bot`,
            message: item.message,
            response: item.response,
            source: item.source,
            timestamp: item.timestamp,
            isUser: false
          }
        ]);
        setMessages(formattedMessages);
      }
    } catch (error) {
      toast.error('خطا در بارگیری تاریخچه چت');
    } finally {
      setInitialLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const messageText = inputMessage.trim();
    setInputMessage('');
    setLoading(true);

    // Add user message immediately
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      message: messageText,
      response: '',
      source: 'openai',
      timestamp: new Date().toISOString(),
      isUser: true
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const result = await chatApi.sendMessage(messageText);
      
      if (result.success && result.data) {
        const botMessage: ChatMessage = {
          id: `bot-${Date.now()}`,
          message: messageText,
          response: result.data.response,
          source: result.data.source as 'redis' | 'pg' | 'openai',
          timestamp: new Date().toISOString(),
          isUser: false
        };

        setMessages(prev => [...prev, botMessage]);
      } else {
        toast.error(result.error || 'خطا در ارسال پیام');
      }
    } catch (error) {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.ctrlKey) {
        // Ctrl+Enter for line break - let default behavior happen
        return;
      } else {
        // Enter for send
        e.preventDefault();
        sendMessage();
      }
    }
  };

  if (initialLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-foreground font-vazir mb-6">
          {strings.chatAgent}
        </h1>
        <ChatSkeleton />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-foreground font-vazir">
          {strings.chatAgent}
        </h1>
        <p className="text-sm text-muted-foreground font-vazir mt-1">
          با هوش مصنوعی گفتگو کنید
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground font-vazir">
                پیام اول خود را ارسال کنید
              </p>
              <p className="text-xs text-muted-foreground font-vazir">
                Enter = ارسال، Ctrl+Enter = خط جدید
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-card border border-border rounded-lg px-4 py-2">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <div className="animate-pulse">در حال تایپ...</div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Composer */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex space-x-2 space-x-reverse">
          <div className="flex-1">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={strings.typeMessage}
              className="w-full p-3 border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground font-vazir min-h-[44px] max-h-32"
              rows={1}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground font-vazir mt-1">
              Enter = ارسال، Ctrl+Enter = خط جدید
            </p>
          </div>
          <LoadingButton
            onClick={sendMessage}
            loading={loading}
            disabled={!inputMessage.trim() || loading}
            className="px-6"
          >
            {strings.send}
          </LoadingButton>
        </div>
      </div>
    </div>
  );
};