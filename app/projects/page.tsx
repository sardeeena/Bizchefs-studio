'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
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
  Loader2,
} from 'lucide-react';
import { TaskItem } from '@/types';
import { formatDate } from '@/lib/utils';

export default function ProjectsPage() {
  const { currentClient, currentUser } = useApp();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskFilter, setTaskFilter] = useState<'all' | 'todo' | 'in_progress' | 'completed'>('all');
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [permissionNotice, setPermissionNotice] = useState<string | null>(null);

  // New task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let ignore = false;
    const clientId = currentClient?.id || 'client_bizchefs';

    fetch(`/api/tasks?clientId=${clientId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!ignore) {
          if (json?.data) {
            setTasks(json.data);
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [currentClient?.id]);

  const filteredTasks = tasks.filter((t) =>
    taskFilter === 'all' ? true : t.status === taskFilter
  );

  const isOwner = currentUser.role === 'owner';

  const handleToggleTaskStatus = async (taskId: string) => {
    setPermissionNotice(null);
    if (isOwner) {
      setPermissionNotice(
        'Read-Only Access: Client owners cannot modify sprint deliverables directly. Please open a ticket via Support.'
      );
      setTimeout(() => setPermissionNotice(null), 4000);
      return;
    }

    const currentTask = tasks.find((t) => t.id === taskId);
    if (!currentTask) return;

    const nextStatus: 'todo' | 'in_progress' | 'completed' =
      currentTask.status === 'todo'
        ? 'in_progress'
        : currentTask.status === 'in_progress'
        ? 'completed'
        : 'todo';

    try {
      await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status: nextStatus }),
      });

      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t))
      );
    } catch {
      // Ignore
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskTitle.trim(),
          description: taskDesc.trim() || undefined,
          priority: taskPriority,
          clientId: currentClient?.id || 'client_bizchefs',
          dueDate: taskDueDate || undefined,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setTasks((prev) => [json.data, ...prev]);
        }
        setTaskModalOpen(false);
        setTaskTitle('');
        setTaskDesc('');
        setTaskDueDate('');
      }
    } catch {
      // Handle error
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Engineering Sprints & Deliverables
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Active technical roadmap, tasks, and deliverables managed for{' '}
            <span className="font-semibold text-neutral-900 dark:text-neutral-200">
              {currentClient?.name}
            </span>
            .
          </p>
        </div>

        {!isOwner && (
          <button
            type="button"
            onClick={() => setTaskModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shrink-0 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Deliverable</span>
          </button>
        )}
      </div>

      {permissionNotice && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-300">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
          <span>{permissionNotice}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex items-center gap-2 p-3 rounded-xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 text-xs">
        <span className="text-neutral-500 text-[11px] font-semibold uppercase mr-1">Status:</span>
        {(['all', 'todo', 'in_progress', 'completed'] as const).map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setTaskFilter(filter)}
            className={`px-3 py-1.5 rounded-lg font-medium capitalize transition-colors ${
              taskFilter === filter
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            {filter.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Tasks Table */}
      <div className="rounded-xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-neutral-500">
            <Loader2 className="w-5 h-5 animate-spin text-[#D39E36] mx-auto mb-2" />
            <span>Loading workspace deliverables...</span>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-500 space-y-2">
            <FolderKanban className="w-8 h-8 text-neutral-400 mx-auto" />
            <p className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm">
              No tasks currently registered
            </p>
            <p className="text-[11px] text-neutral-500">
              Deliverables are tracked in real time. Use Create Deliverable to add a task.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40 transition-colors"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => handleToggleTaskStatus(task.id)}
                    className="mt-0.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-colors"
                    title={isOwner ? 'Read-only view' : 'Toggle deliverable status'}
                  >
                    {task.status === 'completed' ? (
                      <CheckSquare className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <span
                      className={`text-xs font-semibold block ${
                        task.status === 'completed'
                          ? 'line-through text-neutral-400 dark:text-neutral-500'
                          : 'text-neutral-900 dark:text-white'
                      }`}
                    >
                      {task.title}
                    </span>
                    {task.description && (
                      <span className="text-[11px] text-neutral-500 mt-0.5 block line-clamp-1">
                        {task.description}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-xs">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      task.priority === 'urgent'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : task.priority === 'high'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                    }`}
                  >
                    {task.priority}
                  </span>

                  <span className="text-neutral-500 text-[11px]">
                    {task.assigneeName || 'BizChefs Lead'}
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-medium capitalize ${
                      task.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : task.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                    }`}
                  >
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {taskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-[#D39E36]" />
                <span>Create New Deliverable</span>
              </h3>
              <button
                type="button"
                onClick={() => setTaskModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Deliverable Title
                </label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Hostinger Node.js daemon restart script"
                  className="w-full bg-neutral-50 dark:bg-[#181d27] border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="Technical deliverable details..."
                  className="w-full bg-neutral-50 dark:bg-[#181d27] border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full bg-neutral-50 dark:bg-[#181d27] border border-neutral-200 dark:border-neutral-700 rounded-lg px-2.5 py-2 text-neutral-900 dark:text-neutral-100"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-[#181d27] border border-neutral-200 dark:border-neutral-700 rounded-lg px-2.5 py-2 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTaskModalOpen(false)}
                  className="px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-semibold disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Deliverable</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
