'use client';

import { ArrowLeft, CheckCircle2, GitCompare, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge, Button } from '@/components/mvp/ui';
import type { OutlineCandidate, OutlineVersion } from '@/components/mvp/types';

type OutlineViewProps = {
  candidates: OutlineCandidate[];
  activeIndex: number;
  versions: OutlineVersion[];
  onBackDashboard: () => void;
  onSetActiveIndex: (index: number) => void;
  onRegenerate: () => void;
  onConfirm: () => void;
  onChangeSectionTitle: (candidateIndex: number, sectionIndex: number, value: string) => void;
  onChangeSubTitle: (candidateIndex: number, sectionIndex: number, subIndex: number, value: string) => void;
  onAddSubTitle: (candidateIndex: number, sectionIndex: number) => void;
  onRemoveSubTitle: (candidateIndex: number, sectionIndex: number, subIndex: number) => void;
};

const compareOutlineText = (left?: OutlineCandidate, right?: OutlineCandidate) => {
  if (!left || !right) {
    return '请选择两个历史版本进行对比。';
  }

  const leftLines = left.content.flatMap((section) => [section.title, ...section.subs]);
  const rightLines = right.content.flatMap((section) => [section.title, ...section.subs]);

  const added = rightLines.filter((line) => !leftLines.includes(line)).length;
  const removed = leftLines.filter((line) => !rightLines.includes(line)).length;

  return `对比结果：新增 ${added} 处，删除 ${removed} 处。`;
};

export const OutlineView = ({
  candidates,
  activeIndex,
  versions,
  onBackDashboard,
  onSetActiveIndex,
  onRegenerate,
  onConfirm,
  onChangeSectionTitle,
  onChangeSubTitle,
  onAddSubTitle,
  onRemoveSubTitle
}: OutlineViewProps) => {
  const [leftVersionId, setLeftVersionId] = useState<string>('');
  const [rightVersionId, setRightVersionId] = useState<string>('');

  const activeCandidate = candidates[activeIndex];

  const versionMap = useMemo(() => {
    const map = new Map<string, OutlineVersion>();
    versions.forEach((version) => map.set(version.id, version));
    return map;
  }, [versions]);

  const diffSummary = compareOutlineText(versionMap.get(leftVersionId)?.outline, versionMap.get(rightVersionId)?.outline);

  return (
    <div className="mx-auto w-full max-w-7xl animate-in p-6 fade-in lg:p-12">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={onBackDashboard} className="-ml-4 mb-2">
            返回
          </Button>
          <h2 className="text-3xl text-slate-900">大纲生成与确认</h2>
          <p className="mt-2 text-sm text-slate-500">候选数量动态生成（2-5 套），结构固定覆盖立项依据、研究内容、研究基础。</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" icon={RefreshCw} onClick={onRegenerate}>
            重新生成
          </Button>
          <Button onClick={onConfirm} icon={CheckCircle2}>
            确认并进入资料库
          </Button>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[300px_1fr_320px]">
        <div className="space-y-4">
          <p className="font-mono-custom mb-2 text-sm font-medium uppercase tracking-wider text-slate-500">CANDIDATES</p>
          {candidates.map((candidate, idx) => (
            <button
              type="button"
              key={candidate.id}
              onClick={() => onSetActiveIndex(idx)}
              className={`w-full rounded-xl border p-5 text-left transition-all ${
                activeIndex === idx
                  ? 'border-[#0052FF] bg-white shadow-lg shadow-blue-500/10 ring-1 ring-[#0052FF]'
                  : 'border-slate-200 bg-white hover:border-blue-200'
              }`}
            >
              <div className="mb-2 flex items-start justify-between">
                <Badge color={activeIndex === idx ? 'blue' : 'slate'}>{candidate.focus}</Badge>
                {activeIndex === idx ? <CheckCircle2 size={16} className="text-[#0052FF]" /> : null}
              </div>
              <h4 className="mb-1 font-bold text-slate-900">{candidate.title}</h4>
              <p className="text-xs text-slate-500">贴合度 {candidate.fitScore}% • 结构完整</p>
            </button>
          ))}
        </div>

        <div className="overflow-y-auto rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="space-y-8">
            {activeCandidate?.content.map((section, sectionIndex) => (
              <div key={section.id} className="group">
                <div className="mb-3 flex items-center gap-3 rounded-lg border border-transparent p-2 transition-all hover:border-slate-200 hover:bg-slate-50">
                  <input
                    value={section.title}
                    onChange={(event) => onChangeSectionTitle(activeIndex, sectionIndex, event.target.value)}
                    className="flex-1 border-none bg-transparent text-xl font-bold text-slate-900 outline-none"
                  />
                </div>

                <div className="ml-4 space-y-2 border-l-2 border-slate-100 pl-6">
                  {section.subs.map((subTitle, subIndex) => (
                    <div key={`${section.id}-${subIndex}`} className="flex items-center gap-2">
                      <input
                        value={subTitle}
                        onChange={(event) => onChangeSubTitle(activeIndex, sectionIndex, subIndex, event.target.value)}
                        className="flex-1 rounded border border-transparent bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 outline-none transition-all focus:border-blue-200 focus:bg-white"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="!h-8 !w-8 !p-0 text-slate-400 hover:text-red-500"
                        icon={Trash2}
                        onClick={() => onRemoveSubTitle(activeIndex, sectionIndex, subIndex)}
                      />
                    </div>
                  ))}
                  <Button size="sm" variant="ghost" className="!h-8" icon={Plus} onClick={() => onAddSubTitle(activeIndex, sectionIndex)}>
                    添加子标题
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <GitCompare size={18} />
            版本对比
          </h3>
          <p className="text-sm text-slate-500">选择两个历史版本，快速查看大纲变化。</p>

          <select
            value={leftVersionId}
            onChange={(event) => setLeftVersionId(event.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-sm outline-none focus:border-blue-200"
          >
            <option value="">选择版本 A</option>
            {versions.map((version) => (
              <option key={version.id} value={version.id}>
                {version.label} - {version.createdAt}
              </option>
            ))}
          </select>

          <select
            value={rightVersionId}
            onChange={(event) => setRightVersionId(event.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-sm outline-none focus:border-blue-200"
          >
            <option value="">选择版本 B</option>
            {versions.map((version) => (
              <option key={version.id} value={version.id}>
                {version.label} - {version.createdAt}
              </option>
            ))}
          </select>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">{diffSummary}</div>

          <div className="space-y-2 pt-2">
            {versions.slice(0, 5).map((version) => (
              <div key={version.id} className="rounded-lg border border-slate-100 bg-white px-3 py-2 text-xs text-slate-500">
                {version.label} • {version.createdAt}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
