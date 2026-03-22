import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

// POST: Check and escalate complaints that have exceeded SLA
export async function POST(request: Request) {
  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        data: {
          escalated: 0,
          updated: 0,
          message: 'SLA check skipped - Supabase not configured (demo mode)',
        },
      });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'check_sla') {
      return await checkSLACompliance();
    } else if (action === 'recalculate_priorities') {
      return await recalculatePriorities();
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('SLA check error:', error);
    return NextResponse.json(
      { success: false, error: 'SLA check failed' },
      { status: 500 }
    );
  }
}

// Check SLA compliance and escalate if needed
async function checkSLACompliance() {
  try {
    // Get SLA hours from environment (default 24 hours)
    const slaHours = parseInt(process.env.SLA_HOURS || '24');
    const slaThreshold = new Date(Date.now() - slaHours * 60 * 60 * 1000);

    // Find pending complaints older than SLA threshold
    const { data: overdueComplaints, error } = await supabaseAdmin!
      .from('complaints')
      .select(`
        id,
        title,
        status,
        created_at,
        priority_score,
        user_id
      `)
      .eq('status', 'pending')
      .lt('created_at', slaThreshold.toISOString());

    if (error) throw error;

    if (!overdueComplaints || overdueComplaints.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          escalated: 0,
          message: 'No complaints require escalation',
        },
      });
    }

    // Escalate overdue complaints
    const escalatedIds: string[] = [];

    for (const complaint of overdueComplaints) {
      // Update status to escalated
      await supabaseAdmin!
        .from('complaints')
        .update({
          status: 'escalated',
          escalated_at: new Date().toISOString(),
        })
        .eq('id', complaint.id);

      // Create status history entry
      await supabaseAdmin!
        .from('status_history')
        .insert({
          complaint_id: complaint.id,
          old_status: 'pending',
          new_status: 'escalated',
          changed_by: 'system',
          notes: `Auto-escalated: Exceeded ${slaHours}h SLA threshold`,
        });

      // Create notification for the user
      await supabaseAdmin!
        .from('notifications')
        .insert({
          complaint_id: complaint.id,
          user_id: complaint.user_id,
          type: 'email',
          status: 'pending',
          content: `Your complaint "${complaint.title}" has been escalated due to delayed response time. Our team is now prioritizing this issue.`,
        });

      escalatedIds.push(complaint.id);
    }

    return NextResponse.json({
      success: true,
      data: {
        escalated: escalatedIds.length,
        escalatedIds,
        message: `${escalatedIds.length} complaint(s) escalated`,
      },
    });
  } catch (error) {
    console.error('SLA escalation error:', error);
    throw error;
  }
}

// Recalculate priority scores based on current time
async function recalculatePriorities() {
  try {
    // Get all active complaints
    const { data: complaints, error } = await supabaseAdmin!
      .from('complaints')
      .select('id, ai_severity_score, created_at, category, status')
      .in('status', ['pending', 'in_progress']);

    if (error) throw error;

    if (!complaints || complaints.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          updated: 0,
          message: 'No complaints to update',
        },
      });
    }

    const categoryMultipliers: Record<string, number> = {
      pothole: 1.2,
      water_leak: 1.3,
      streetlight: 1.1,
      trash: 1.0,
      noise: 0.9,
      parking: 0.8,
      sidewalk: 1.1,
      graffiti: 0.7,
      other: 1.0,
    };

    const updatedIds: string[] = [];

    for (const complaint of complaints) {
      const hoursPending = (Date.now() - new Date(complaint.created_at).getTime()) / (1000 * 60 * 60);
      const categoryMultiplier = categoryMultipliers[complaint.category] || 1.0;
      
      // Calculate new priority score
      const severityWeight = 0.5;
      const timeWeight = 0.3;
      const categoryWeight = 0.15;
      const duplicateWeight = 0.05;

      const timeFactor = Math.min(hoursPending / 72, 1);
      
      const score = (
        (complaint.ai_severity_score * severityWeight) +
        (timeFactor * timeWeight) +
        (categoryMultiplier * categoryWeight) +
        (duplicateWeight)
      );

      const priorityScore = Math.round(Math.min(Math.max(score * 100, 0), 100));

      // Update priority score
      await supabaseAdmin!
        .from('complaints')
        .update({ priority_score: priorityScore })
        .eq('id', complaint.id);

      updatedIds.push(complaint.id);
    }

    return NextResponse.json({
      success: true,
      data: {
        updated: updatedIds.length,
        updatedIds,
        message: `Updated priority scores for ${updatedIds.length} complaint(s)`,
      },
    });
  } catch (error) {
    console.error('Priority recalculation error:', error);
    throw error;
  }
}

// GET: Get SLA configuration
export async function GET() {
  try {
    const slaHours = parseInt(process.env.SLA_HOURS || '24');
    
    return NextResponse.json({
      success: true,
      data: {
        slaHours,
        nextCheck: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // Next hour
        configured: isSupabaseConfigured(),
      },
    });
  } catch (error) {
    console.error('SLA config error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get SLA configuration' },
      { status: 500 }
    );
  }
}
