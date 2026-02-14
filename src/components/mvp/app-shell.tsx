'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { FileText, History, LogOut, Search, User, Workflow } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  createInitialDraft,
  generateOutlineCandidates,
  initialInterviewMessages,
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
import { api, type ApiProject } from '@/lib/api';

const UI_STATE_KEY = 'sps-ui-state-v1';
const DRAFT_PREFIX = 'sps-draft-';

const stageToView: Record<ProjectStage, AppView> = {
  interview: 'interview',
  outline: 'outline',
  sources: 'sources',
  generation: 'generation',
  editor: 'editor'
};

const statusToStage = (status: string): ProjectStage => {
  switch (status) {
    case 'INTERVIEW':
      return 'interview';
    case 'OUTLINE_CANDIDATES':
    case 'OUTLINE_LOCKED':
      return 'outline';
    case 'SOURCES_READY':
      return 'sources';
    case 'DRAFT_READY':
      return 'generation';
    case 'EXPORTABLE':
      return 'editor';
    default:
      return 'interview';
  }
};

const stageToStatus = (stage: ProjectStage) => {
  switch (stage) {
    case 'interview':
      return 'INTERVIEW';
    case 'outline':
      return 'OUTLINE_CANDIDATES';
    case 'sources':
      return 'SOURCES_READY';
    case 'generation':
      return 'DRAFT_READY';
    case 'editor':
      return 'EXPORTABLE';
    default:
      return 'INTERVIEW';
  }
};

const nowLabel = () => new Date().toLocaleString('zh-CN', { hour12: false });

const defaultGenerationSteps = (): GenerationStep[] => [
  { key: 'collect', title: '加载访谈与锁定大纲', status: 'idle' },
  { key: 'source', title: '汇总已选资料库来源', status: 'idle' },
  { key: 'write', title: '组织章节并生成整篇正文', status: 'idle' },
  { key: 'evidence', title: '执行引用与证据校验', status: 'idle' },
  { key: 'finish', title: '输出可编辑初稿', status: 'idle' }
];

const mapApiProject = (item: ApiProject): ProjectItem => ({
  id: item.id,
  title: item.title,
  stage: statusToStage(item.status),
  progress: statusToStage(item.status) === 'editor' ? 92 : statusToStage(item.status) === 'generation' ? 78 : 35,
  lastEdit: '刚刚'
});

const convertOutlineCandidates = (
  candidates: Array<{ label: string; focus: string; sections: Array<{ title: string; children: string[] }> }>
): OutlineCandidate[] => {
  const now = Date.now();
  return candidates.map((candidate, idx) => ({
    id: `candidate-${now}-${idx}`,
    title: candidate.label,
    focus: candidate.focus,
    fitScore: 88 + ((idx + 3) % 9),
    content: candidate.sections.map((section, sectionIdx) => ({
      id: sectionIdx + 1,
      title: section.title,
      subs: [...section.children]
    }))
  }));
};

const ensureSourceShape = (items: SourceItem[]) =>
  items.map((item, idx) => ({
    ...item,
    id: item.id || `source-${Date.now()}-${idx}`
  }));

