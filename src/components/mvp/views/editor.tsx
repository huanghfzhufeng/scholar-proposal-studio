'use client';

import { ArrowLeft, Database, FileDown, Search } from 'lucide-react';
import { Button } from '@/components/mvp/ui';
import type { SourceItem } from '@/components/mvp/types';

type EditorViewProps = {
  projectTitle: string;
  draftContent: string;
  sources: SourceItem[];
  exportError: string;
  onBackGeneration: () => void;
  onProjectTitleChange: (value: string) => void;
  onDraftChange: (value: string) => void;
  onOpenSources: () => void;
  onExportDocx: () => void;
  onExportPdf: () => void;
};

export const EditorView = ({
  projectTitle,
  draftContent,
  sources,
  exportError,
  onBackGeneration,
  onProjectTitleChange,
  onDraftChange,
  onOpenSources,
  onExportDocx,
  onExportPdf
}: EditorViewProps) => {
  const selectedSources = sources.filter((item) => item.selected);

  return (
    <div className="flex h-[calc(100vh-80px)] w-full animate-in fade-in">
      <div className="flex flex-1 justify-center overflow-y-auto bg-slate-100 p-6 lg:p-10">
        <div className="min-h-[1000px] w-full max-w-[860px] bg-white p-8 shadow-sm lg:p-14">
          <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={onBackGeneration} className="-ml-4 mb-4">
            返回生成进度
          </Button>

          <input
            value={projectTitle}
            onChange={(event) => onProjectTitleChange(event.target.value)}
            className="font-doc mb-8 w-full border-none text-center text-3xl font-bold text-black outline-none"
            placeholder="请输入课题题目"
          />

          <textarea
            value={draftContent}
            onChange={(event) => onDraftChange(event.target.value)}
            className="font-doc min-h-[760px] w-full resize-y border-none text-lg leading-relaxed text-slate-800 outline-none"
          />
        </div>
      </div>

      <div className="hidden w-80 flex-col border-l border-slate-200 bg-white lg:flex">
        <div className="flex h-14 items-center gap-3 border-b border-slate-200 px-4">
          <Database size={16} className="text-[#0052FF]" />
          <div className="font-bold text-slate-900">资料库与导出</div>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-4">
          <div>
            <h4 className="font-mono-custom mb-3 flex items-center gap-2 text-xs uppercase text-slate-500">
              <Search size={14} /> References ({selectedSources.length})
            </h4>
            <div className="space-y-3">
              {selectedSources.map((item) => (
                <div key={item.id} className="cursor-pointer rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm transition-all hover:border-blue-200 hover:shadow-sm">
                  <div className="mb-1 line-clamp-2 font-bold text-slate-900">{item.title}</div>
                  <div className="text-xs text-slate-500">
                    {item.source}, {item.year}
                  </div>
                </div>
              ))}

              <Button size="sm" variant="secondary" className="w-full text-xs" icon={Search} onClick={onOpenSources}>
                检索更多文献
              </Button>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <h4 className="font-mono-custom mb-3 flex items-center gap-2 text-xs uppercase text-slate-500">
              <FileDown size={14} /> Export
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" size="sm" onClick={onExportDocx}>
                Word (.docx)
              </Button>
              <Button variant="secondary" size="sm" onClick={onExportPdf}>
                PDF
              </Button>
            </div>
            <p className="mt-3 text-xs text-slate-500">导出文件名将自动使用课题题目。</p>
            {exportError ? <p className="mt-2 rounded border border-red-100 bg-red-50 px-2 py-1 text-xs text-red-600">{exportError}</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
};
