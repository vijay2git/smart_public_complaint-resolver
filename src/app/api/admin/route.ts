import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

// PATCH: Update complaint status
export async function PATCH(request: Request) {
  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        message: 'Status update simulated - Supabase not configured (demo mode)',
      });
    }

    const body = await request.json();
    const { complaintId, status, adminId, notes } = body;

    if (!complaintId || !status || !adminId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get current complaint
    const { data: currentComplaint, error: fetchError } = await supabaseAdmin!
      .from('complaints')
      .select('status')
      .eq('id', complaintId)
      .single();

    if (fetchError || !currentComplaint) {
      return NextResponse.json(
        { success: false, error: 'Complaint not found' },
        { status: 404 }
      );
    }

    // Update complaint status
    const updateData: any = { status };
    
    if (status === 'resolved') {
      updateData.resolved_at = new Date().toISOString();
    } else if (status === 'escalated') {
      updateData.escalated_at = new Date().toISOString();
    }

    const { error: updateError } = await supabaseAdmin!
      .from('complaints')
      .update(updateData)
      .eq('id', complaintId);

    if (updateError) {
      throw updateError;
    }

    // Create status history entry
    await supabaseAdmin!
      .from('status_history')
      .insert({
        complaint_id: complaintId,
        old_status: currentComplaint.status,
        new_status: status,
        changed_by: adminId,
        notes: notes || `Status changed to ${status}`,
      });

    // Create notification for the user
    const { data: complaint } = await supabaseAdmin!
      .from('complaints')
      .select('user_id, title')
      .eq('id', complaintId)
      .single();

    if (complaint) {
      await supabaseAdmin!
        .from('notifications')
        .insert({
          complaint_id: complaintId,
          user_id: complaint.user_id,
          type: 'email',
          status: 'pending',
          content: `Your complaint "${complaint.title}" has been updated to ${status}.`,
        });
    }

    return NextResponse.json({
      success: true,
      message: 'Complaint status updated successfully',
    });
  } catch (error) {
    console.error('Update status error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update complaint status' },
      { status: 500 }
    );
  }
}

// GET: Get complaint statistics
export async function GET() {
  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        data: {
          total: 0,
          pending: 0,
          inProgress: 0,
          escalated: 0,
          resolved: 0,
          highPriority: 0,
          avgResolutionTime: 0,
          configured: false,
        },
        message: 'Statistics not available - Supabase not configured (demo mode)',
      });
    }

    const { data: complaints, error } = await supabaseAdmin!
      .from('complaints')
      .select('status, priority_score, created_at, resolved_at');

    if (error) throw error;

    const stats = {
      total: complaints?.length || 0,
      pending: complaints?.filter(c => c.status === 'pending').length || 0,
      inProgress: complaints?.filter(c => c.status === 'in_progress').length || 0,
      escalated: complaints?.filter(c => c.status === 'escalated').length || 0,
      resolved: complaints?.filter(c => c.status === 'resolved' || c.status === 'closed').length || 0,
      highPriority: complaints?.filter(c => c.priority_score >= 80).length || 0,
      avgResolutionTime: calculateAverageResolutionTime(complaints || []),
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}

function calculateAverageResolutionTime(complaints: any[]): number {
  const resolvedComplaints = complaints.filter(c => c.resolved_at && c.created_at);
  
  if (resolvedComplaints.length === 0) return 0;

  const totalTime = resolvedComplaints.reduce((acc, c) => {
    const created = new Date(c.created_at).getTime();
    const resolved = new Date(c.resolved_at).getTime();
    return acc + (resolved - created);
  }, 0);

  // Return in hours
  return Math.round(totalTime / resolvedComplaints.length / (1000 * 60 * 60));
}
