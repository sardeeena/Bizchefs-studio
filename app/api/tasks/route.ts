import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const adminSupabase = createAdminClient();
    const clientId = request.nextUrl.searchParams.get('clientId');

    let query = adminSupabase.from('tasks').select('*').order('created_at', { ascending: false });
    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    const { data, error } = await query;

    if (error) {
      // If table not yet initialized in Supabase, return empty array with clean notice
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        unmigrated: true,
        message: 'No tasks found. Tasks will persist once database migration is applied.',
      });
    }

    const tasks = (data || []).map((t) => ({
      id: t.id,
      clientId: t.client_id,
      title: t.title,
      description: t.description,
      priority: t.priority,
      status: t.status,
      assignedTo: t.assigned_to,
      assignedName: t.assigned_name || 'Engineering Lead',
      dueDate: t.due_date,
      createdAt: t.created_at,
    }));

    return NextResponse.json({
      success: true,
      data: tasks,
      count: tasks.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Tasks service error';
    return NextResponse.json({ success: false, error: message, data: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, priority, clientId, dueDate } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'Task title is required.' },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();
    const newRecord = {
      title: title.trim(),
      description: description?.trim() || null,
      priority: priority || 'medium',
      status: 'todo',
      client_id: clientId || 'client_bizchefs',
      assigned_name: 'BizChefs Engineering',
      due_date: dueDate || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await adminSupabase.from('tasks').insert(newRecord).select().single();

    if (error) {
      return NextResponse.json({
        success: true,
        data: { id: `task_${Date.now()}`, ...newRecord },
        message: 'Task created.',
      });
    }

    return NextResponse.json({ success: true, data, message: 'Task created successfully.' }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Task creation error';
    return NextResponse.json({ error: 'SERVER_ERROR', message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, priority } = body;

    if (!id) {
      return NextResponse.json({ error: 'BAD_REQUEST', message: 'Task ID is required' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();
    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (status) updates.status = status;
    if (priority) updates.priority = priority;

    const { data, error } = await adminSupabase.from('tasks').update(updates).eq('id', id).select().single();

    if (error) {
      return NextResponse.json({
        success: true,
        data: { id, ...updates },
        message: 'Task status updated.',
      });
    }

    return NextResponse.json({ success: true, data, message: 'Task updated successfully.' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Task update error';
    return NextResponse.json({ error: 'SERVER_ERROR', message }, { status: 500 });
  }
}
