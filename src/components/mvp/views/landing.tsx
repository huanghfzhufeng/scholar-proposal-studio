'use client';

import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Cpu, Database, MessageSquareText, PenTool, ShieldCheck, Zap } from 'lucide-react';
import type { ComponentType } from 'react';
import { Button, SectionLabel } from '@/components/mvp/ui';

type LandingViewProps = {
  onStart: () => void;
};

const Navbar = ({ onLogin }: { onLogin: () => void }) => (
  <nav className="fixed top-0 z-50 w-full border-b border-slate-200/50 bg-[#FAFAFA]/80 backdrop-blur-md">
    <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
      <button type="button" className="flex cursor-pointer items-center gap-2" onClick={onLogin}>
        <div className="bg-gradient-primary flex h-8 w-8 items-center justify-center rounded-lg text-center font-serif font-bold text-white">S</div>
        <span className="font-serif text-xl font-bold tracking-tight">校研智申</span>
      </button>
      <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
        <a href="#features" className="transition-colors hover:text-[#0052FF]">
          核心功能
        </a>
        <a href="#process" className="transition-colors hover:text-[#0052FF]">
          生成流程
        </a>
        <a href="#security" className="transition-colors hover:text-[#0052FF]">
          数据安全
        </a>
      </div>
      <div className="flex items-center gap-4">
        <span className="hidden text-sm font-medium text-slate-500 sm:block">MVP v1.0</span>
        <Button variant="outline" className="!h-10 !rounded-lg !px-5 text-sm" onClick={onLogin}>
          登录
        </Button>
      </div>
    </div>
  </nav>
);

