'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
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
  Loader2,
} from 'lucide-react';
import { SupportTicket, SupportMessage } from '@/types';
import { formatDateTime } from '@/lib/utils';

export default function SupportPage() {
  const { clientTickets, currentClient, currentUser, addTicket, clientWebsites } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const selectedTicket =
    (selectedTicketId ? clientTickets.find((t) => t.id === selectedTicketId) : null) ||
    clientTickets[0] ||
    null;
  const [modalOpen, setModalOpen] = useState(false);

  // New Ticket State
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<'hosting' | 'bug' | 'feature' | 'billing'>('hosting');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [websiteId, setWebsiteId] = useState(clientWebsites[0]?.id || '');
  const [ticketSubmitting, setTicketSubmitting] = useState(false);

  // Messages state
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replySending, setReplySending] = useState(false);

  const currentTicketId = selectedTicket?.id;
  const currentTicketSubject = selectedTicket?.subject;
  const currentTicketCreatedAt = selectedTicket?.createdAt;

  useEffect(() => {
    let ignore = false;
    if (!currentTicketId) {
      return;
    }

    fetch(`/api/support/messages?ticketId=${currentTicketId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!ignore) {
          if (json?.data && json.data.length > 0) {
            setMessages(json.data);
          } else {
            setMessages([
              {
                id: `init_${currentTicketId}`,
                ticketId: currentTicketId,
                senderId: currentUser.id,
                senderName: currentUser.name,
                senderRole: currentUser.role,
                message: currentTicketSubject || '',
                createdAt: currentTicketCreatedAt || new Date().toISOString(),
              },
            ]);
          }
          setMessagesLoading(false);
        }
      })
      .catch(() => {
        if (!ignore) {
          setMessagesLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [currentTicketId, currentTicketSubject, currentTicketCreatedAt, currentUser.id, currentUser.name, currentUser.role]);

  const filteredTickets = clientTickets.filter((t) =>
    filterStatus === 'all' ? true : t.status === filterStatus
  );

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    setReplySending(true);
    const content = replyText.trim();

    try {
      const res = await fetch('/api/support/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          message: content,
          senderName: currentUser.name,
          senderRole: currentUser.role,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setMessages((prev) => [
          ...prev,
          json.data || {
            id: `msg_${Date.now()}`,
            ticketId: selectedTicket.id,
            senderName: currentUser.name,
            senderRole: currentUser.role,
            message: content,
            createdAt: new Date().toISOString(),
          },
        ]);
        setReplyText('');
      }
    } catch {
      // Local addition
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_${Date.now()}`,
          ticketId: selectedTicket.id,
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderRole: currentUser.role,
          message: content,
          createdAt: new Date().toISOString(),
        },
      ]);
      setReplyText('');
    } finally {
      setReplySending(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;

    setTicketSubmitting(true);
    await addTicket({
      clientId: currentClient?.id || 'client_bizchefs',
      websiteId: websiteId || clientWebsites[0]?.id,
      subject: subject.trim(),
      category,
      priority,
      status: 'open',
      assignedStaff: 'BizChefs Concierge Support',
    });

    setTicketSubmitting(false);
    setSubject('');
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Support Concierge & Ticketing
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Dedicated assistance for websites, hosting, SSL, and custom engineering for{' '}
            <span className="font-semibold text-neutral-900 dark:text-neutral-200">
              {currentClient?.name}
            </span>
            .
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Support Request</span>
        </button>
      </div>

      {/* Main Grid: Ticket list + Conversation thread */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket List */}
        <div className="space-y-3">
          {/* Status Filter */}
          <div className="flex items-center gap-1 p-2 rounded-xl bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 text-xs">
            {(['all', 'open', 'in_progress', 'resolved'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilterStatus(status)}
                className={`flex-1 py-1 rounded-md font-medium capitalize text-[11px] transition-colors ${
                  filterStatus === status
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-semibold'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-500 bg-white dark:bg-[#13171f] rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2">
                <LifeBuoy className="w-6 h-6 text-neutral-400 mx-auto" />
                <p className="font-semibold text-neutral-800 dark:text-neutral-200">
                  No support tickets found
                </p>
                <p className="text-[11px] text-neutral-400">
                  Use New Support Request above to contact your BizChefs concierge.
                </p>
              </div>
            ) : (
              filteredTickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedTicket?.id === t.id
                      ? 'bg-white dark:bg-[#151921] border-[#D39E36] shadow-sm'
                      : 'bg-white dark:bg-[#13171f] border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono uppercase text-neutral-400">
                      {t.category}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                        t.priority === 'urgent'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-neutral-900 dark:text-white line-clamp-2">
                    {t.subject}
                  </h4>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-800/80 text-[10px] text-neutral-400">
                    <span>{t.assignedStaff}</span>
                    <span className="capitalize text-amber-600 dark:text-[#D39E36] font-semibold">
                      {t.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Conversation Thread */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <div className="bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 rounded-2xl flex flex-col h-[580px] shadow-xs overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                    {selectedTicket.subject}
                  </h3>
                  <div className="text-[11px] text-neutral-400 mt-0.5 flex items-center gap-2">
                    <span>Assigned: {selectedTicket.assignedStaff}</span>
                    <span>·</span>
                    <span className="capitalize">{selectedTicket.category}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  {selectedTicket.status.replace('_', ' ')}
                </span>
              </div>

              {/* Messages Body */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
                {messagesLoading ? (
                  <div className="p-8 text-center text-xs text-neutral-500">
                    <Loader2 className="w-5 h-5 animate-spin text-[#D39E36] mx-auto mb-1" />
                    <span>Loading thread messages...</span>
                  </div>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={`p-3 rounded-xl border ${
                        m.senderRole === 'superadmin' || m.senderRole === 'admin'
                          ? 'bg-amber-500/5 border-[#D39E36]/30 dark:bg-amber-950/20 mr-6'
                          : 'bg-neutral-50 dark:bg-[#181d27] border-neutral-200 dark:border-neutral-800 ml-6'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                          {m.senderName}
                          <span className="text-[9px] px-1 py-0.2 rounded font-mono uppercase bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                            {m.senderRole}
                          </span>
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          {formatDateTime(m.createdAt)}
                        </span>
                      </div>
                      <p className="text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed">
                        {m.message}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Reply Box */}
              <form onSubmit={handleSendReply} className="p-3 border-t border-neutral-200 dark:border-neutral-800 flex gap-2">
                <input
                  type="text"
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type a response to BizChefs engineering..."
                  className="flex-1 bg-neutral-50 dark:bg-[#181d27] border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
                <button
                  type="submit"
                  disabled={replySending}
                  className="px-4 py-2 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 text-xs font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {replySending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Send</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-neutral-500 bg-white dark:bg-[#13171f] rounded-2xl border border-neutral-200 dark:border-neutral-800">
              Select a ticket to view the conversation thread.
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#13171f] border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <LifeBuoy className="w-4 h-4 text-[#D39E36]" />
                <span>Submit Support Request</span>
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Hostinger edge SSL renewal request"
                  className="w-full bg-neutral-50 dark:bg-[#181d27] border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-neutral-50 dark:bg-[#181d27] border border-neutral-200 dark:border-neutral-700 rounded-lg px-2.5 py-2 text-neutral-900 dark:text-neutral-100"
                  >
                    <option value="hosting">Hosting & Infrastructure</option>
                    <option value="bug">Bug / Defect</option>
                    <option value="feature">Custom Engineering</option>
                    <option value="billing">Care Retainer</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-neutral-50 dark:bg-[#181d27] border border-neutral-200 dark:border-neutral-700 rounded-lg px-2.5 py-2 text-neutral-900 dark:text-neutral-100"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={ticketSubmitting}
                  className="px-4 py-2 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-semibold disabled:opacity-50 flex items-center gap-1.5"
                >
                  {ticketSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Submit Ticket</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
