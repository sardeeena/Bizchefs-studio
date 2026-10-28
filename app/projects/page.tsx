'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { DEMO_PROJECT_MILESTONES } from '@/lib/data/mock-db';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  Calendar,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

export default function ProjectsPage() {
  const { currentClient } = useApp();

  const milestones = DEMO_PROJECT_MILESTONES.filter(
    (m) => m.clientId === (currentClient?.id || 'client_kemet')
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Projects & Strategic Roadmap
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
          Active digital initiatives, design sprints, and engineering milestones for{' '}
          <span className="font-semibold text-neutral-900 dark:text-neutral-200">
            {currentClient?.name}
          </span>
          .
        </p>
      </div>

      {/* Milestones List */}
      <div className="space-y-4">
        {milestones.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800">
            <FolderKanban className="w-10 h-10 text-neutral-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
              No milestones active
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              Your next project sprint will appear here once defined.
            </p>
          </div>
        ) : (
          milestones.map((m) => (
            <div
              key={m.id}
              className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
                    <span>{m.serviceCategory}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Calendar className="w-3 h-3 text-neutral-400" />
                      Due {new Date(m.dueDate).toLocaleDateString()}
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

              {/* Progress Bar */}
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
          ))
        )}
      </div>
    </div>
  );
}
