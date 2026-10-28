'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { DEMO_TICKET_MESSAGES } from '@/lib/data/mock-db';
import {
  LifeBuoy,
  Plus,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Shield,
  MessageSquare,
} from 'lucide-react';
import { SupportTicket, SupportMessage } from '@/types';

export default function SupportPage() {
  const { clientTickets, currentClient, currentUser, addTicket, clientWebsites } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    clientTickets[0] || null
  );
  const [modalOpen, setModalOpen] = useState(false);

  // New Ticket State
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<'hosting' | 'bug' | 'feature' | 'billing'>('hosting');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [websiteId, setWebsiteId] = useState(clientWebsites[0]?.id || '');

  // Messages state
  const [messagesMap, setMessagesMap] = useState<Record<string, SupportMessage[]>>(
    DEMO_TICKET_MESSAGES
  );
  const [replyText, setReplyText] = useState('');

  const filteredTickets = clientTickets.filter((t) =>
    filterStatus === 'all' ? true : t.status === filterStatus
  );

  const currentMessages = selectedTicket
    ? messagesMap[selectedTicket.id] || [
        {
          id: 'initial_msg',
          ticketId: selectedTicket.id,
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderRole: currentUser.role,
          message: selectedTicket.subject,
          createdAt: selectedTicket.createdAt,
        },
      ]
    : [];

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    const newMsg: SupportMessage = {
      id: `msg_${Date.now()}`,
      ticketId: selectedTicket.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      message: replyText.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessagesMap((prev) => ({
      ...prev,
      [selectedTicket.id]: [...(prev[selectedTicket.id] || []), newMsg],
    }));

    setReplyText('');
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;

    addTicket({
      clientId: currentClient?.id || 'client_kemet',
      websiteId,
      subject: subject.trim(),
      category,
      priority,
      status: 'open',
      assignedStaff: 'BizChefs Lead Engineer',
    });

    setSubject('');
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Support & Concierge
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Direct communication channel with BizChefs engineering and infrastructure specialists.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Support Request</span>
        </button>
      </div>

      {/* Main Support Grid: Ticket List + Message Thread */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[500px]">
        {/* Left Column: Tickets List */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 flex flex-col">
          {/* Status Filter */}
          <div className="flex items-center gap-1 pb-3 mb-3 border-b border-neutral-100 dark:border-neutral-800 overflow-x-auto text-xs">
            {['all', 'open', 'in_progress', 'resolved'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`px-2 py-1 rounded-md text-[11px] font-medium capitalize transition-colors whitespace-nowrap ${
                  filterStatus === st
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto">
            {filteredTickets.length === 0 ? (
              <p className="text-xs text-neutral-500 text-center py-8">No tickets match this filter.</p>
            ) : (
              filteredTickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedTicket?.id === t.id
                      ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-50 dark:bg-[#1a202c] shadow-xs'
                      : 'border-neutral-100 dark:border-neutral-800/80 hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40'
                  }`}
                >
                  <div className="font-semibold text-neutral-900 dark:text-white leading-snug line-clamp-2">
                    {t.subject}
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-2 text-[11px] text-neutral-500">
                    <span className="capitalize">{t.category}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-semibold capitalize ${
                        t.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : t.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {t.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 2 Columns: Conversation Thread */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 flex flex-col justify-between">
          {selectedTicket ? (
            <>
              {/* Ticket Title & Metadata */}
              <div className="pb-4 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                    {selectedTicket.id}
                  </span>
                  <span className="text-xs text-neutral-500">
                    Assigned: {selectedTicket.assignedStaff || 'BizChefs Staff'}
                  </span>
                </div>
                <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                  {selectedTicket.subject}
                </h2>
              </div>

              {/* Messages Stream */}
              <div className="flex-1 py-4 space-y-3 overflow-y-auto max-h-[360px]">
                {currentMessages.map((msg) => {
                  const isStaff =
                    msg.senderRole === 'superadmin' ||
                    msg.senderRole === 'admin' ||
                    msg.senderRole === 'tech';
                  return (
                    <div
                      key={msg.id}
                      className={`p-3.5 rounded-xl text-xs space-y-1.5 ${
                        isStaff
                          ? 'bg-neutral-100 dark:bg-[#1a202c] border border-neutral-200 dark:border-neutral-700 ml-4'
                          : 'bg-neutral-50 dark:bg-[#151921] border border-neutral-100 dark:border-neutral-800 mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                          {isStaff ? (
                            <Shield className="w-3.5 h-3.5 text-[#D39E36]" />
                          ) : (
                            <User className="w-3.5 h-3.5 text-neutral-400" />
                          )}
                          {msg.senderName} {isStaff && <span className="text-[10px] text-[#D39E36]">(BizChefs Lead)</span>}
                        </span>
                        <span className="text-neutral-400">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                        {msg.message}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Reply Box */}
              <form onSubmit={handleSendReply} className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your response to the BizChefs team..."
                  className="flex-1 text-xs bg-neutral-50 dark:bg-[#181d27] border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 flex items-center gap-1.5 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Reply</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-neutral-500">
              Select a ticket to view the conversation history.
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Open Support Request
            </h3>
            <p className="text-xs text-neutral-500">
              Submit an issue or service request. BizChefs engineers are automatically notified.
            </p>

            <form onSubmit={handleCreateTicket} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Inquire about custom Redis cache setup on Hostinger"
                  className="w-full text-xs bg-neutral-50 dark:bg-[#181d27] border border-neutral-200 dark:border-neutral-700 rounded-lg p-2.5 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full text-xs bg-neutral-50 dark:bg-[#181d27] border border-neutral-200 dark:border-neutral-700 rounded-lg p-2.5 text-neutral-900 dark:text-neutral-100"
                  >
                    <option value="hosting">Hosting & Infrastructure</option>
                    <option value="bug">Software Bug</option>
                    <option value="feature">Feature Request</option>
                    <option value="billing">Billing & Scope</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full text-xs bg-neutral-50 dark:bg-[#181d27] border border-neutral-200 dark:border-neutral-700 rounded-lg p-2.5 text-neutral-900 dark:text-neutral-100"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent (SLA)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
