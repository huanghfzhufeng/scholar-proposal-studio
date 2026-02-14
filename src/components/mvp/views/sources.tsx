'use client';

import { ArrowLeft, ArrowRight, CheckCircle2, Filter, Globe, RefreshCw, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge, Button } from '@/components/mvp/ui';
import type { SourceItem } from '@/components/mvp/types';

type SourcesViewProps = {
  projectId: string;
  sources: SourceItem[];
  onBackOutline: () => void;
  onRefreshSearch: () => void;
  onToggleSource: (sourceId: string) => void;
  onAddManualSource: (payload: {
    title: string;
    url: string;
    source: string;
    year: string;
    abstract: string;
    sectionKey: SourceItem['sectionKey'];
  }) => Promise<void>;
  onContinueGeneration: () => void;
};

const sectionOptions: Array<'全部' | SourceItem['sectionKey']> = ['全部', '立项依据', '研究内容', '研究基础'];

export const SourcesView = ({
  projectId,
  sources,
  onBackOutline,
  onRefreshSearch,
  onToggleSource,
  onAddManualSource,
  onContinueGeneration
}: SourcesViewProps) => {
  const [filter, setFilter] = useState<typeof sectionOptions[number]>('全部');
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualUrl, setManualUrl] = useState('');
  const [manualSource, setManualSource] = useState('');
  const [manualYear, setManualYear] = useState(new Date().getFullYear().toString());
  const [manualAbstract, setManualAbstract] = useState('');
  const [manualSectionKey, setManualSectionKey] = useState<SourceItem['sectionKey']>('研究内容');
  const [manualError, setManualError] = useState('');

  const filteredSources = useMemo(() => {
    if (filter === '全部') {
      return sources;
    }

    return sources.filter((item) => item.sectionKey === filter);
  }, [filter, sources]);

  const selectedCount = sources.filter((item) => item.selected).length;

  const handleManualSubmit = async () => {
    if (!manualTitle.trim() || !manualUrl.trim()) {
      setManualError('请至少填写标题和链接。');
      return;
    }

    setManualError('');
    await onAddManualSource({
      title: manualTitle.trim(),
      url: manualUrl.trim(),
      source: manualSource.trim() || 'Manual Entry',
      year: manualYear.trim() || new Date().getFullYear().toString(),
      abstract: manualAbstract.trim() || '手动补充资料。',
      sectionKey: manualSectionKey
    });

    setManualTitle('');
    setManualUrl('');
    setManualSource('');
    setManualAbstract('');
    setShowManualForm(false);
  };

  return (
    <div className="mx-auto w-full max-w-7xl animate-in p-6 fade-in lg:p-12">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={onBackOutline} className="-ml-4 mb-2">
            返回大纲
          </Button>
          <h2 className="text-3xl text-slate-900">联网检索与资料库</h2>
          <p className="mt-2 text-sm text-slate-500">检索智能体已按“学术优先”策略抓取资料。你可以筛选并决定哪些条目进入写作数据库。</p>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" icon={RefreshCw} onClick={onRefreshSearch}>
            重跑检索
          </Button>
          <Button onClick={onContinueGeneration} icon={ArrowRight}>
            进入全文生成
          </Button>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-slate-600">项目 ID：{projectId}</div>
          <Button size="sm" variant="outline" onClick={() => setShowManualForm((prev) => !prev)}>
            {showManualForm ? '收起手动添加' : '手动添加资料'}
          </Button>
        </div>

        {showManualForm ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <input
              value={manualTitle}
              onChange={(event) => setManualTitle(event.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-200"
              placeholder="资料标题"
            />
            <input
              value={manualUrl}
              onChange={(event) => setManualUrl(event.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-200"
              placeholder="资料链接"
            />
            <input
              value={manualSource}
              onChange={(event) => setManualSource(event.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-200"
              placeholder="来源（如 Nature）"
            />
            <input
              value={manualYear}
              onChange={(event) => setManualYear(event.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-200"
              placeholder="年份"
            />
            <select
              value={manualSectionKey}
              onChange={(event) => setManualSectionKey(event.target.value as SourceItem['sectionKey'])}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-200"
            >
              <option value="立项依据">立项依据</option>
              <option value="研究内容">研究内容</option>
              <option value="研究基础">研究基础</option>
            </select>
            <input
              value={manualAbstract}
              onChange={(event) => setManualAbstract(event.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-200"
              placeholder="摘要（可选）"
            />
            <div className="md:col-span-2 flex items-center justify-between gap-3">
              {manualError ? <p className="text-xs text-red-600">{manualError}</p> : <span />}
              <Button size="sm" onClick={handleManualSubmit}>
                保存到资料库
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mb-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_auto_auto] md:items-center">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Globe size={16} className="text-[#0052FF]" />
          全网检索 + 学术来源优先评分，低质量来源已过滤。
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value as typeof sectionOptions[number])}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-200"
          >
            {sectionOptions.map((option) => (
              <option value={option} key={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="justify-self-end text-sm text-slate-500">
          已入库 <span className="font-bold text-slate-900">{selectedCount}</span> / {sources.length}
        </div>
      </div>

      <div className="grid gap-4">
        {filteredSources.map((item) => (
          <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-blue-200">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge color="blue">{item.sectionKey}</Badge>
                <Badge color="slate">相关性 {item.score}</Badge>
              </div>
              <Button
                size="sm"
                variant={item.selected ? 'secondary' : 'outline'}
                icon={item.selected ? CheckCircle2 : Search}
                onClick={() => onToggleSource(item.id)}
              >
                {item.selected ? '已纳入' : '纳入资料库'}
              </Button>
            </div>

            <h3 className="mb-2 text-lg font-bold text-slate-900">{item.title}</h3>
            <p className="mb-3 text-sm leading-relaxed text-slate-600">{item.abstract}</p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span>{item.source}</span>
              <span>•</span>
              <span>{item.year}</span>
              <span>•</span>
              <a href={item.url} target="_blank" rel="noreferrer" className="text-[#0052FF] underline-offset-4 hover:underline">
                查看来源
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
