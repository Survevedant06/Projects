import { useState } from 'react';
import { CheckCircle2, Circle, ArrowRight, ExternalLink, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';

/**
 * Design Philosophy: Modern Tech Dashboard with Glassmorphism
 * - Deep slate background with frosted glass cards
 * - Teal/cyan accent colors with warm amber highlights
 * - Smooth animations and micro-interactions
 * - Progressive disclosure of information
 */

interface Phase {
  id: number;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending';
  progress: number;
  tasks: Task[];
  details: string;
}

interface Task {
  id: number;
  name: string;
  completed: boolean;
}

const phases: Phase[] = [
  {
    id: 1,
    title: 'API Key Acquisition',
    description: 'Set up Google Cloud Project and obtain API credentials',
    status: 'pending',
    progress: 0,
    tasks: [
      { id: 1, name: 'Create Google Cloud Project', completed: false },
      { id: 2, name: 'Enable Places API', completed: false },
      { id: 3, name: 'Enable Maps JavaScript API', completed: false },
      { id: 4, name: 'Generate and secure API key', completed: true },
    ],
    details: 'To interact with external services, specifically the Google Places API, you will need to obtain an API key. This key will authenticate your application\'s requests to Google\'s services.',
  },
  {
    id: 2,
    title: 'Backend Setup',
    description: 'Initialize Node.js, Express.js, and MongoDB integration',
    status: 'in-progress',
    progress: 20,
    tasks: [
      { id: 1, name: 'Initialize Node.js project', completed: true },
      { id: 2, name: 'Install Express and dependencies', completed: false },
      { id: 3, name: 'Set up MongoDB connection', completed: false },
      { id: 4, name: 'Integrate Google Places API', completed: false },
      { id: 5, name: 'Define RESTful API endpoints', completed: false },
    ],
    details: 'This phase focuses on setting up the server-side logic, database connection, and integration with the Google Places API. We will make requests to search for cafes, fetch details, and handle API responses.',
  },
  {
    id: 3,
    title: 'Frontend Development',
    description: 'Build React UI with Tailwind CSS and integrate backend',
    status: 'in-progress',
    progress: 40,
    tasks: [
      { id: 1, name: 'Initialize React project', completed: true },
      { id: 2, name: 'Implement geolocation integration', completed: true },
      { id: 3, name: 'Build search and filter components', completed: false },
      { id: 4, name: 'Create cafe listing cards', completed: false },
      { id: 5, name: 'Ensure responsive design', completed: false },
    ],
    details: 'This phase will focus on building the user interface and integrating it with the backend API. We will create a mobile-first design with responsive components.',
  },
  {
    id: 4,
    title: 'Testing & Deployment',
    description: 'Test application and deploy to production',
    status: 'pending',
    progress: 0,
    tasks: [
      { id: 1, name: 'Unit and integration testing', completed: false },
      { id: 2, name: 'Performance optimization', completed: false },
      { id: 3, name: 'Security audit', completed: false },
      { id: 4, name: 'Deploy to production', completed: false },
    ],
    details: 'Final phase includes comprehensive testing, performance optimization, and deployment to production environments.',
  },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [expandedPhase, setExpandedPhase] = useState<number | null>(null);
  const [phaseList, setPhaseList] = useState<Phase[]>(phases);

  // Calculate overall progress
  const totalTasks = phaseList.reduce((sum, phase) => sum + phase.tasks.length, 0);
  const completedTasks = phaseList.reduce(
    (sum, phase) => sum + phase.tasks.filter(t => t.completed).length,
    0
  );
  const overallProgress = Math.round((completedTasks / totalTasks) * 100);

  // Handle task completion toggle
  const toggleTask = (phaseId: number, taskId: number) => {
    setPhaseList(phaseList.map(phase => {
      if (phase.id === phaseId) {
        const updatedTasks = phase.tasks.map(task =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        );
        const completedCount = updatedTasks.filter(t => t.completed).length;
        const newProgress = Math.round((completedCount / updatedTasks.length) * 100);
        const newStatus = completedCount === updatedTasks.length ? 'completed' : 'in-progress';
        return { ...phase, tasks: updatedTasks, progress: newProgress, status: newStatus };
      }
      return phase;
    }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Animated background gradient */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl opacity-20" />
      </div>

      {/* Header */}
      <header className="relative border-b border-white/10 backdrop-blur-md bg-white/5">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold font-display mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Cafe Finder
              </h1>
              <p className="text-sm text-muted-foreground">Project Development Tracker</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-3xl font-bold text-cyan-400">{overallProgress}%</div>
                <p className="text-xs text-muted-foreground mt-1">{completedTasks} of {totalTasks} tasks</p>
              </div>
              <Button
                onClick={() => setLocation('/cafe-finder')}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-0 gap-2"
              >
                <Coffee className="w-4 h-4" />
                Try App
              </Button>
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden backdrop-blur-sm">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-amber-400 transition-all duration-500 ease-out"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Timeline Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Project Phases
              </h2>
              {phaseList.map((phase) => (
                <button
                  key={phase.id}
                  onClick={() => setExpandedPhase(expandedPhase === phase.id ? null : phase.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-300 group ${
                    expandedPhase === phase.id
                      ? 'bg-white/15 border border-cyan-400/50 backdrop-blur-md'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {phase.status === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      ) : phase.status === 'in-progress' ? (
                        <Circle className="w-5 h-5 text-cyan-400 animate-pulse" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-cyan-400 transition-colors">
                        Phase {phase.id}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{phase.title}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Content - Phase Details */}
          <div className="lg:col-span-2 space-y-6">
            {expandedPhase ? (
              // Expanded Phase View
              phaseList.map(phase => {
                if (phase.id !== expandedPhase) return null;
                return (
                  <div key={phase.id} className="space-y-6 animate-in fade-in duration-300">
                    {/* Phase Header */}
                    <div className="bg-gradient-to-br from-white/15 to-white/5 border border-white/20 rounded-xl p-6 backdrop-blur-md">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h2 className="text-2xl font-bold font-display mb-2">{phase.title}</h2>
                          <p className="text-sm text-muted-foreground">{phase.description}</p>
                        </div>
                        <button
                          onClick={() => setExpandedPhase(null)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Phase Progress */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Phase Progress</span>
                          <span className="font-semibold text-cyan-400">{phase.progress}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-400 to-amber-400 transition-all duration-500"
                            style={{ width: `${phase.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Phase Details */}
                    <Card className="bg-white/5 border-white/10 backdrop-blur-md p-6">
                      <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">
                        Overview
                      </h3>
                      <p className="text-sm leading-relaxed text-foreground/80">{phase.details}</p>
                    </Card>

                    {/* Tasks */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                        Tasks ({phase.tasks.filter(t => t.completed).length}/{phase.tasks.length})
                      </h3>
                      <div className="space-y-2">
                        {phase.tasks.map(task => (
                          <button
                            key={task.id}
                            onClick={() => toggleTask(phase.id, task.id)}
                            className="w-full text-left p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-400/50 transition-all duration-300 group flex items-center gap-3"
                          >
                            <div
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                task.completed
                                  ? 'bg-green-400/20 border-green-400'
                                  : 'border-white/30 group-hover:border-cyan-400'
                              }`}
                            >
                              {task.completed && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                            </div>
                            <span
                              className={`text-sm transition-all ${
                                task.completed ? 'text-muted-foreground line-through' : 'text-foreground'
                              }`}
                            >
                              {task.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white border-0">
                      View Documentation <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                );
              })
            ) : (
              // Grid View of All Phases
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Click on a phase to view details and manage tasks</p>
                <div className="grid gap-4">
                  {phaseList.map((phase) => (
                    <button
                      key={phase.id}
                      onClick={() => setExpandedPhase(phase.id)}
                      className="text-left p-6 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 hover:border-cyan-400/50 hover:from-white/15 hover:to-white/10 transition-all duration-300 group backdrop-blur-md"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm font-semibold text-cyan-400">Phase {phase.id}</span>
                            {phase.status === 'completed' && (
                              <span className="text-xs px-2 py-1 bg-green-400/20 text-green-400 rounded-full">
                                Completed
                              </span>
                            )}
                            {phase.status === 'in-progress' && (
                              <span className="text-xs px-2 py-1 bg-cyan-400/20 text-cyan-400 rounded-full">
                                In Progress
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-bold font-display group-hover:text-cyan-400 transition-colors">
                            {phase.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">{phase.description}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-cyan-400 transition-colors mt-1 flex-shrink-0" />
                      </div>

                      {/* Mini Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            {phase.tasks.filter(t => t.completed).length}/{phase.tasks.length} tasks
                          </span>
                          <span className="text-cyan-400 font-semibold">{phase.progress}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-400 to-amber-400 transition-all duration-500"
                            style={{ width: `${phase.progress}%` }}
                          />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-white/10 backdrop-blur-md bg-white/5 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider">About</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                A comprehensive project tracker for the Cafe Finder web application development.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#" className="text-muted-foreground hover:text-cyan-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-cyan-400 transition-colors">GitHub Repository</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-cyan-400 transition-colors">API Reference</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider">Status</h4>
              <p className="text-xs text-muted-foreground">
                <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                All systems operational
              </p>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-xs text-muted-foreground">
            <p>© 2026 Cafe Finder Project. Built with React, Node.js, and MongoDB.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
