import './DesktopPage.css';
import {
  Activity,
  ArrowRight,
  Bot,
  BrainCircuit,
  ChevronRight,
  GitMerge,
  HardDrive,
  MessageSquare,
  NotebookPen,
  ShieldCheck,
  Terminal,
  Workflow,
  type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCasdoor } from '@hquant/casdoor/client/react';

interface NavActionProps {
  children: ReactNode;
  onClick?: () => void;
}

interface ButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  colSpan?: 1 | 2;
}

const WORKSPACE_LINKS = [
  { label: 'Chat', route: '/chat' },
  { label: 'Spec', route: '/spec' },
  { label: 'Runners', route: '/runners' },
  { label: 'Flow', route: '/flow' },
] as const;

const SURFACE_LINKS = [
  {
    title: 'Chat Workspace',
    description: 'Conversational execution with tools, streaming traces, and checkpointed sessions.',
    route: '/chat',
    icon: MessageSquare,
  },
  {
    title: 'Spec Workflow',
    description: 'Plan requirements, design, and task breakdown before code execution starts.',
    route: '/spec',
    icon: NotebookPen,
  },
  {
    title: 'Runner Control',
    description: 'Register runners, issue tokens, and manage approval-aware execution surfaces.',
    route: '/runners',
    icon: HardDrive,
  },
  {
    title: 'Flow Surface',
    description: 'Keep room for DAG and agent-team orchestration as the flow workspace grows.',
    route: '/flow',
    icon: Bot,
  },
] as const;

const DESKTOP_PREVIEW_IMAGES = [
  {
    src: '//minio.8and1.cn/static/aflow/show-a.jpg',
    alt: 'AFlow desktop workspace preview A',
  },
  {
    src: '//minio.8and1.cn/static/aflow/show-b.jpg',
    alt: 'AFlow desktop workspace preview B',
  },
] as const;

function NavAction({ children, onClick }: NavActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-sm font-medium text-slate-500 transition-colors duration-300 hover:text-slate-900"
    >
      {children}
    </button>
  );
}

function ButtonPrimary({ children, className = '', onClick }: ButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-10 items-center justify-center rounded-full bg-slate-900 px-6 text-sm font-medium text-white shadow-sm transition-all duration-300 hover:bg-slate-800 hover:shadow-md ${className}`}
    >
      {children}
    </button>
  );
}

function ButtonSecondary({ children, className = '', onClick }: ButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-10 items-center justify-center rounded-full border border-slate-200/60 bg-white px-6 text-sm font-medium text-slate-700 transition-all duration-300 hover:border-slate-300 hover:bg-slate-50 ${className}`}
    >
      {children}
    </button>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="mb-6 inline-flex items-center rounded-full border border-slate-200/50 bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
      {children}
    </span>
  );
}

function FeatureCard({ icon: Icon, title, description, colSpan = 1 }: FeatureCardProps) {
  return (
    <div
      className={`group col-span-1 flex flex-col rounded-3xl bg-white p-8 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] transition-all duration-500 ease-in-out hover:border-slate-200/80 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06)] md:border md:border-slate-200/40 ${colSpan === 2 ? 'md:col-span-2' : ''}`}
    >
      <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 transition-all duration-500 ease-in-out group-hover:border-slate-800 group-hover:bg-slate-900 group-hover:text-white">
        <Icon className="h-5 w-5 text-slate-700 transition-colors duration-500 group-hover:text-white" strokeWidth={1.5} />
      </div>
      <h3 className="mb-2 text-lg font-semibold tracking-tight text-slate-900">{title}</h3>
      <p className="max-w-sm text-sm leading-relaxed text-slate-500">{description}</p>
    </div>
  );
}

