import { AnimatePresence, motion } from 'framer-motion';
import { Bot, Send, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button, Textarea } from '@/components/mvp/ui';

interface InterviewViewProps {
  messages: Array<{ role: 'ai' | 'user'; text: string }>;
  sufficiencyScore: number;
  onSendMessage: (text: string) => void;
  onBackDashboard: () => void;
  onSkipQuestion?: () => void;
  onSwitchTopic?: () => void;
  onJumpToOutline?: () => void;
}

export const InterviewView = ({
  messages,
  onSendMessage,
  onSkipQuestion,
  onSwitchTopic
}: InterviewViewProps) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = () => {
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="mx-auto max-w-3xl space-y-6">
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${msg.role === 'ai' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
              >
                {msg.role === 'ai' ? <Bot size={20} /> : <User size={20} />}
              </div>
              <div
                className={`max-w-2xl rounded-2xl p-6 text-base leading-relaxed shadow-sm ${msg.role === 'ai'
                    ? 'rounded-tl-none border border-slate-100 bg-white text-slate-800'
                    : 'rounded-tr-none bg-[#0052FF] text-white shadow-blue-500/20'
                  }`}
              >
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.text}
                  </ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))}
          <div ref={scrollRef} />
        </div>
      </div>

      <div className="border-t border-slate-200 bg-white p-4">
        <div className="mx-auto max-w-3xl">
          <div className="relative rounded-xl border border-slate-200 shadow-sm transition-all focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="输入你的回答，Shift+Enter 换行..."
              className="min-h-[60px] resize-none border-0 bg-transparent px-4 py-3 placeholder:text-slate-400 focus-visible:ring-0"
            />
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-3 py-2">
              <div className="flex gap-2">
                {onSkipQuestion && (
                  <Button variant="ghost" size="sm" onClick={onSkipQuestion} className="h-8 text-xs text-slate-500 hover:text-slate-700">
                    跳过此题
                  </Button>
                )}
                {onSwitchTopic && (
                  <Button variant="ghost" size="sm" onClick={onSwitchTopic} className="h-8 text-xs text-slate-500 hover:text-slate-700">
                    切换话题
                  </Button>
                )}
              </div>
              <Button size="sm" onClick={handleSubmit} disabled={!input.trim()} className="h-8 rounded-lg bg-indigo-600 px-4 hover:bg-indigo-700">
                <Send size={14} className="mr-1.5" />
                发送
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
