'use client';

import { ArrowLeft, ArrowRight, CheckCircle2, LoaderCircle, PlayCircle } from 'lucide-react';
import { Button } from '@/components/mvp/ui';
import type { GenerationStep } from '@/components/mvp/types';

type GenerationViewProps = {
  steps: GenerationStep[];
  isGenerating: boolean;
  hasGeneratedDraft: boolean;
  onBackSources: () => void;
  onStartGeneration: () => void;
  onGoEditor: () => void;
};

export const GenerationView = ({
  steps,
  isGenerating,
  hasGeneratedDraft,
  onBackSources,
  onStartGeneration,
  onGoEditor
}: GenerationViewProps) => {
  return (
    <div className="mx-auto w-full max-w-4xl animate-in p-6 fade-in lg:p-12">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={onBackSources} className="-ml-4 mb-2">
            返回资料库
          </Button>
          <h2 className="text-3xl text-slate-900">全文生成进度</h2>
          <p className="mt-2 text-sm text-slate-500">一键整篇生成，过程可视化展示。若证据校验失败，将自动重试（最多 2 次）。</p>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" icon={PlayCircle} onClick={onStartGeneration} disabled={isGenerating}>
            {isGenerating ? '生成中...' : '开始生成'}
          </Button>
          <Button onClick={onGoEditor} icon={ArrowRight} disabled={!hasGeneratedDraft}>
            前往编辑与导出
          </Button>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {steps.map((step, idx) => (
          <div key={step.key} className="flex items-center gap-4 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-500">
              {step.status === 'running' ? (
                <LoaderCircle className="h-4 w-4 animate-spin text-[#0052FF]" />
              ) : step.status === 'done' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ) : (
                <span className="font-mono-custom text-xs">{idx + 1}</span>
              )}
            </div>
            <div className="flex-1 text-sm text-slate-700">{step.title}</div>
            <div className="text-xs text-slate-400">
              {step.status === 'idle' ? '待执行' : step.status === 'running' ? '执行中' : '已完成'}
            </div>
          </div>
        ))}
      </div>

      {hasGeneratedDraft ? (
        <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">全文已生成，可进入编辑页继续调整并导出 Word/PDF。</div>
      ) : null}
    </div>
  );
};
