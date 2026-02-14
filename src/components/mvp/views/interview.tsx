'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Bot, MessageSquareDashed, SkipForward, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/mvp/ui';
import type { InterviewMessage } from '@/components/mvp/types';

type InterviewViewProps = {
  messages: InterviewMessage[];
  sufficiencyScore: number;
  onBackDashboard: () => void;
  onSendMessage: (input: string) => void;
  onSkipQuestion: () => void;
  onSwitchTopic: () => void;
  onJumpToOutline: () => void;
};

export const InterviewView = ({
  messages,
  sufficiencyScore,
  onBackDashboard,
  onSendMessage,
  onSkipQuestion,
  onSwitchTopic,
  onJumpToOutline
}: InterviewViewProps) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const handleSend = () => {
    if (!input.trim()) {
      return;
    }

    onSendMessage(input.trim());
    setInput('');
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex h-[calc(100vh-80px)] w-full animate-in fade-in">
      <div className="hidden w-80 flex-col border-r border-slate-200 bg-white p-6 lg:flex">
        <div className="mb-8">
          <Button variant="ghost" size="sm" icon={ArrowLeft} className="-ml-4 mb-4" onClick={onBackDashboard}>
            返回工作台
          </Button>
          <h3 className="mb-2 text-xl font-bold">项目访谈</h3>
          <p className="text-sm text-slate-500">访谈智能体会持续追问，直到信息充分。</p>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <div className="font-mono-custom mb-1 text-xs uppercase text-blue-600">Current Focus</div>
            <div className="font-bold text-slate-900">信息充分度评估</div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium text-slate-500">
              <span>信息收集进度</span>
              <span>{sufficiencyScore}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full bg-[#0052FF] transition-all duration-300" style={{ width: `${sufficiencyScore}%` }} />
            </div>
          </div>

          {sufficiencyScore >= 80 ? (
            <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
              信息已较充分，建议结束访谈并进入大纲生成。
            </div>
          ) : null}

          <div className="space-y-2">
            <Button size="sm" variant="outline" className="w-full" icon={SkipForward} onClick={onSkipQuestion}>
              跳过当前问题
            </Button>
            <Button size="sm" variant="outline" className="w-full" icon={MessageSquareDashed} onClick={onSwitchTopic}>
              切换话题
            </Button>
          </div>
        </div>

        <div className="mt-auto">
          <Button className="w-full" variant="secondary" onClick={onJumpToOutline}>
            结束访谈，生成大纲
          </Button>
        </div>
      </div>

      <div className="relative flex flex-1 flex-col bg-[#FAFAFA]">
        <div className="flex-1 space-y-8 overflow-y-auto p-6 lg:p-12">
          {messages.map((msg, idx) => (
            <motion.div
              key={`${msg.role}-${idx}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full shadow-sm ${
                  msg.role === 'ai'
                    ? 'bg-gradient-primary text-white'
                    : 'border border-slate-200 bg-white text-slate-600'
                }`}
              >
                {msg.role === 'ai' ? <Bot size={20} /> : <User size={20} />}
              </div>
              <div
                className={`max-w-2xl rounded-2xl p-6 text-base leading-relaxed shadow-sm ${
                  msg.role === 'ai'
                    ? 'rounded-tl-none border border-slate-100 bg-white text-slate-800'
                    : 'rounded-tr-none bg-[#0052FF] text-white shadow-blue-500/20'
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
          <div ref={scrollRef} />
        </div>

        <div className="border-t border-slate-200 bg-white p-6">
          <div className="relative mx-auto max-w-4xl">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="输入您的回答..."
              className="h-24 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 pr-32 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  handleSend();
                }
              }}
            />
            <div className="absolute bottom-4 right-4 flex gap-2">
              <Button size="sm" onClick={handleSend} icon={ArrowRight}>
                发送
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
