'use client';

import { CheckCircle2, Cpu, FileText, History, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { Badge, Button, SectionLabel } from '@/components/mvp/ui';
import type { ProjectItem } from '@/components/mvp/types';

type DashboardViewProps = {
  projects: ProjectItem[];
  onNewProject: () => void;
  onOpenProject: (projectId: number) => void;
  onArchiveProject: (projectId: number) => void;
  onOpenReservoir: () => void;
};

const stageLabelMap = {
  interview: { text: '需求访谈', color: 'blue' as const },
  outline: { text: '大纲修订', color: 'amber' as const },
  sources: { text: '资料筛选', color: 'slate' as const },
  generation: { text: '全文生成', color: 'rose' as const },
  editor: { text: '正文撰写', color: 'green' as const }
};

export const DashboardView = ({
  projects,
  onNewProject,
  onOpenProject,
  onArchiveProject,
  onOpenReservoir
}: DashboardViewProps) => {
  return (
    <div className="mx-auto w-full max-w-7xl animate-in p-6 duration-500 fade-in md:p-12">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <SectionLabel text="Workspace" />
          <h2 className="mb-2 mt-2 text-3xl text-slate-900">工作台</h2>
          <p className="text-slate-500">欢迎回来。当前项目可从访谈开始，逐步推进到导出阶段。</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onOpenReservoir} icon={RotateCcw}>
            水库恢复
          </Button>
          <Button onClick={onNewProject} icon={Plus}>
            新建项目
          </Button>
        </div>
      </div>

      <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <FileText />
          </div>
          <div>
            <div className="font-serif text-2xl font-bold text-slate-900">{projects.length}</div>
            <div className="font-mono-custom text-xs uppercase tracking-wider text-slate-500">Total Projects</div>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
            <CheckCircle2 />
          </div>
          <div>
            <div className="font-serif text-2xl font-bold text-slate-900">{projects.filter((item) => item.stage === 'editor').length}</div>
            <div className="font-mono-custom text-xs uppercase tracking-wider text-slate-500">Draft Ready</div>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Cpu />
          </div>
          <div>
            <div className="font-serif text-2xl font-bold text-slate-900">45h</div>
            <div className="font-mono-custom text-xs uppercase tracking-wider text-slate-500">AI Saved Time</div>
          </div>
        </div>
      </div>

      <h3 className="mb-6 text-xl font-bold text-slate-900">最近项目</h3>
      <div className="grid gap-4">
        {projects.map((project) => {
          const stage = stageLabelMap[project.stage];

          return (
            <div key={project.id} className="group flex items-center justify-between rounded-xl border border-slate-100 bg-white p-6 transition-all hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5">
              <button className="flex flex-1 items-center gap-6 text-left" onClick={() => onOpenProject(project.id)}>
                <div className="h-12 w-1.5 rounded-full bg-blue-500" />
                <div>
                  <h4 className="mb-1 text-lg font-bold text-slate-900 transition-colors group-hover:text-[#0052FF]">{project.title}</h4>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <History size={14} /> 编辑于 {project.lastEdit}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <span>进度 {project.progress}%</span>
                  </div>
                </div>
              </button>

              <div className="ml-4 flex items-center gap-3">
                <Badge color={stage.color}>{stage.text}</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="!h-8 !w-8 !p-0 text-slate-400 hover:text-red-500"
                  onClick={() => onArchiveProject(project.id)}
                  icon={Trash2}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
