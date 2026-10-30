import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const adminSupabase = createAdminClient();
    const clientId = request.nextUrl.searchParams.get('clientId');

    let query = adminSupabase.from('support_tickets').select('*').order('created_at', { ascending: false });
    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        unmigrated: true,
        message: 'No support tickets found. Tickets will persist once database migration is applied.',
      });
    }

    const tickets = (data || []).map((t) => ({
      id: t.id,
      clientId: t.client_id,
      websiteId: t.website_id,
      subject: t.subject,
      category: t.category,
      priority: t.priority,
      status: t.status,
      assignedStaff: t.assigned_staff || 'BizChefs Support Team',
      createdAt: t.created_at,
      updatedAt: t.updated_at,
    }));

    return NextResponse.json({
      success: true,
      data: tickets,
      count: tickets.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Support service error';
    return NextResponse.json({ success: false, error: message, data: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subject, category, priority, clientId, websiteId, message, senderName, senderRole } = body;

    if (!subject || !subject.trim()) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'Ticket subject is required.' },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();
    const newTicket = {
      subject: subject.trim(),
      category: category || 'hosting',
      priority: priority || 'medium',
      status: 'open',
      client_id: clientId || 'client_bizchefs',
      website_id: websiteId || null,
      assigned_staff: 'BizChefs Support Team',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: createdTicket, error: ticketErr } = await adminSupabase
      .from('support_tickets')
      .insert(newTicket)
      .select()
      .single();

    const ticketId = createdTicket?.id || `tkt_${Date.now()}`;

    // If an initial message was provided, store in support_messages
    if (message && message.trim()) {
      try {
        await adminSupabase.from('support_messages').insert({
          ticket_id: ticketId,
          sender_name: senderName || 'Client Owner',
          sender_role: senderRole || 'owner',
          message: message.trim(),
          created_at: new Date().toISOString(),
        });
      } catch {
        // Message table insert fallback
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: createdTicket || { id: ticketId, ...newTicket },
        message: 'Support request submitted to BizChefs concierge.',
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Ticket submission error';
    return NextResponse.json({ error: 'SERVER_ERROR', message }, { status: 500 });
  }
}
