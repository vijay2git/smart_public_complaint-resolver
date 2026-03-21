// Notification queue and scheduler system
// For production, use Redis or a database. For demo, we use in-memory storage.

import { getEmailForStage, EmailStage, ComplaintEmailData } from './templates';

export interface ScheduledEmail {
  id: string;
  complaintId: string;
  stage: EmailStage;
  scheduledFor: Date;
  data: ComplaintEmailData;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: Date;
  error?: string;
}

export interface ComplaintTimeline {
  complaintId: string;
  citizenName: string;
  citizenEmail: string;
  title: string;
  description: string;
  category: string;
  submittedAt: Date;
  emails: {
    received?: Date;
    under_review?: Date;
    work_started?: Date;
    completed?: Date;
  };
  currentStage: EmailStage;
}

// In-memory storage (use Redis/DB in production)
const emailQueue: Map<string, ScheduledEmail> = new Map();
const complaintTimelines: Map<string, ComplaintTimeline> = new Map();

// Email delay in days (2 days between each stage)
const EMAIL_DELAY_DAYS = 2;
const EMAIL_DELAY_MS = EMAIL_DELAY_DAYS * 24 * 60 * 60 * 1000;

// Generate unique ID
const generateId = () => Math.random().toString(36).substr(2, 12);

// Register a new complaint for email tracking
export function registerComplaintEmails(complaint: {
  complaintId: string;
  citizenName: string;
  citizenEmail: string;
  title: string;
  description: string;
  category: string;
}): ComplaintTimeline {
  const now = new Date();
  
  const timeline: ComplaintTimeline = {
    complaintId: complaint.complaintId,
    citizenName: complaint.citizenName,
    citizenEmail: complaint.citizenEmail,
    title: complaint.title,
    description: complaint.description,
    category: complaint.category,
    submittedAt: now,
    emails: {
      received: now, // First email sent immediately
    },
    currentStage: 'received',
  };
  
  complaintTimelines.set(complaint.complaintId, timeline);
  
  // Schedule first email (immediate)
  const emailData: ComplaintEmailData = {
    complaintId: complaint.complaintId,
    title: complaint.title,
    description: complaint.description,
    category: complaint.category,
    citizenName: complaint.citizenName,
    citizenEmail: complaint.citizenEmail,
    submittedAt: now.toISOString(),
  };
  
  scheduleEmail({
    complaintId: complaint.complaintId,
    stage: 'received',
    scheduledFor: now,
    data: emailData,
  });
  
  // Schedule next email (under_review) in 2 days
  scheduleEmail({
    complaintId: complaint.complaintId,
    stage: 'under_review',
    scheduledFor: new Date(now.getTime() + EMAIL_DELAY_MS),
    data: emailData,
  });
  
  return timeline;
}

// Schedule an email
export function scheduleEmail(params: {
  complaintId: string;
  stage: EmailStage;
  scheduledFor: Date;
  data: ComplaintEmailData;
}): ScheduledEmail {
  const id = generateId();
  
  const email: ScheduledEmail = {
    id,
    complaintId: params.complaintId,
    stage: params.stage,
    scheduledFor: params.scheduledFor,
    data: params.data,
    status: 'pending',
  };
  
  emailQueue.set(id, email);
  
  return email;
}

// Get all pending emails that should be sent now
export function getPendingEmails(): ScheduledEmail[] {
  const now = new Date();
  const pending: ScheduledEmail[] = [];
  
  emailQueue.forEach((email) => {
    if (email.status === 'pending' && email.scheduledFor <= now) {
      pending.push(email);
    }
  });
  
  return pending.sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime());
}

// Mark email as sent
export function markEmailSent(emailId: string): void {
  const email = emailQueue.get(emailId);
  if (email) {
    email.status = 'sent';
    email.sentAt = new Date();
  }
}

// Mark email as failed
export function markEmailFailed(emailId: string, error: string): void {
  const email = emailQueue.get(emailId);
  if (email) {
    email.status = 'failed';
    email.error = error;
  }
}

