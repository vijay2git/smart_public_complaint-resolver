import { Resend } from 'resend';
import Twilio from 'twilio';

// Initialize email client
const resend = new Resend(process.env.RESEND_API_KEY);

// Initialize SMS client
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

// Email templates
export const emailTemplates = {
  complaintSubmitted: (data: {
    complaintId: string;
    title: string;
    category: string;
    priority: number;
  }) => ({
    subject: `Complaint Submitted: ${data.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Smart Complaint Resolver</h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Complaint Submitted Successfully</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Complaint ID:</strong> ${data.complaintId}</p>
            <p><strong>Title:</strong> ${data.title}</p>
            <p><strong>Category:</strong> ${data.category}</p>
            <p><strong>Priority Score:</strong> ${data.priority}/100</p>
          </div>
          
          <p>Your complaint has been received and is being analyzed by our AI system. 
             You will receive updates as your complaint progresses through our resolution process.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/complaint/track?id=${data.complaintId}" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Track Your Complaint
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            If you have any questions, please contact our support team.
          </p>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p>© 2026 Smart Public Complaint Resolver. All rights reserved.</p>
        </div>
      </div>
    `,
  }),

  statusUpdate: (data: {
    complaintId: string;
    title: string;
    oldStatus: string;
    newStatus: string;
    notes?: string;
  }) => ({
    subject: `Status Update: ${data.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Smart Complaint Resolver</h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Complaint Status Updated</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Complaint ID:</strong> ${data.complaintId}</p>
            <p><strong>Title:</strong> ${data.title}</p>
            <p><strong>Previous Status:</strong> <span style="text-transform: capitalize;">${data.oldStatus.replace('_', ' ')}</span></p>
            <p><strong>New Status:</strong> <span style="text-transform: capitalize; color: #667eea;">${data.newStatus.replace('_', ' ')}</span></p>
            ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ''}
          </div>
          
          <p>Your complaint is making progress. Check the tracking page for more details.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/complaint/track?id=${data.complaintId}" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Details
            </a>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p>© 2026 Smart Public Complaint Resolver. All rights reserved.</p>
        </div>
      </div>
    `,
  }),

  complaintEscalated: (data: {
    complaintId: string;
    title: string;
    reason: string;
  }) => ({
    subject: `Complaint Escalated: ${data.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">⚠️ Complaint Escalated</h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Your Complaint Has Been Escalated</h2>
          
          <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Complaint ID:</strong> ${data.complaintId}</p>
            <p><strong>Title:</strong> ${data.title}</p>
            <p><strong>Reason:</strong> ${data.reason}</p>
          </div>
          
          <p>Your complaint is now being prioritized by our team. 
             We apologize for any delay and are working to resolve this issue as quickly as possible.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/complaint/track?id=${data.complaintId}" 
               style="background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Status
            </a>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p>© 2026 Smart Public Complaint Resolver. All rights reserved.</p>
        </div>
      </div>
    `,
  }),

  complaintResolved: (data: {
    complaintId: string;
    title: string;
    resolutionNotes?: string;
  }) => ({
    subject: `Complaint Resolved: ${data.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">✅ Complaint Resolved</h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Great News! Your Complaint Has Been Resolved</h2>
          
          <div style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Complaint ID:</strong> ${data.complaintId}</p>
            <p><strong>Title:</strong> ${data.title}</p>
            ${data.resolutionNotes ? `<p><strong>Resolution Notes:</strong> ${data.resolutionNotes}</p>` : ''}
          </div>
          
          <p>Thank you for reporting this issue. Your contribution helps improve our community.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/complaint/track?id=${data.complaintId}" 
               style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Details
            </a>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p>© 2026 Smart Public Complaint Resolver. All rights reserved.</p>
        </div>
      </div>
    `,
  }),
};

// Send email notification
export async function sendEmail(
  to: string,
  template: keyof typeof emailTemplates,
  data: any
): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, skipping email');
      return false;
    }

    const emailContent = emailTemplates[template](data);
    
    await resend.emails.send({
      from: 'Smart Complaint Resolver <noreply@complaintresolver.com>',
      to,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}

// Send SMS notification
export async function sendSMS(
  to: string,
  message: string
): Promise<boolean> {
  try {
    if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
      console.warn('Twilio not configured, skipping SMS');
      return false;
    }

    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });

    return true;
  } catch (error) {
    console.error('SMS send error:', error);
    return false;
  }
}

// Process notification queue
export async function processNotifications(): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
}> {
  try {
    // This would be called by a cron job or webhook
    // For now, return mock data
    return {
      processed: 0,
      succeeded: 0,
      failed: 0,
    };
  } catch (error) {
    console.error('Notification processing error:', error);
    throw error;
  }
}