export function DesktopPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user, login, logout } = useCasdoor();
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);

  const authLabel = useMemo(() => {
    if (isLoading) return 'Checking workspace session';
    if (isAuthenticated) {
      return `Signed in as ${user?.displayName || user?.name || 'workspace user'}`;
    }
    return 'Public landing page for the current workspace';
  }, [isAuthenticated, isLoading, user?.displayName, user?.name]);

  useEffect(() => {
    if (DESKTOP_PREVIEW_IMAGES.length < 2) return undefined;

    const intervalId = window.setInterval(() => {
      setActivePreviewIndex((current) => (current + 1) % DESKTOP_PREVIEW_IMAGES.length);
    }, 3800);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const handleOpenWorkspace = () => {
    navigate('/chat');
  };

  const handleSignIn = async () => {
    if (isAuthenticated) {
      navigate('/chat');
      return;
    }
    await login();
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-900 selection:bg-slate-200">
      <nav className="fixed inset-x-0 top-0 z-50 h-16 border-b border-slate-200/40 bg-white/70 backdrop-blur-md transition-all duration-300">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
          <button
            type="button"
            onClick={() => navigate('/desktop')}
            className="flex items-center gap-2"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900">
              <Workflow className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold tracking-tight text-slate-900">AFlow</span>
          </button>

          <div className="hidden items-center gap-8 md:flex">
            {WORKSPACE_LINKS.map((item) => (
              <NavAction key={item.route} onClick={() => navigate(item.route)}>
                {item.label}
              </NavAction>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={logout}
                className="hidden text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 sm:block"
              >
                Logout
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  void handleSignIn();
                }}
                className="hidden text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 sm:block"
              >
                Sign in
              </button>
            )}
            <ButtonPrimary className="h-9 px-5" onClick={handleOpenWorkspace}>
              Go to Console
            </ButtonPrimary>
          </div>
        </div>
      </nav>

      <main className="flex-1 pt-16">
        <section className="relative overflow-hidden pb-24 pt-32">
          <div className="desktop-grid-pattern absolute inset-0 pointer-events-none opacity-[0.2]" />

          <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 text-center">
            <Badge>{authLabel}</Badge>

            <h1 className="mb-8 text-5xl font-semibold leading-[1.1] tracking-tighter text-slate-900 md:text-7xl">
              The workspace for
              <br className="hidden md:block" />{' '}
              <span className="text-slate-400">agent orchestration.</span>
            </h1>

            <p className="mb-10 max-w-3xl text-lg font-light leading-relaxed text-slate-500 md:text-xl">
              AFlow combines conversational execution, DAG and loop workflows, runner-backed tooling,
              multi-surface collaboration, and approval-aware automation in one design-forward workspace.
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <ButtonPrimary className="group h-12 w-full px-8 text-base sm:w-auto" onClick={handleOpenWorkspace}>
                Open Chat Workspace
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </ButtonPrimary>
              <ButtonSecondary className="h-12 w-full px-8 text-base sm:w-auto" onClick={() => navigate('/spec')}>
                <Terminal className="mr-2 h-4 w-4 text-slate-400" />
                Explore Spec Workflow
              </ButtonSecondary>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {SURFACE_LINKS.map((item) => (
                <button
                  key={item.route}
                  type="button"
                  onClick={() => navigate(item.route)}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/85 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-900"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-32">
          <div className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white shadow-xl shadow-slate-200/40 ring-1 ring-slate-900/5">
            <div className="flex h-12 items-center gap-4 border-b border-slate-100 bg-slate-50/50 px-4">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-slate-200" />
                <div className="h-3 w-3 rounded-full bg-slate-200" />
                <div className="h-3 w-3 rounded-full bg-slate-200" />
              </div>
              <div className="flex flex-1 justify-center">
                <div className="flex items-center gap-2 rounded-md border border-slate-100 bg-white px-3 py-1 text-xs text-slate-400 shadow-sm">
                  <Activity className="h-3 w-3" />
                  <span className="font-mono">aflow.8and1.cn</span>
                </div>
              </div>
              <div className="w-12 text-right">
                <button type="button" className="text-slate-400 transition-colors hover:text-slate-600">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="desktop-preview-stage">
                  {DESKTOP_PREVIEW_IMAGES.map((image, index) => (
                    <img
                      key={image.src}
                      src={image.src}
                      alt={image.alt}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                      className={`desktop-preview-image ${
                        index === activePreviewIndex
                          ? 'desktop-preview-image-active'
                          : 'desktop-preview-image-inactive'
                      }`}
                    />
                  ))}

                  <div className="desktop-preview-overlay" />

                  <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-4 p-5 md:p-6">
                    <div className="rounded-full bg-white/82 px-4 py-2 text-xs font-medium text-slate-700 shadow-sm backdrop-blur-md">
                      Workspace walkthrough preview
                    </div>
                    <div className="flex items-center gap-2 rounded-full bg-slate-900/55 px-3 py-2 backdrop-blur-md">
                      {DESKTOP_PREVIEW_IMAGES.map((image, index) => (
                        <span
                          key={image.src}
                          className={`h-2 rounded-full transition-all duration-500 ${
                            index === activePreviewIndex ? 'w-6 bg-white' : 'w-2 bg-white/45'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-32">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-slate-900">Built around the current stack.</h2>
            <p className="font-light leading-relaxed text-slate-500">
              The homepage keeps the visual language from the imported concept, but routes, authentication,
              runtime surfaces, and feature descriptions now align with this repository.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <FeatureCard
              icon={GitMerge}
              title="Conversation + DAG orchestration"
              description="Blend interactive chat turns with planner-driven DAG and loop execution in the same runtime."
              colSpan={2}
            />
            <FeatureCard
              icon={ShieldCheck}
              title="Approval-aware runners"
              description="High-risk shell execution flows through the runner approval path instead of hidden browser confirms."
            />
            <FeatureCard
              icon={BrainCircuit}
              title="Memory and compaction"
              description="Support long conversations with semantic compaction, session persistence, and replay-friendly state."
            />
            <FeatureCard
              icon={Activity}
              title="Workspace surfaces"
              description="Chat, spec, runner, and future flow pages live under one authenticated web UI."
              colSpan={2}
            />
          </div>
        </section>

        <section className="relative mt-20 overflow-hidden rounded-t-[3rem] bg-slate-900 p-12 text-white md:p-24">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
          <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
            <h2 className="mb-6 text-4xl font-semibold tracking-tight md:text-6xl">
              Move from homepage to execution in one step.
            </h2>
            <p className="mb-12 max-w-2xl text-lg font-light text-slate-400 md:text-xl">
              Open the current workspace, start a spec-first session, or bootstrap runner control using the real routes from this project.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <ButtonPrimary className="bg-white text-slate-900 hover:bg-slate-100" onClick={handleOpenWorkspace}>
                Open Chat
              </ButtonPrimary>
              <ButtonSecondary
                className="border-slate-700 bg-transparent text-slate-300 hover:border-slate-600 hover:bg-slate-800 hover:text-white"
                onClick={() => navigate('/runners')}
              >
                Runner Setup
              </ButtonSecondary>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
