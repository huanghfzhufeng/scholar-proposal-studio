'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { FileText, History, LogOut, Search, User, Workflow } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  buildMockSources,
  createInitialDraft,
  generateOutlineCandidates,
  initialInterviewMessages,
  initialProjects,
  interviewQuestionBank
} from '@/components/mvp/data';
import { Button } from '@/components/mvp/ui';
import { DashboardView } from '@/components/mvp/views/dashboard';
import { EditorView } from '@/components/mvp/views/editor';
import { GenerationView } from '@/components/mvp/views/generation';
import { InterviewView } from '@/components/mvp/views/interview';
import { LandingView } from '@/components/mvp/views/landing';
import { OutlineView } from '@/components/mvp/views/outline';
import { ReservoirView } from '@/components/mvp/views/reservoir';
import { SourcesView } from '@/components/mvp/views/sources';
import type {
  AppView,
  ArchivedProject,
  GenerationStep,
  OutlineCandidate,
  OutlineVersion,
  ProjectItem,
  ProjectStage,
  SourceItem
} from '@/components/mvp/types';
import { exportAsDocx, exportAsPdf } from '@/lib/export';

const stageToView: Record<ProjectStage, AppView> = {
  interview: 'interview',
  outline: 'outline',
  sources: 'sources',
  generation: 'generation',
  editor: 'editor'
};

const nowLabel = () => new Date().toLocaleString('zh-CN', { hour12: false });

const defaultGenerationSteps = (): GenerationStep[] => [
  { key: 'collect', title: '加载访谈与锁定大纲', status: 'idle' },
  { key: 'source', title: '汇总已选资料库来源', status: 'idle' },
  { key: 'write', title: '组织章节并生成整篇正文', status: 'idle' },
  { key: 'evidence', title: '执行引用与证据校验', status: 'idle' },
  { key: 'finish', title: '输出可编辑初稿', status: 'idle' }
];