const cloneOutline = (candidate: OutlineCandidate): OutlineCandidate => ({
  ...candidate,
  content: candidate.content.map((section) => ({ ...section, subs: [...section.subs] }))
});

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const MvpAppShell = () => {
  const [view, setView] = useState<AppView>('landing');
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [archivedProjects, setArchivedProjects] = useState<ArchivedProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('');

  const [messages, setMessages] = useState(initialInterviewMessages);
  const [sufficiencyScore, setSufficiencyScore] = useState(16);
  const [interviewSummary, setInterviewSummary] = useState('');

  const [outlineCandidates, setOutlineCandidates] = useState<OutlineCandidate[]>(generateOutlineCandidates());
  const [activeOutlineIndex, setActiveOutlineIndex] = useState(0);
  const [outlineVersions, setOutlineVersions] = useState<OutlineVersion[]>([]);

  const [sources, setSources] = useState<SourceItem[]>([]);
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>(defaultGenerationSteps());
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGeneratedDraft, setHasGeneratedDraft] = useState(false);

  const [draftContent, setDraftContent] = useState('');
  const [exportError, setExportError] = useState('');

  const activeProject = useMemo(() => projects.find((item) => item.id === activeProjectId), [projects, activeProjectId]);

  const persistUiState = (nextView: AppView, nextProjectId: string) => {
    localStorage.setItem(UI_STATE_KEY, JSON.stringify({ view: nextView, activeProjectId: nextProjectId }));
  };

  const setViewWithPersist = (nextView: AppView) => {
    setView(nextView);
    persistUiState(nextView, activeProjectId);
  };

  const syncProjectStage = async (projectId: string, stage: ProjectStage, progress: number) => {
    setProjects((prev) =>
      prev.map((item) =>
        item.id === projectId
          ? {
              ...item,
              stage,
              progress,
              lastEdit: '刚刚'
            }
          : item
      )
    );

    try {
      await api.updateProject(projectId, { status: stageToStatus(stage) });
    } catch {
      // Keep UI responsive even when mock API fails.
    }
  };

  const resetFlowForProject = (projectTitle: string, projectId: string) => {
    setMessages(initialInterviewMessages);
    setSufficiencyScore(16);
    setInterviewSummary('');
    setOutlineCandidates(generateOutlineCandidates());
    setActiveOutlineIndex(0);
    setOutlineVersions([]);
    setSources([]);
    setGenerationSteps(defaultGenerationSteps());
    setIsGenerating(false);
    setHasGeneratedDraft(false);
    const localDraft = localStorage.getItem(`${DRAFT_PREFIX}${projectId}`);
    setDraftContent(localDraft || createInitialDraft(projectTitle));
    setExportError('');
  };

  const loadProjectState = async (projectId: string) => {
    try {
      const state = await api.getProjectState(projectId);
      const localDraft = localStorage.getItem(`${DRAFT_PREFIX}${projectId}`);

      if (state.interview) {
        setSufficiencyScore(Math.round(state.interview.sufficiencyScore * 100));
        setInterviewSummary(state.interview.summary);
      }

      if (state.outlines?.candidates?.length) {
        const converted = convertOutlineCandidates(state.outlines.candidates);
        setOutlineCandidates(converted);
        setActiveOutlineIndex(0);
      }

      if (state.sources?.length) {
        setSources(ensureSourceShape(state.sources));
      }

      if (state.draft?.content) {
        setDraftContent(localDraft || state.draft.content);
        setHasGeneratedDraft(true);
      } else {
        setDraftContent(localDraft || createInitialDraft(state.project.title));
      }
    } catch {
      if (activeProject) {
        resetFlowForProject(activeProject.title, activeProject.id);
      }
    }
  };

  const bootstrap = async () => {
    try {
      const payload = await api.listProjects();
      const active = payload.active.map(mapApiProject);
      const archived = payload.archived.map((item) => ({ ...mapApiProject(item), deletedAt: item.deletedAt || nowLabel() }));

      setProjects(active);
      setArchivedProjects(archived);

      const cached = localStorage.getItem(UI_STATE_KEY);
      const parsed = cached ? (JSON.parse(cached) as { view?: AppView; activeProjectId?: string }) : {};

      if (active.length === 0) {
        const created = await api.createProject(`未命名课题-${Date.now()}`);
        const project = mapApiProject(created);
        setProjects([project]);
        setActiveProjectId(project.id);
        resetFlowForProject(project.title, project.id);
        setView('interview');
        persistUiState('interview', project.id);
        return;
      }

      const preferredId = parsed.activeProjectId && active.some((item) => item.id === parsed.activeProjectId) ? parsed.activeProjectId : active[0].id;
      const preferredView = parsed.view && parsed.view !== 'landing' ? parsed.view : 'dashboard';

      setActiveProjectId(preferredId);
      await loadProjectState(preferredId);
      setView(preferredView);
      persistUiState(preferredView, preferredId);
    } catch {
      // Fallback for first launch when API is unavailable.
      setView('dashboard');
    }
  };

  useEffect(() => {
    void bootstrap();
  }, []);

  useEffect(() => {
    if (!activeProjectId) {
      return;
    }
    localStorage.setItem(`${DRAFT_PREFIX}${activeProjectId}`, draftContent);
  }, [activeProjectId, draftContent]);

  const handleStartFromLanding = () => {
    setViewWithPersist('dashboard');
  };

  const handleOpenProject = async (projectId: string) => {
    const project = projects.find((item) => item.id === projectId);

    if (!project) {
      return;
    }

    setActiveProjectId(projectId);
    resetFlowForProject(project.title, project.id);
    await loadProjectState(projectId);
    const nextView = stageToView[project.stage];
    setView(nextView);
    persistUiState(nextView, projectId);
  };

  const handleNewProject = async () => {
    const created = await api.createProject(`未命名课题-${projects.length + 1}`);
    const project = mapApiProject(created);

    setProjects((prev) => [project, ...prev]);
    setActiveProjectId(project.id);
    resetFlowForProject(project.title, project.id);
    setView('interview');
    persistUiState('interview', project.id);
  };

  const handleArchiveProject = async (projectId: string) => {
    const target = projects.find((item) => item.id === projectId);

    if (!target) {
      return;
    }

    await api.deleteProject(projectId);
    setArchivedProjects((prev) => [{ ...target, deletedAt: nowLabel() }, ...prev]);
    setProjects((prev) => prev.filter((item) => item.id !== projectId));

    const fallback = projects.find((item) => item.id !== projectId);
    if (fallback) {
      setActiveProjectId(fallback.id);
      persistUiState('dashboard', fallback.id);
    }
  };

  const handleRestoreProject = async (projectId: string) => {
    await api.restoreProject(projectId);

    const target = archivedProjects.find((item) => item.id === projectId);
    if (!target) {
      return;
    }

    setArchivedProjects((prev) => prev.filter((item) => item.id !== projectId));
    setProjects((prev) => [{ ...target, lastEdit: '刚刚' }, ...prev]);
    setActiveProjectId(projectId);
    setView('dashboard');
    persistUiState('dashboard', projectId);
  };

  const addAiMessage = (text: string) => {
    setMessages((prev) => [...prev, { role: 'ai', text }]);
  };

  const handleSendMessage = async (input: string) => {
    if (!activeProject) {
      return;
    }

    const updatedMessages = [...messages, { role: 'user' as const, text: input }];
    setMessages(updatedMessages);

    try {
      const output = await api.interviewNext({
        projectId: activeProject.id,
        projectTitle: activeProject.title,
        history: updatedMessages.map((item) => ({
          role: item.role === 'ai' ? 'assistant' : 'user',
          content: item.text
        })),
        userAnswer: input
      });

      addAiMessage(output.nextQuestion);
      setSufficiencyScore(Math.round(output.sufficiencyScore * 100));
      setInterviewSummary(output.summary);
      await syncProjectStage(activeProject.id, 'interview', clamp(Math.round(output.sufficiencyScore * 100), 5, 55));
    } catch {
      const aiQuestion = interviewQuestionBank[Math.floor(Math.random() * interviewQuestionBank.length)];
      addAiMessage(aiQuestion);
      const nextScore = clamp(sufficiencyScore + 8 + Math.floor(Math.random() * 10), 0, 96);
      setSufficiencyScore(nextScore);
      await syncProjectStage(activeProject.id, 'interview', clamp(nextScore, 5, 55));
    }
  };

  const handleSkipQuestion = () => {
    addAiMessage('已跳过当前问题。我们继续下一项：请补充你最希望评审看到的创新亮点。');
  };

  const handleSwitchTopic = () => {
    addAiMessage('好的，我们切换到“研究基础”。请描述现有团队、平台或前期数据支撑。');
  };

  const handleJumpToOutline = async () => {
    if (!activeProject) {
      return;
    }

    const next = clamp(Math.max(sufficiencyScore, 60), 0, 100);
    setSufficiencyScore(next);
    await syncProjectStage(activeProject.id, 'outline', next);

    if (!outlineCandidates.length) {
      await handleRegenerateOutline();
    }

    setView('outline');
    persistUiState('outline', activeProject.id);
  };

  const updateCandidate = (candidateIndex: number, updater: (candidate: OutlineCandidate) => OutlineCandidate) => {
    setOutlineCandidates((prev) => prev.map((item, idx) => (idx === candidateIndex ? updater(cloneOutline(item)) : item)));
  };

  const handleRegenerateOutline = async () => {
    if (!activeProject) {
      return;
    }

    try {
      const response = await api.generateOutlines({
        projectId: activeProject.id,
        projectTitle: activeProject.title,
        interviewSummary: interviewSummary || messages.map((item) => item.text).join('\n')
      });

      const converted = convertOutlineCandidates(response.candidates);
      setOutlineCandidates(converted);
      setActiveOutlineIndex(0);
    } catch {
      setOutlineCandidates(generateOutlineCandidates());
      setActiveOutlineIndex(0);
    }
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

  const handleMoveSection = (candidateIndex: number, sectionIndex: number, direction: 'up' | 'down') => {
    updateCandidate(candidateIndex, (candidate) => {
      const targetIndex = direction === 'up' ? sectionIndex - 1 : sectionIndex + 1;
      if (targetIndex < 0 || targetIndex >= candidate.content.length) {
        return candidate;
      }

      const next = [...candidate.content];
      const [current] = next.splice(sectionIndex, 1);
      next.splice(targetIndex, 0, current);

      candidate.content = next.map((section, idx) => ({
        ...section,
        id: idx + 1
      }));
      return candidate;
    });
  };

  const handleRestoreVersion = (versionId: string) => {
    const version = outlineVersions.find((item) => item.id === versionId);
    if (!version) {
      return;
    }

    const restored = cloneOutline(version.outline);
    const existingIndex = outlineCandidates.findIndex((item) => item.id === restored.id);

    if (existingIndex >= 0) {
      setOutlineCandidates((prev) => prev.map((item, idx) => (idx === existingIndex ? restored : item)));
      setActiveOutlineIndex(existingIndex);
      return;
    }

    setOutlineCandidates((prev) => [restored, ...prev]);
    setActiveOutlineIndex(0);
  };

  const handleConfirmOutline = async () => {
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

    await api.lockOutline({
      projectId: activeProject.id,
      outlineId: selected.id,
      outline: selected
    });

    await syncProjectStage(activeProject.id, 'sources', 62);
    setView('sources');
    persistUiState('sources', activeProject.id);
    await handleRefreshSearch();
  };

  const handleRefreshSearch = async () => {
    if (!activeProject) {
      return;
    }

    const keywords = outlineCandidates[activeOutlineIndex]?.content.map((section) => section.title) || ['立项依据', '研究内容', '研究基础'];
    const response = await api.searchSources({
      projectId: activeProject.id,
      projectTitle: activeProject.title,
      outlineKeywords: keywords
    });

    setSources(ensureSourceShape(response.items));
  };

  const handleToggleSource = async (sourceId: string) => {
    if (!activeProject) {
      return;
    }

    const current = sources.find((item) => item.id === sourceId);
    if (!current) {
      return;
    }

    const response = await api.selectSource({
      projectId: activeProject.id,
      sourceId,
      selected: !current.selected
    });

    setSources(ensureSourceShape(response.items));
  };

  const handleAddManualSource = async (payload: {
    title: string;
    url: string;
    source: string;
    year: string;
    abstract: string;
    sectionKey: SourceItem['sectionKey'];
  }) => {
    if (!activeProject) {
      return;
    }

    const item = await api.addSource({
      projectId: activeProject.id,
      title: payload.title,
      url: payload.url,
      source: payload.source,
      year: payload.year,
      abstract: payload.abstract,
      sectionKey: payload.sectionKey,
      score: 82
    });

    setSources((prev) => [item, ...prev]);
  };

  const handleContinueGeneration = async () => {
    if (!activeProject) {
      return;
    }

    await syncProjectStage(activeProject.id, 'generation', 72);
    setGenerationSteps(defaultGenerationSteps());
    setView('generation');
    persistUiState('generation', activeProject.id);
  };

  const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

  const runStep = async (index: number) => {
    setGenerationSteps((prev) => prev.map((item, idx) => (idx === index ? { ...item, status: 'running' } : item)));
    await wait(500);
    setGenerationSteps((prev) => prev.map((item, idx) => (idx === index ? { ...item, status: 'done' } : item)));
  };

  const autoFillMissingSections = async (missingSections: string[]) => {
    if (!activeProject) {
      return;
    }

    const response = await api.searchSources({
      projectId: activeProject.id,
      projectTitle: activeProject.title,
      outlineKeywords: missingSections
    });

    const items = ensureSourceShape(response.items);
    const nextItems = [...items];

    for (const section of missingSections) {
      const sectionItems = nextItems.filter((item) => item.sectionKey === section);
      const selectedCount = sectionItems.filter((item) => item.selected).length;
      const need = Math.max(0, 2 - selectedCount);

      if (need > 0) {
        const candidates = sectionItems.filter((item) => !item.selected).slice(0, need);

        for (const candidate of candidates) {
          const updated = await api.selectSource({
            projectId: activeProject.id,
            sourceId: candidate.id,
            selected: true
          });
          nextItems.splice(0, nextItems.length, ...ensureSourceShape(updated.items));
        }
      }
    }

    setSources(nextItems);
  };

  const handleStartGeneration = async () => {
    if (!activeProject || isGenerating) {
      return;
    }

    setHasGeneratedDraft(false);
    setExportError('');
    setIsGenerating(true);
    setGenerationSteps(defaultGenerationSteps());

    await runStep(0);
    await runStep(1);

    let retryCount = 0;
    let generated = false;

    while (!generated && retryCount <= 2) {
      setGenerationSteps((prev) => prev.map((item, idx) => (idx === 2 ? { ...item, status: 'running' } : item)));

      const response = await api.generateDraft({
        projectId: activeProject.id,
        title: activeProject.title,
        outlineText: JSON.stringify(outlineCandidates[activeOutlineIndex] || {}),
        sourceText: JSON.stringify(sources.filter((item) => item.selected)),
        retryCount
      });

      if (response.ok) {
        const payload = (await response.json()) as {
          data: {
            content: string;
          };
        };

        setDraftContent(payload.data.content);
        setGenerationSteps((prev) => prev.map((item, idx) => (idx === 2 ? { ...item, status: 'done' } : item)));
        generated = true;
        break;
      }

      const errorPayload = (await response.json()) as {
        error?: string;
        data?: {
          missingSections?: string[];
        };
      };

      if (response.status === 422 && errorPayload.error === 'INSUFFICIENT_CITATIONS') {
        const missingSections = errorPayload.data?.missingSections || [];
        if (retryCount >= 2) {
          setExportError(`生成失败：引用不足（${missingSections.join('、')}），已重试 2 次。`);
          break;
        }

        await autoFillMissingSections(missingSections);
        retryCount += 1;
        continue;
      }

      setExportError('生成失败，请稍后重试。');
      break;
    }

    await runStep(3);
    await runStep(4);

    setIsGenerating(false);

    if (generated) {
      setHasGeneratedDraft(true);
      await syncProjectStage(activeProject.id, 'editor', 88);
    }
  };

  const handleGoEditor = async () => {
    if (!activeProject) {
      return;
    }

    setView('editor');
    persistUiState('editor', activeProject.id);
    await syncProjectStage(activeProject.id, 'editor', 92);
  };

  const handleProjectTitleChange = async (value: string) => {
    if (!activeProject) {
      return;
    }

    const title = value || '未命名课题';
    setProjects((prev) => prev.map((item) => (item.id === activeProject.id ? { ...item, title, lastEdit: '刚刚' } : item)));

    await api.updateProject(activeProject.id, { title });
  };

  const handleExportDocx = async () => {
    if (!activeProject) {
      return;
    }

    try {
      await exportAsDocx(activeProject.title, draftContent);
      setExportError('');
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Word 导出失败');
    }
  };

  const handleExportPdf = async () => {
    if (!activeProject) {
      return;
    }

    try {
      await exportAsPdf(activeProject.title, draftContent);
      setExportError('');
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'PDF 导出失败');
    }
  };

  const renderContent = () => {
    if (!activeProject && view !== 'landing' && view !== 'reservoir') {
      return (
        <DashboardView
          projects={projects}
          onNewProject={handleNewProject}
          onOpenProject={handleOpenProject}
          onArchiveProject={handleArchiveProject}
          onOpenReservoir={() => setViewWithPersist('reservoir')}
        />
      );
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
            onOpenReservoir={() => setViewWithPersist('reservoir')}
          />
        );
      case 'interview':
        return (
          <InterviewView
            messages={messages}
            sufficiencyScore={sufficiencyScore}
            onBackDashboard={() => setViewWithPersist('dashboard')}
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
            onBackDashboard={() => setViewWithPersist('dashboard')}
            onSetActiveIndex={setActiveOutlineIndex}
            onRegenerate={handleRegenerateOutline}
            onConfirm={handleConfirmOutline}
            onChangeSectionTitle={handleChangeSectionTitle}
            onChangeSubTitle={handleChangeSubTitle}
            onAddSubTitle={handleAddSubTitle}
            onRemoveSubTitle={handleRemoveSubTitle}
            onMoveSection={handleMoveSection}
            onRestoreVersion={handleRestoreVersion}
          />
        );
      case 'sources':
        return (
          <SourcesView
            projectId={activeProject?.id || ''}
            sources={sources}
            onBackOutline={() => setViewWithPersist('outline')}
            onRefreshSearch={handleRefreshSearch}
            onToggleSource={handleToggleSource}
            onAddManualSource={handleAddManualSource}
            onContinueGeneration={handleContinueGeneration}
          />
        );
      case 'generation':
        return (
          <GenerationView
            steps={generationSteps}
            isGenerating={isGenerating}
            hasGeneratedDraft={hasGeneratedDraft}
            onBackSources={() => setViewWithPersist('sources')}
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
            onBackGeneration={() => setViewWithPersist('generation')}
            onProjectTitleChange={handleProjectTitleChange}
            onDraftChange={setDraftContent}
            onOpenSources={() => setViewWithPersist('sources')}
            onExportDocx={handleExportDocx}
            onExportPdf={handleExportPdf}
          />
        );
      case 'reservoir':
        return (
          <ReservoirView
            archivedProjects={archivedProjects}
            onBackDashboard={() => setViewWithPersist('dashboard')}
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
          <button type="button" className="flex items-center gap-3" onClick={() => setViewWithPersist('dashboard')}>
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
                onClick={() => setViewWithPersist(nav.key as AppView)}
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
            <Button
              variant="ghost"
              size="sm"
              className="!px-2 text-slate-400"
              icon={LogOut}
              onClick={() => setViewWithPersist('landing')}
            />
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
