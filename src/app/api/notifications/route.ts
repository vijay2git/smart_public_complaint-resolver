import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendEmail, sendSMS, processNotifications } from '@/lib/notifications';

// POST: Send notifications
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'send_email':
        const emailResult = await sendEmail(
          data.to,
          data.template,
          data.data
        );
        return NextResponse.json({
          success: emailResult,
          message: emailResult ? 'Email sent successfully' : 'Failed to send email',
        });

      case 'send_sms':
        const smsResult = await sendSMS(data.to, data.message);
        return NextResponse.json({
          success: smsResult,
          message: smsResult ? 'SMS sent successfully' : 'Failed to send SMS',
        });

      case 'process_queue':
        const queueResult = await processNotifications();
        return NextResponse.json({
          success: true,
          data: queueResult,
        });

      case 'notify_status_change':
        // Send both email and SMS for status changes
        const { complaintId, userId, oldStatus, newStatus, notes } = data;

        // Get user and complaint details
        const { data: user } = await supabaseAdmin
          .from('users')
          .select('email, phone, full_name')
          .eq('id', userId)
          .single();

        const { data: complaint } = await supabaseAdmin
          .from('complaints')
          .select('title, category')
          .eq('id', complaintId)
          .single();

        if (!user || !complaint) {
          return NextResponse.json(
            { success: false, error: 'User or complaint not found' },
            { status: 404 }
          );
        }

        // Send email notification
        let emailSent = false;
        if (user.email) {
          emailSent = await sendEmail(user.email, 'statusUpdate', {
            complaintId,
            title: complaint.title,
            oldStatus,
            newStatus,
            notes,
          });
        }

        // Send SMS notification if phone number exists
        let smsSent = false;
        if (user.phone) {
          const smsMessage = `Complaint "${complaint.title}" status updated to ${newStatus.replace('_', ' ')}. ` +
            `Track at: ${process.env.NEXT_PUBLIC_APP_URL}/complaint/track?id=${complaintId}`;
          smsSent = await sendSMS(user.phone, smsMessage);
        }

        // Update notification records
        await supabaseAdmin
          .from('notifications')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
          })
          .eq('complaint_id', complaintId)
          .eq('user_id', userId)
          .eq('status', 'pending');

        return NextResponse.json({
          success: true,
          data: {
            emailSent,
            smsSent,
            message: 'Notifications sent',
          },
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Notification API error:', error);
    return NextResponse.json(
      { success: false, error: 'Notification processing failed' },
      { status: 500 }
    );
  }
}

// GET: Get notification history
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const complaintId = searchParams.get('complaintId');
    const userId = searchParams.get('userId');

    let query = supabaseAdmin
      .from('notifications')
      .select(`
        *,
        complaints:title (
          id,
          title
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (complaintId) {
      query = query.eq('complaint_id', complaintId);
    }

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: notifications, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: notifications || [],
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}