const FeatureCard = ({
  icon: Icon,
  title,
  desc,
  delay
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-100px' }}
    transition={{ delay, duration: 0.5 }}
    className="card-hover-effect group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-8"
  >
    <div className="absolute right-0 top-0 p-3 opacity-10 transition-opacity duration-500 group-hover:opacity-100">
      <ArrowRight className="h-5 w-5 -rotate-45 text-[#0052FF]" />
    </div>
    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#0052FF] transition-colors duration-300 group-hover:bg-[#0052FF] group-hover:text-white">
      <Icon className="h-6 w-6" />
    </div>
    <h3 className="mb-3 text-xl font-bold text-slate-900">{title}</h3>
    <p className="text-sm leading-relaxed text-slate-500">{desc}</p>
  </motion.div>
);

export const LandingView = ({ onStart }: LandingViewProps) => {
  return (
    <>
      <Navbar onLogin={onStart} />

      <section className="relative overflow-hidden pb-24 pt-32 lg:pb-32 lg:pt-48">
        <div className="hero-pattern pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute right-0 top-0 h-[800px] w-[800px] translate-x-1/3 -translate-y-1/2 rounded-full bg-blue-100/40 blur-[120px]" />

        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <SectionLabel text="AI-Powered Research" />
            <h1 className="mb-8 text-5xl leading-[1.1] text-slate-900 lg:text-7xl">
              让科研回归 <br />
              <span className="text-gradient">创造与思考</span>
            </h1>
            <p className="mb-10 max-w-xl text-lg leading-relaxed text-slate-600">
              面向校内科研人员的智能化国自然申请书生成系统。从动态访谈到一键成稿，将繁琐文书工作转化为流畅思维对话。
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button icon={ArrowRight} onClick={onStart}>
                开始申请书生成
              </Button>
              <Button variant="outline">查看演示视频</Button>
            </div>
            <div className="font-mono-custom mt-12 flex items-center gap-6 text-sm font-medium text-slate-500">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#0052FF]" /> 校内专网访问
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#0052FF]" /> 学术资料库
              </span>
            </div>
          </motion.div>

          <div className="relative hidden h-[520px] perspective-[2000px] lg:block">
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute left-10 top-1/4 z-20"
            >
              <div className="w-64 rounded-2xl border border-slate-100 bg-white p-6 shadow-xl shadow-blue-900/10">
                <div className="mb-4 h-2 w-16 rounded bg-blue-100" />
                <div className="mb-2 h-3 w-full rounded bg-slate-100" />
                <div className="mb-2 h-3 w-4/5 rounded bg-slate-100" />
                <div className="h-3 w-3/5 rounded bg-slate-100" />
                <div className="mt-4 flex gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#0052FF]" />
                  <span className="font-mono-custom text-[10px] text-slate-400">GENERATING...</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 30, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute bottom-1/4 right-10 z-10"
            >
              <div className="flex w-56 items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-xl shadow-blue-900/10">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-mono-custom text-xs uppercase text-slate-400">Status</div>
                  <div className="font-serif font-bold text-slate-800">循证核验通过</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-full border border-dashed border-blue-200 opacity-50"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-[15%] rounded-full border border-dashed border-blue-100 opacity-60"
            />
            <div className="bg-gradient-primary absolute inset-[30%] rounded-full opacity-20 blur-[80px]" />
          </div>
        </div>
      </section>

      <section id="features" className="relative bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 md:w-2/3">
            <SectionLabel text="Core Capabilities" />
            <h2 className="mb-6 text-4xl text-slate-900 md:text-5xl">
              全流程<span className="text-gradient">智能化</span>辅助
            </h2>
            <p className="text-lg text-slate-600">针对国自然申请书结构深度定制，从灵感到定稿，每个环节都可追踪。</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard icon={MessageSquareText} title="动态需求访谈" desc="纯对话式交互，AI 根据回答自动追问。支持跳过与换话题。" delay={0.1} />
            <FeatureCard icon={Cpu} title="大纲生成与编辑" desc="一次生成 2-5 套候选大纲，支持最小标题层级编辑与版本对比。" delay={0.2} />
            <FeatureCard icon={Database} title="学术循证检索" desc="全网检索 + 学术来源优先评分。过滤低质量来源，保障资料可用。" delay={0.3} />
            <FeatureCard icon={PenTool} title="一键全文生成" desc="过程可视化，支持 Word/PDF 导出，文件名自动使用课题题目。" delay={0.4} />
          </div>
        </div>
      </section>

      <section id="security" className="relative overflow-hidden bg-slate-900 py-24">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="relative z-10 mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-2">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
              <span className="font-mono-custom text-xs tracking-widest text-white">SYSTEM READY</span>
            </div>
            <h2 className="mb-6 text-4xl text-white md:text-5xl">
              专为科研场景打造<br />
              <span className="text-blue-400">数据安全可控</span>
            </h2>
            <p className="mb-8 max-w-md text-lg text-slate-400">校内私有化部署方案，数据“软删除”归档策略，让科研创意在安全环境中生长。</p>
            <Button className="!bg-white !text-slate-900 hover:!bg-blue-50" variant="primary">
              了解部署方案
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-12">
            <div className="border-l border-white/20 pl-6">
              <div className="mb-2 text-4xl font-serif text-white lg:text-5xl">2-5 套</div>
              <div className="font-mono-custom text-sm uppercase tracking-wide text-blue-200">候选大纲/次</div>
            </div>
            <div className="border-l border-white/20 pl-6">
              <div className="mb-2 text-4xl font-serif text-white lg:text-5xl">100%</div>
              <div className="font-mono-custom text-sm uppercase tracking-wide text-blue-200">学术来源优先</div>
            </div>
            <div className="border-l border-white/20 pl-6">
              <div className="mb-2 text-4xl font-serif text-white lg:text-5xl">100 人</div>
              <div className="font-mono-custom text-sm uppercase tracking-wide text-blue-200">首批试点规模</div>
            </div>
            <div className="border-l border-white/20 pl-6">
              <div className="mb-2 text-4xl font-serif text-white lg:text-5xl">v1.0</div>
              <div className="font-mono-custom text-sm uppercase tracking-wide text-blue-200">MVP 已就绪</div>
            </div>
          </div>
        </div>
      </section>

      <section id="process" className="bg-[#FAFAFA] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <SectionLabel text="Workflow" />
            <h2 className="text-4xl text-slate-900">简单的三步流程</h2>
          </div>
          <div className="grid gap-12 md:grid-cols-3">
            {[
              { step: '01', title: '对话访谈', desc: '如同与资深专家对话，AI 动态追问并采集关键信息。', icon: MessageSquareText },
              { step: '02', title: '大纲确立', desc: '多版本对比，拖拽式调整，锁定最优结构。', icon: Cpu },
              { step: '03', title: '生成与导出', desc: '一键生成整篇初稿，支持 Word/PDF 双导出。', icon: Zap }
            ].map((item) => (
              <div key={item.step} className="group relative rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-all duration-500 hover:shadow-xl">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-[#0052FF]">
                  <item.icon className="h-6 w-6" />
                </div>
                <div className="absolute right-4 top-4 font-serif text-4xl font-bold text-slate-100">{item.step}</div>
                <h3 className="mb-3 text-xl font-bold">{item.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24 text-center">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-12 shadow-2xl shadow-blue-900/5">
          <h2 className="mb-6 text-4xl font-serif text-slate-900">准备好开始了吗？</h2>
          <p className="mx-auto mb-8 max-w-lg text-slate-600">立即加入首批 100 人试点计划，体验 AI 辅助科研申请书写作的效率变革。</p>
          <Button className="w-full px-10 sm:w-auto" onClick={onStart}>
            立即申请试用
          </Button>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-slate-900 text-xs font-bold text-white">S</div>
            <span className="font-serif font-bold text-slate-900">校研智申</span>
            <span className="font-mono-custom ml-2 rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">MVP BUILD 2026.02.14</span>
          </div>
          <div className="text-sm text-slate-400">© 2026 School Research AI. Internal Use Only.</div>
        </div>
      </footer>
    </>
  );
};
