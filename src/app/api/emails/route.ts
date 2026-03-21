import { NextResponse } from 'next/server';
import { 
  registerComplaintEmails, 
  advanceComplaintStage, 
  getComplaintTimeline,
  getComplaintEmails,
  getQueueStats,
  processPendingEmails,
  startDemoAutoAdvance
} from '@/lib/emails/scheduler';
import { getEmailForStage, EmailStage } from '@/lib/emails/templates';

// POST: Manage email notifications
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      // Register complaint for email notifications
      case 'register':
        const timeline = registerComplaintEmails({
          complaintId: data.complaintId,
          citizenName: data.citizenName || 'Citizen',
          citizenEmail: data.citizenEmail,
          title: data.title,
          description: data.description,
          category: data.category || 'other',
        });

        return NextResponse.json({
          success: true,
          data: {
            timeline,
            message: 'Complaint registered for email notifications. First email sent immediately.',
          },
        });

      // Advance complaint to next stage
      case 'advance':
        const result = advanceComplaintStage(data.complaintId);

        return NextResponse.json({
          success: result.success,
          data: result,
        });

      // Process pending emails (for cron job)
      case 'process':
        const processResult = await processPendingEmails();

        return NextResponse.json({
          success: true,
          data: processResult,
        });

      // Start demo auto-advance (for testing)
      case 'start_demo':
        startDemoAutoAdvance(data.complaintId);

        return NextResponse.json({
          success: true,
          data: {
            message: 'Demo auto-advance started. Complaint will advance every 5 seconds.',
          },
        });

      // Send specific stage email immediately
      case 'send_stage':
        const stageTimeline = getComplaintTimeline(data.complaintId);
        if (!stageTimeline) {
          return NextResponse.json(
            { success: false, error: 'Complaint not found' },
            { status: 404 }
          );
        }

        const emailData = {
          complaintId: stageTimeline.complaintId,
          title: stageTimeline.title,
          description: stageTimeline.description,
          category: stageTimeline.category,
          citizenName: stageTimeline.citizenName,
          citizenEmail: stageTimeline.citizenEmail,
          submittedAt: stageTimeline.submittedAt.toISOString(),
        };

        const email = getEmailForStage(data.stage as EmailStage, emailData);

        // In production, send via Resend/SendGrid here
        console.log(`[EMAIL] Sending ${data.stage} email to ${stageTimeline.citizenEmail}`);
        console.log(`[EMAIL] Subject: ${email.subject}`);

        return NextResponse.json({
          success: true,
          data: {
            stage: data.stage,
            email: {
              to: stageTimeline.citizenEmail,
              subject: email.subject,
              preview: email.text.substring(0, 200) + '...',
            },
            message: `Email for stage '${data.stage}' prepared for ${stageTimeline.citizenEmail}`,
          },
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET: Retrieve email info
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const complaintId = searchParams.get('complaintId');
    const action = searchParams.get('action');

    if (action === 'stats') {
      const stats = getQueueStats();
      return NextResponse.json({
        success: true,
        data: stats,
      });
    }

    if (complaintId) {
      const timeline = getComplaintTimeline(complaintId);
      const emails = getComplaintEmails(complaintId);

      if (!timeline) {
        return NextResponse.json(
          { success: false, error: 'Complaint not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          timeline,
          emails,
        },
      });
    }

    // Return stats if no specific complaint requested
    const stats = getQueueStats();
    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
