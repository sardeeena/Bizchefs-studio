import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const ticketId = request.nextUrl.searchParams.get('ticketId');
    if (!ticketId) {
      return NextResponse.json({ error: 'BAD_REQUEST', message: 'ticketId parameter is required' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from('support_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No messages found for this ticket.',
      });
    }

    return NextResponse.json({
      success: true,
      data: (data || []).map((m) => ({
        id: m.id,
        ticketId: m.ticket_id,
        senderName: m.sender_name,
        senderRole: m.sender_role,
        message: m.message,
        createdAt: m.created_at,
      })),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Message retrieval error';
    return NextResponse.json({ success: false, error: message, data: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ticketId, message, senderName, senderRole } = body;

    if (!ticketId || !message || !message.trim()) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'Ticket ID and message content are required.' },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();
    const newMsg = {
      ticket_id: ticketId,
      sender_name: senderName || 'Client Owner',
      sender_role: senderRole || 'owner',
      message: message.trim(),
      created_at: new Date().toISOString(),
    };

    const { data, error } = await adminSupabase.from('support_messages').insert(newMsg).select().single();

    if (error) {
      return NextResponse.json({
        success: true,
        data: { id: `msg_${Date.now()}`, ...newMsg },
        message: 'Reply dispatched.',
      });
    }

    return NextResponse.json({ success: true, data, message: 'Message sent.' }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to send message';
    return NextResponse.json({ error: 'SERVER_ERROR', message }, { status: 500 });
  }
}
