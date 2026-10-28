'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { canAccessWebsite } from '@/lib/auth/session';
import { DEMO_WEBSITES, DEMO_VIRTUAL_FILES } from '@/lib/data/mock-db';
import { validateSafeFilePath, validateFileContent } from '@/lib/services/file-manager';
import {
  ArrowLeft,
  FileCode,
  Folder,
  FolderOpen,
  Save,
  ShieldCheck,
  ShieldAlert,
  Lock,
  CheckCircle2,
  AlertTriangle,
  History,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { VirtualFileNode } from '@/types';

export default function WebsiteFilesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const websiteId = resolvedParams.id;
  const { currentUser } = useApp();

  const website = DEMO_WEBSITES.find((w) => w.id === websiteId);
  const hasAccess = canAccessWebsite(currentUser, websiteId);

  // Files state
  const initialFiles = DEMO_VIRTUAL_FILES[websiteId] || DEMO_VIRTUAL_FILES['web_kemet_main'];
  const [selectedFile, setSelectedFile] = useState<VirtualFileNode>(() => {
    // default to page.tsx
    const appDir = initialFiles.find((f) => f.name === 'app');
    return appDir?.children?.[0] || initialFiles[0];
  });

  const [editorContent, setEditorContent] = useState<string>(selectedFile?.content || '');
  const [saveStatus, setSaveStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  // Security Simulator input
  const [testPath, setTestPath] = useState('../../etc/passwd');
  const [testResult, setTestResult] = useState<{ valid: boolean; error?: string } | null>(null);

  if (!website || !hasAccess) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center rounded-2xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 shadow-xl my-12">
        <Lock className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
          Access Denied
        </h2>
        <p className="text-xs text-neutral-500 mt-2 mb-6">
          You are not authorized to view or edit files for this website.
        </p>
        <Link
          href="/websites"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Websites</span>
        </Link>
      </div>
    );
  }

  const handleSelectFile = (file: VirtualFileNode) => {
    if (file.type === 'directory') return;
    const validation = validateSafeFilePath(file.path);
    if (!validation.valid) {
      setSaveStatus({ success: false, message: validation.error });
      return;
    }
    setSelectedFile(file);
    setEditorContent(file.content || '');
    setSaveStatus(null);
  };

  const handleSaveFile = () => {
    // 1. Path validation
    const pathCheck = validateSafeFilePath(selectedFile.path);
    if (!pathCheck.valid) {
      setSaveStatus({ success: false, message: pathCheck.error });
      return;
    }

    // 2. Content size validation
    const contentCheck = validateFileContent(editorContent);
    if (!contentCheck.valid) {
      setSaveStatus({ success: false, message: contentCheck.error });
      return;
    }

    // 3. Save simulation
    setSaveStatus({
      success: true,
      message: `Changes saved to ${selectedFile.path}. Audit log recorded for ${currentUser.name}.`,
    });
  };

  const runSecurityTest = () => {
    const result = validateSafeFilePath(testPath);
    setTestResult(result);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href={`/websites/${website.id}`}
          className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to {website.name}</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-neutral-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Path Traversal Shield Active
          </span>
        </div>
      </div>

      {/* Security Architecture Notice */}
      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-900 dark:text-blue-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0 text-blue-500" />
          <span>
            <strong>Safe Code Sandbox</strong>: File modifications are restricted to verified project files with strict extension allowlists. Production deployments use Git pipelines.
          </span>
        </div>
        <span className="font-mono text-[11px] text-neutral-500 shrink-0">
          Max File Size: 500 KB
        </span>
      </div>

      {/* File Explorer & Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left Column: File Tree */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800">
          <div className="text-xs font-semibold text-neutral-900 dark:text-white pb-3 mb-2 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-1.5">
            <FolderOpen className="w-4 h-4 text-[#D39E36]" />
            <span>Project Files</span>
          </div>

          <div className="space-y-1 text-xs">
            {initialFiles.map((item) => (
              <div key={item.id} className="space-y-1">
                {item.type === 'directory' ? (
                  <div>
                    <div className="flex items-center gap-1.5 py-1 px-2 font-medium text-neutral-700 dark:text-neutral-300">
                      <Folder className="w-3.5 h-3.5 text-amber-500" />
                      <span>{item.name}</span>
                    </div>

                    <div className="pl-4 space-y-1">
                      {item.children?.map((child) => (
                        <button
                          key={child.id}
                          type="button"
                          onClick={() => handleSelectFile(child)}
                          className={`w-full text-left flex items-center gap-1.5 py-1 px-2 rounded-md transition-colors ${
                            selectedFile.id === child.id
                              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-semibold'
                              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                          }`}
                        >
                          <FileCode className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{child.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSelectFile(item)}
                    className={`w-full text-left flex items-center gap-1.5 py-1 px-2 rounded-md transition-colors ${
                      selectedFile.id === item.id
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-semibold'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Interactive Path Traversal Guard Tester */}
          <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-2">
              Path Traversal Guard Check
            </span>
            <div className="space-y-2">
              <input
                type="text"
                value={testPath}
                onChange={(e) => setTestPath(e.target.value)}
                placeholder="Path attack string"
                className="w-full text-[11px] font-mono bg-neutral-50 dark:bg-[#181d27] border border-neutral-200 dark:border-neutral-700 rounded-md p-1.5 text-neutral-900 dark:text-neutral-100"
              />
              <button
                type="button"
                onClick={runSecurityTest}
                className="w-full py-1 text-[11px] font-medium rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200"
              >
                Test Path Traversal Defense
              </button>

              {testResult && (
                <div
                  className={`p-2 rounded text-[10px] leading-tight ${
                    testResult.valid
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                  }`}
                >
                  {testResult.valid
                    ? 'Path valid & within boundary'
                    : `BLOCKED: ${testResult.error}`}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 3 Columns: Code Editor */}
        <div className="lg:col-span-3 rounded-xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden">
          {/* Editor Header */}
          <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3 bg-neutral-50/60 dark:bg-[#151921]">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                {selectedFile.path}
              </span>
              <span className="text-[10px] font-mono text-neutral-400">
                ({selectedFile.sizeBytes || 4000} bytes)
              </span>
            </div>

            <button
              type="button"
              onClick={handleSaveFile}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>

          {/* Feedback banner */}
          {saveStatus && (
            <div
              className={`px-4 py-2 text-xs flex items-center gap-2 ${
                saveStatus.success
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border-b border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-200 border-b border-rose-200 dark:border-rose-800'
              }`}
            >
              {saveStatus.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
              )}
              <span>{saveStatus.message}</span>
            </div>
          )}

          {/* Code Textarea */}
          <div className="flex-1 min-h-[420px] p-4 bg-[#f8fafc] dark:bg-[#0c0e12] font-mono text-xs leading-relaxed">
            <textarea
              value={editorContent}
              onChange={(e) => setEditorContent(e.target.value)}
              spellCheck={false}
              className="w-full h-full min-h-[400px] bg-transparent text-neutral-900 dark:text-neutral-100 focus:outline-none resize-none font-mono text-xs leading-relaxed"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