const cloneOutline = (candidate: OutlineCandidate): OutlineCandidate => ({
  ...candidate,
  content: candidate.content.map((section) => ({ ...section, subs: [...section.subs] }))
});

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const MvpAppShell = () => {
  const [view, setView] = useState<AppView>('landing');
  const [projects, setProjects] = useState<ProjectItem[]>(initialProjects);
  const [archivedProjects, setArchivedProjects] = useState<ArchivedProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<number>(initialProjects[0]?.id ?? Date.now());

  const [messages, setMessages] = useState(initialInterviewMessages);
  const [sufficiencyScore, setSufficiencyScore] = useState(16);

  const [outlineCandidates, setOutlineCandidates] = useState<OutlineCandidate[]>(generateOutlineCandidates());
  const [activeOutlineIndex, setActiveOutlineIndex] = useState(0);
  const [outlineVersions, setOutlineVersions] = useState<OutlineVersion[]>([]);

  const [sources, setSources] = useState<SourceItem[]>(buildMockSources(initialProjects[0]?.title ?? '未命名课题'));
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>(defaultGenerationSteps());
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGeneratedDraft, setHasGeneratedDraft] = useState(false);

  const [draftContent, setDraftContent] = useState(createInitialDraft(initialProjects[0]?.title ?? '未命名课题'));
  const [exportError, setExportError] = useState('');

  const activeProject = useMemo(() => projects.find((item) => item.id === activeProjectId) ?? projects[0], [projects, activeProjectId]);

  const updateProject = (projectId: number, patch: Partial<ProjectItem>) => {
    setProjects((prev) =>
      prev.map((item) => {
        if (item.id !== projectId) {
          return item;
        }

        return {
          ...item,
          ...patch,
          lastEdit: '刚刚'
        };
      })
    );
  };

  const resetFlowForProject = (projectTitle: string) => {
    setMessages(initialInterviewMessages);
    setSufficiencyScore(16);
    setOutlineCandidates(generateOutlineCandidates());
    setActiveOutlineIndex(0);
    setOutlineVersions([]);
    setSources(buildMockSources(projectTitle));
    setGenerationSteps(defaultGenerationSteps());
    setIsGenerating(false);
    setHasGeneratedDraft(false);
    setDraftContent(createInitialDraft(projectTitle));
    setExportError('');
  };

  const handleStartFromLanding = () => {
    setView('dashboard');
  };

  const handleOpenProject = (projectId: number) => {
    const project = projects.find((item) => item.id === projectId);

    if (!project) {
      return;
    }

    setActiveProjectId(projectId);
    resetFlowForProject(project.title);
    setView(stageToView[project.stage]);
  };

  const handleNewProject = () => {
    const id = Date.now();
    const newProject: ProjectItem = {
      id,
      title: `未命名课题 ${projects.length + 1}`,
      stage: 'interview',
      progress: 5,
      lastEdit: '刚刚'
    };

    setProjects((prev) => [newProject, ...prev]);
    setActiveProjectId(id);
    resetFlowForProject(newProject.title);
    setView('interview');
  };

  const handleArchiveProject = (projectId: number) => {
    const target = projects.find((item) => item.id === projectId);

    if (!target) {
      return;
    }

    setArchivedProjects((prev) => [{ ...target, deletedAt: nowLabel() }, ...prev]);
    setProjects((prev) => prev.filter((item) => item.id !== projectId));

    if (activeProjectId === projectId) {
      const fallback = projects.find((item) => item.id !== projectId);
      if (fallback) {
        setActiveProjectId(fallback.id);
      }
    }
  };

  const handleRestoreProject = (projectId: number) => {
    const target = archivedProjects.find((item) => item.id === projectId);

    if (!target) {
      return;
    }

    setArchivedProjects((prev) => prev.filter((item) => item.id !== projectId));
    setProjects((prev) => [{ ...target, lastEdit: '刚刚' }, ...prev]);
    setActiveProjectId(projectId);
    setView('dashboard');
  };

  const addAiMessage = (text: string) => {
    setMessages((prev) => [...prev, { role: 'ai', text }]);
  };

  const handleSendMessage = (input: string) => {
    setMessages((prev) => [...prev, { role: 'user', text: input }]);

    const aiQuestion = interviewQuestionBank[Math.floor(Math.random() * interviewQuestionBank.length)];
    const nextScore = clamp(sufficiencyScore + 8 + Math.floor(Math.random() * 10), 0, 96);

    window.setTimeout(() => {
      addAiMessage(aiQuestion);
      setSufficiencyScore(nextScore);
    }, 450);

    if (activeProject) {
      updateProject(activeProject.id, { stage: 'interview', progress: clamp(nextScore, 5, 55) });
    }
  };

  const handleSkipQuestion = () => {
    addAiMessage('已跳过当前问题。我们继续下一项：请补充你最希望评审看到的创新亮点。');
  };

  const handleSwitchTopic = () => {
    addAiMessage('好的，我们切换到“研究基础”。请描述现有团队、平台或前期数据支撑。');
  };

  const handleJumpToOutline = () => {
    if (!activeProject) {
      return;
    }

    const next = clamp(Math.max(sufficiencyScore, 60), 0, 100);
    setSufficiencyScore(next);
    updateProject(activeProject.id, { stage: 'outline', progress: next });
    setView('outline');
  };

  const handleRegenerateOutline = () => {
    setOutlineCandidates(generateOutlineCandidates());
    setActiveOutlineIndex(0);
  };

  const updateCandidate = (candidateIndex: number, updater: (candidate: OutlineCandidate) => OutlineCandidate) => {
    setOutlineCandidates((prev) => prev.map((item, idx) => (idx === candidateIndex ? updater(cloneOutline(item)) : item)));
  };

  const handleChangeSectionTitle = (candidateIndex: number, sectionIndex: number, value: string) => {
    updateCandidate(candidateIndex, (candidate) => {
      candidate.content[sectionIndex].title = value;
      return candidate;
    });
  };

  const handleChangeSubTitle = (candidateIndex: number, sectionIndex: number, subIndex: number, value: string) => {
    updateCandidate(candidateIndex, (candidate) => {
      candidate.content[sectionIndex].subs[subIndex] = value;
      return candidate;
    });
  };

  const handleAddSubTitle = (candidateIndex: number, sectionIndex: number) => {
    updateCandidate(candidateIndex, (candidate) => {
      const nextIndex = candidate.content[sectionIndex].subs.length + 1;
      candidate.content[sectionIndex].subs.push(`${sectionIndex + 1}.${nextIndex} 新增子标题`);
      return candidate;
    });
  };

  const handleRemoveSubTitle = (candidateIndex: number, sectionIndex: number, subIndex: number) => {
    updateCandidate(candidateIndex, (candidate) => {
      candidate.content[sectionIndex].subs.splice(subIndex, 1);
      if (candidate.content[sectionIndex].subs.length === 0) {
        candidate.content[sectionIndex].subs.push(`${sectionIndex + 1}.1 待补充`);
      }
      return candidate;
    });
  };

  const handleConfirmOutline = () => {
    if (!activeProject) {
      return;
    }

    const selected = outlineCandidates[activeOutlineIndex];
    if (!selected) {
      return;
    }

    const nextVersion: OutlineVersion = {
      id: `version-${Date.now()}`,
      createdAt: nowLabel(),
      label: `版本 ${outlineVersions.length + 1}`,
      outline: cloneOutline(selected)
    };

    setOutlineVersions((prev) => [nextVersion, ...prev]);
    updateProject(activeProject.id, { stage: 'sources', progress: 62 });
    setSources(buildMockSources(activeProject.title));
    setView('sources');
  };

  const handleRefreshSearch = () => {
    if (!activeProject) {
      return;
    }

    setSources(
      buildMockSources(activeProject.title).map((item, idx) => ({
        ...item,
        selected: idx < 3
      }))
    );
  };

  const handleToggleSource = (sourceId: string) => {
    setSources((prev) => prev.map((item) => (item.id === sourceId ? { ...item, selected: !item.selected } : item)));
  };

  const handleContinueGeneration = () => {
    if (!activeProject) {
      return;
    }

    updateProject(activeProject.id, { stage: 'generation', progress: 72 });
    setGenerationSteps(defaultGenerationSteps());
    setView('generation');
  };

  const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

  const runStep = async (index: number) => {
    setGenerationSteps((prev) => prev.map((item, idx) => (idx === index ? { ...item, status: 'running' } : item)));
    await wait(700);
    setGenerationSteps((prev) => prev.map((item, idx) => (idx === index ? { ...item, status: 'done' } : item)));
  };

  const handleStartGeneration = async () => {
    if (!activeProject || isGenerating) {
      return;
    }

    setHasGeneratedDraft(false);
    setIsGenerating(true);
    setGenerationSteps(defaultGenerationSteps());

    for (let idx = 0; idx < defaultGenerationSteps().length; idx += 1) {
      // eslint-disable-next-line no-await-in-loop
      await runStep(idx);
    }

    const selectedCount = sources.filter((item) => item.selected).length;
    const draftFooter =
      selectedCount > 0
        ? `\n\n参考资料条目（演示）：${selectedCount} 条。`
        : '\n\n提示：当前未选择资料库来源，建议先补充资料后再生成。';

    setDraftContent(`${createInitialDraft(activeProject.title)}${draftFooter}`);
    setIsGenerating(false);
    setHasGeneratedDraft(true);
    updateProject(activeProject.id, { stage: 'editor', progress: 88 });
  };

  const handleGoEditor = () => {
    if (!activeProject) {
      return;
    }

    setView('editor');
    updateProject(activeProject.id, { stage: 'editor', progress: 90 });
  };

  const handleProjectTitleChange = (value: string) => {
    if (!activeProject) {
      return;
    }

    setProjects((prev) => prev.map((item) => (item.id === activeProject.id ? { ...item, title: value || '未命名课题', lastEdit: '刚刚' } : item)));
  };

  const handleExportDocx = () => {
    if (!activeProject) {
      return;
    }

    try {
      exportAsDocx(activeProject.title, draftContent);
      setExportError('');
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Word 导出失败');
    }
  };

  const handleExportPdf = () => {
    if (!activeProject) {
      return;
    }

    try {
      exportAsPdf(activeProject.title, draftContent);
      setExportError('');
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'PDF 导出失败');
    }
  };

  const renderContent = () => {
    if (!activeProject && view !== 'landing' && view !== 'reservoir') {
      return <DashboardView projects={projects} onNewProject={handleNewProject} onOpenProject={handleOpenProject} onArchiveProject={handleArchiveProject} onOpenReservoir={() => setView('reservoir')} />;
    }

    switch (view) {
      case 'landing':
        return <LandingView onStart={handleStartFromLanding} />;
      case 'dashboard':
        return (
          <DashboardView
            projects={projects}
            onNewProject={handleNewProject}
            onOpenProject={handleOpenProject}
            onArchiveProject={handleArchiveProject}
            onOpenReservoir={() => setView('reservoir')}
          />
        );
      case 'interview':
        return (
          <InterviewView
            messages={messages}
            sufficiencyScore={sufficiencyScore}
            onBackDashboard={() => setView('dashboard')}
            onSendMessage={handleSendMessage}
            onSkipQuestion={handleSkipQuestion}
            onSwitchTopic={handleSwitchTopic}
            onJumpToOutline={handleJumpToOutline}
          />
        );
      case 'outline':
        return (
          <OutlineView
            candidates={outlineCandidates}
            activeIndex={activeOutlineIndex}
            versions={outlineVersions}
            onBackDashboard={() => setView('dashboard')}
            onSetActiveIndex={setActiveOutlineIndex}
            onRegenerate={handleRegenerateOutline}
            onConfirm={handleConfirmOutline}
            onChangeSectionTitle={handleChangeSectionTitle}
            onChangeSubTitle={handleChangeSubTitle}
            onAddSubTitle={handleAddSubTitle}
            onRemoveSubTitle={handleRemoveSubTitle}
          />
        );
      case 'sources':
        return (
          <SourcesView
            sources={sources}
            onBackOutline={() => setView('outline')}
            onRefreshSearch={handleRefreshSearch}
            onToggleSource={handleToggleSource}
            onContinueGeneration={handleContinueGeneration}
          />
        );
      case 'generation':
        return (
          <GenerationView
            steps={generationSteps}
            isGenerating={isGenerating}
            hasGeneratedDraft={hasGeneratedDraft}
            onBackSources={() => setView('sources')}
            onStartGeneration={handleStartGeneration}
            onGoEditor={handleGoEditor}
          />
        );
      case 'editor':
        return (
          <EditorView
            projectTitle={activeProject?.title ?? '未命名课题'}
            draftContent={draftContent}
            sources={sources}
            exportError={exportError}
            onBackGeneration={() => setView('generation')}
            onProjectTitleChange={handleProjectTitleChange}
            onDraftChange={setDraftContent}
            onOpenSources={() => setView('sources')}
            onExportDocx={handleExportDocx}
            onExportPdf={handleExportPdf}
          />
        );
      case 'reservoir':
        return (
          <ReservoirView
            archivedProjects={archivedProjects}
            onBackDashboard={() => setView('dashboard')}
            onRestoreProject={handleRestoreProject}
          />
        );
      default:
        return <LandingView onStart={handleStartFromLanding} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 selection:bg-[#0052FF] selection:text-white">
      {view !== 'landing' ? (
        <header className="sticky top-0 z-50 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-6">
          <button type="button" className="flex items-center gap-3" onClick={() => setView('dashboard')}>
            <div className="bg-gradient-primary flex h-8 w-8 items-center justify-center rounded-lg text-white">S</div>
            <span className="hidden font-serif text-lg font-bold md:block">校研智申</span>
          </button>

          <div className="hidden items-center gap-5 md:flex">
            {[
              { key: 'dashboard', label: '工作台', icon: FileText },
              { key: 'interview', label: '访谈', icon: History },
              { key: 'outline', label: '大纲', icon: Workflow },
              { key: 'sources', label: '资料库', icon: Search },
              { key: 'generation', label: '生成', icon: Workflow },
              { key: 'editor', label: '写作', icon: FileText }
            ].map((nav) => (
              <button
                type="button"
                key={nav.key}
                onClick={() => setView(nav.key as AppView)}
                className={`text-sm font-medium transition-colors ${view === nav.key ? 'text-[#0052FF]' : 'text-slate-500 hover:text-slate-900'}`}
              >
                {nav.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden h-8 w-px bg-slate-200 md:block" />
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-600">
                <User size={16} />
              </div>
              <span className="hidden text-sm font-medium text-slate-700 sm:block">张教授</span>
            </div>
            <Button variant="ghost" size="sm" className="!px-2 text-slate-400" icon={LogOut} onClick={() => setView('landing')} />
          </div>
        </header>
      ) : null}

      <main className="relative flex min-h-[calc(100vh-80px)] flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="flex w-full flex-1 flex-col"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};