// Advance complaint to next stage
export function advanceComplaintStage(complaintId: string): {
  success: boolean;
  newStage?: EmailStage;
  nextEmailScheduled?: Date;
  message: string;
} {
  const timeline = complaintTimelines.get(complaintId);
  
  if (!timeline) {
    return { success: false, message: 'Complaint not found' };
  }
  
  const stages: EmailStage[] = ['received', 'under_review', 'work_started', 'completed'];
  const currentIndex = stages.indexOf(timeline.currentStage);
  
  if (currentIndex >= stages.length - 1) {
    return { success: false, message: 'Complaint already completed' };
  }
  
  const nextStage = stages[currentIndex + 1];
  const now = new Date();
  
  // Update timeline
  timeline.currentStage = nextStage;
  timeline.emails[nextStage] = now;
  
  // Get existing email data or create new
  const emailData: ComplaintEmailData = {
    complaintId: timeline.complaintId,
    title: timeline.title,
    description: timeline.description,
    category: timeline.category,
    citizenName: timeline.citizenName,
    citizenEmail: timeline.citizenEmail,
    submittedAt: timeline.submittedAt.toISOString(),
  };
  
  // Schedule email for this stage (immediate)
  scheduleEmail({
    complaintId,
    stage: nextStage,
    scheduledFor: now,
    data: emailData,
  });
  
  // Schedule next stage email if not completed
  let nextEmailScheduled: Date | undefined;
  if (nextStage !== 'completed') {
    nextEmailScheduled = new Date(now.getTime() + EMAIL_DELAY_MS);
    const nextNextStage = stages[currentIndex + 2];
    
    scheduleEmail({
      complaintId,
      stage: nextNextStage,
      scheduledFor: nextEmailScheduled,
      data: emailData,
    });
  }
  
  return {
    success: true,
    newStage: nextStage,
    nextEmailScheduled,
    message: `Complaint advanced to ${nextStage}. Email will be sent immediately.`,
  };
}

// Get complaint timeline
export function getComplaintTimeline(complaintId: string): ComplaintTimeline | null {
  return complaintTimelines.get(complaintId) || null;
}

// Get all scheduled emails for a complaint
export function getComplaintEmails(complaintId: string): ScheduledEmail[] {
  const emails: ScheduledEmail[] = [];
  
  emailQueue.forEach((email) => {
    if (email.complaintId === complaintId) {
      emails.push(email);
    }
  });
  
  return emails.sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime());
}

// Get email queue stats
export function getQueueStats(): {
  total: number;
  pending: number;
  sent: number;
  failed: number;
  upcoming: { id: string; complaintId: string; stage: EmailStage; scheduledFor: Date }[];
} {
  let total = 0;
  let pending = 0;
  let sent = 0;
  let failed = 0;
  const upcoming: { id: string; complaintId: string; stage: EmailStage; scheduledFor: Date }[] = [];
  
  emailQueue.forEach((email) => {
    total++;
    if (email.status === 'pending') {
      pending++;
      upcoming.push({
        id: email.id,
        complaintId: email.complaintId,
        stage: email.stage,
        scheduledFor: email.scheduledFor,
      });
    } else if (email.status === 'sent') {
      sent++;
    } else if (email.status === 'failed') {
      failed++;
    }
  });
  
  return {
    total,
    pending,
    sent,
    failed,
    upcoming: upcoming.sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime()).slice(0, 10),
  };
}

// Process pending emails (called by cron job or API)
export async function processPendingEmails(): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
}> {
  const pending = getPendingEmails();
  let succeeded = 0;
  let failed = 0;
  
  for (const email of pending) {
    try {
      // In production, send actual email using Resend/SendGrid
      // For demo, we just log and mark as sent
      console.log(`[EMAIL] Sending ${email.stage} email for complaint ${email.complaintId} to ${email.data.citizenEmail}`);
      
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 100));
      
      markEmailSent(email.id);
      succeeded++;
      
      console.log(`[EMAIL] Successfully sent ${email.stage} email for ${email.complaintId}`);
    } catch (error) {
      markEmailFailed(email.id, String(error));
      failed++;
      console.error(`[EMAIL] Failed to send ${email.stage} email for ${email.complaintId}:`, error);
    }
  }
  
  return {
    processed: pending.length,
    succeeded,
    failed,
  };
}

// Demo: Auto-advance complaints (for testing)
export function startDemoAutoAdvance(complaintId: string): void {
  const stages: EmailStage[] = ['under_review', 'work_started', 'completed'];
  let stageIndex = 0;
  
  const advance = () => {
    if (stageIndex < stages.length) {
      const result = advanceComplaintStage(complaintId);
      console.log(`[DEMO] Auto-advanced ${complaintId}:`, result.message);
      stageIndex++;
      
      if (stageIndex < stages.length) {
        setTimeout(advance, 5000); // 5 seconds for demo (2 days in production)
      }
    }
  };
  
  setTimeout(advance, 5000);
}
