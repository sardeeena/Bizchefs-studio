'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { DEMO_PROJECT_MILESTONES, DEMO_TASKS } from '@/lib/data/mock-db';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  Calendar,
  Layers,
  ArrowUpRight,
  Plus,
  CheckSquare,
  Square,
  AlertTriangle,
  User,
} from 'lucide-react';
import { TaskItem } from '@/types';
import { formatDate } from '@/lib/utils';

export default function ProjectsPage() {
  const { currentClient, currentUser } = useApp();
  const [tasks, setTasks] = useState<TaskItem[]>(DEMO_TASKS);
  const [taskFilter, setTaskFilter] = useState<'all' | 'todo' | 'in_progress' | 'completed'>('all');
  const [activeTab, setActiveTab] = useState<'milestones' | 'tasks'>('tasks');
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  // New task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');

  const milestones = DEMO_PROJECT_MILESTONES.filter(
    (m) => m.clientId === (currentClient?.id || 'client_kemet')
  );

  const clientTasks = tasks.filter(
    (t) => t.clientId === (currentClient?.id || 'client_kemet')
  );

  const filteredTasks = clientTasks.filter((t) =>
    taskFilter === 'all' ? true : t.status === taskFilter
  );

  const isOwner = currentUser.role === 'owner';

  const handleToggleTaskStatus = (taskId: string) => {
    if (isOwner) {
      alert('Read-Only Access: Client owners cannot modify sprint task deliverables. Please contact your engineering lead via Support Tickets.');
      return;
    }
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const nextStatus: 'todo' | 'in_progress' | 'completed' =
          t.status === 'todo' ? 'in_progress' : t.status === 'in_progress' ? 'completed' : 'todo';
        return { ...t, status: nextStatus };
      })
    );
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (isOwner) return;
    if (!taskTitle.trim()) return;

    const newTask: TaskItem = {
      id: `task_${Date.now()}`,
      clientId: currentClient?.id || 'client_kemet',
      title: taskTitle.trim(),
      description: taskDesc.trim(),
      status: 'todo',
      priority: taskPriority,
      assigneeName: currentUser.name,
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    setTasks((prev) => [newTask, ...prev]);
    setTaskTitle('');
    setTaskDesc('');
    setTaskModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-[#D39E36] tracking-wider uppercase">
              DELIVERABLES & ROADMAP · {currentUser.role.toUpperCase()}
            </span>
            {isOwner && (
              <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                CLIENT VIEW-ONLY
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Projects & Task Delivery
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Active sprints, engineering deliverables, and task progress for{' '}
            <span className="font-semibold text-neutral-900 dark:text-neutral-200">
              {currentClient?.name}
            </span>
            .
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isOwner ? (
            <button
              type="button"
              onClick={() => setTaskModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          ) : (
            <div className="text-xs text-neutral-500 font-medium px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
              Sprint Roadmap (Client View)
            </div>
          )}
        </div>
      </div>

      {/* Tabs Switcher: Tasks vs Milestones */}
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('tasks')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'tasks'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            Sprint Tasks ({clientTasks.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('milestones')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'milestones'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            Strategic Roadmap ({milestones.length})
          </button>
        </div>

        {activeTab === 'tasks' && (
          <div className="flex items-center gap-1 text-xs">
            {(['all', 'todo', 'in_progress', 'completed'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setTaskFilter(filter)}
                className={`px-2 py-1 rounded text-[11px] font-medium capitalize transition-colors ${
                  taskFilter === filter
                    ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {filter.replace('_', ' ')}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tasks View */}
      {activeTab === 'tasks' && (
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800">
              <CheckSquare className="w-10 h-10 text-neutral-400 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                No tasks in this category
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Create a new sprint task using the button above.
              </p>
            </div>
          ) : (
            filteredTasks.map((t) => (
              <div
                key={t.id}
                className="p-4 rounded-xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 flex items-start justify-between gap-3 text-xs transition-colors hover:border-neutral-300 dark:hover:border-neutral-700"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => handleToggleTaskStatus(t.id)}
                    className="mt-0.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                    title={`Click to cycle status (current: ${t.status})`}
                  >
                    {t.status === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : t.status === 'in_progress' ? (
                      <Clock className="w-4 h-4 text-blue-500" />
                    ) : (
                      <Square className="w-4 h-4 text-neutral-400" />
                    )}
                  </button>

                  <div className="space-y-1 min-w-0">
                    <span
                      className={`font-semibold text-neutral-900 dark:text-white block ${
                        t.status === 'completed' ? 'line-through text-neutral-400 dark:text-neutral-500' : ''
                      }`}
                    >
                      {t.title}
                    </span>
                    {t.description && (
                      <p className="text-[11px] text-neutral-500 leading-relaxed">
                        {t.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-[11px] text-neutral-400 pt-1">
                      {t.assigneeName && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {t.assigneeName}
                        </span>
                      )}
                      {t.dueDate && (
                        <>
                          <span>·</span>
                          <span className="font-mono">Due {t.dueDate}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                      t.priority === 'urgent'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : t.priority === 'high'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                    }`}
                  >
                    {t.priority}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleToggleTaskStatus(t.id)}
                    className="px-2 py-1 rounded text-[10px] font-semibold border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 capitalize"
                  >
                    {t.status.replace('_', ' ')}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Milestones View */}
      {activeTab === 'milestones' && (
        <div className="space-y-4">
          {milestones.map((m) => (
            <div
              key={m.id}
              className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
                    <span>{m.serviceCategory}</span>
                    <span>·</span>
                    <span suppressHydrationWarning className="flex items-center gap-1 font-mono text-[11px]">
                      <Calendar className="w-3 h-3 text-neutral-400" />
                      Due {formatDate(m.dueDate)}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                    {m.title}
                  </h2>
                </div>

                <span
                  className={`self-start sm:self-auto px-2.5 py-0.5 rounded text-[11px] font-semibold capitalize ${
                    m.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : m.status === 'in_progress'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                  }`}
                >
                  {m.status.replace('_', ' ')}
                </span>
              </div>

              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {m.description}
              </p>

              <div className="pt-2">
                <div className="flex justify-between text-xs text-neutral-500 mb-1.5 font-medium">
                  <span>Deliverable Completion</span>
                  <span>{m.progressPercent}%</span>
                </div>
                <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-2 rounded-full ${
                      m.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${m.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Task Modal */}
      {taskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Add Sprint Task
            </h3>
            <p className="text-xs text-neutral-500">
              Create a new engineering or design task for this workspace.
            </p>

            <form onSubmit={handleCreateTask} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Verify Hostinger SSL renewal webhook"
                  className="w-full text-xs bg-neutral-50 dark:bg-[#181d27] border border-neutral-200 dark:border-neutral-700 rounded-lg p-2.5 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Description / Deliverable Criteria
                </label>
                <textarea
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="Details, steps, or acceptance checks..."
                  className="w-full text-xs bg-neutral-50 dark:bg-[#181d27] border border-neutral-200 dark:border-neutral-700 rounded-lg p-2.5 text-neutral-900 dark:text-neutral-100 h-20 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Priority
                </label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as any)}
                  className="w-full text-xs bg-neutral-50 dark:bg-[#181d27] border border-neutral-200 dark:border-neutral-700 rounded-lg p-2.5 text-neutral-900 dark:text-neutral-100"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setTaskModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
