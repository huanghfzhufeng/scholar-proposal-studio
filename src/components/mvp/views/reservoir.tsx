'use client';

import { ArrowLeft, RotateCcw, Trash2 } from 'lucide-react';
import { Button } from '@/components/mvp/ui';
import type { ArchivedProject } from '@/components/mvp/types';

type ReservoirViewProps = {
  archivedProjects: ArchivedProject[];
  onBackDashboard: () => void;
  onRestoreProject: (projectId: string) => void;
};

export const ReservoirView = ({ archivedProjects, onBackDashboard, onRestoreProject }: ReservoirViewProps) => {
  return (
    <div className="mx-auto w-full max-w-5xl animate-in p-6 fade-in lg:p-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={onBackDashboard} className="-ml-4 mb-2">
            返回工作台
          </Button>
          <h2 className="text-3xl text-slate-900">水库归档</h2>
          <p className="mt-2 text-sm text-slate-500">项目删除后不会永久移除，会进入水库归档并可恢复。</p>
        </div>
      </div>

      {archivedProjects.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">当前没有归档项目。</div>
      ) : (
        <div className="grid gap-4">
          {archivedProjects.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-6">
              <div>
                <h3 className="mb-1 text-lg font-bold text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-500">删除时间：{item.deletedAt}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" icon={RotateCcw} onClick={() => onRestoreProject(item.id)}>
                  恢复项目
                </Button>
                <Button size="sm" variant="ghost" className="!h-9 !w-9 !p-0 text-slate-400" icon={Trash2} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
