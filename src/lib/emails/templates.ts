// Email notification templates for complaint status updates

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface ComplaintEmailData {
  complaintId: string;
  title: string;
  description: string;
  category: string;
  citizenName: string;
  citizenEmail: string;
  submittedAt: string;
  estimatedResolution?: string;
}

// Stage 1: Complaint Received
export function getReceivedEmail(data: ComplaintEmailData): EmailTemplate {
  const year = new Date().getFullYear();
  
  return {
    subject: `✅ Complaint Received - ${data.complaintId}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background: #0F0F0F; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #0F0F0F; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1A1A2E 0%, #16213E 100%); border-radius: 24px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #F59E0B 0%, #EA580C 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #1C1917; font-size: 24px; font-weight: 700;">ComplaintResolver</h1>
              <p style="margin: 8px 0 0; color: #1C1917; font-size: 14px; opacity: 0.8;">AI-Powered Resolution System</p>
            </td>
          </tr>
          
          <!-- Success Icon -->
          <tr>
            <td style="padding: 40px 30px 20px; text-align: center;">
              <div style="width: 80px; height: 80px; background: rgba(16, 185, 129, 0.2); border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px;">✓</span>
              </div>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 0 30px 30px; text-align: center;">
              <h2 style="color: #FAFAF9; font-size: 22px; margin: 0 0 16px;">Complaint Received!</h2>
              <p style="color: #A8A29E; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
                Hi ${data.citizenName},<br><br>
                Thank you for submitting your complaint. We have received your request and our AI system is analyzing it.
              </p>
            </td>
          </tr>
          
          <!-- Complaint Details Card -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="color: #A8A29E; font-size: 12px; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 1px;">Complaint ID</p>
                    <p style="color: #F59E0B; font-size: 18px; font-weight: 600; margin: 0 0 16px;">${data.complaintId}</p>
                    
                    <p style="color: #A8A29E; font-size: 12px; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 1px;">Title</p>
                    <p style="color: #FAFAF9; font-size: 15px; margin: 0 0 16px;">${data.title}</p>
                    
                    <p style="color: #A8A29E; font-size: 12px; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 1px;">Category</p>
                    <p style="color: #FAFAF9; font-size: 15px; margin: 0;">${data.category}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Next Steps -->
          <tr>
            <td style="padding: 0 30px 30px; text-align: center;">
              <p style="color: #A8A29E; font-size: 14px; margin: 0;">
                You will receive another email within 2 days when we start reviewing your complaint.
              </p>
            </td>
          </tr>
          
          <!-- Track Button -->
          <tr>
            <td style="padding: 0 30px 40px; text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/complaint/track?id=${data.complaintId}" 
                 style="display: inline-block; background: linear-gradient(135deg, #F59E0B 0%, #EA580C 100%); color: #1C1917; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 15px;">
                Track Your Complaint
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: rgba(0,0,0,0.3); padding: 20px 30px; text-align: center;">
              <p style="color: #78716C; font-size: 12px; margin: 0;">
                © ${year} Smart Public Complaint Resolver. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    text: `Complaint Received!\n\nHi ${data.citizenName},\n\nThank you for submitting your complaint. We have received your request.\n\nComplaint ID: ${data.complaintId}\nTitle: ${data.title}\nCategory: ${data.category}\n\nYou will receive another email within 2 days when we start reviewing your complaint.\n\nTrack your complaint: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/complaint/track?id=${data.complaintId}`
  };
}

// Stage 2: Under Review (Work is going to start)
export function getUnderReviewEmail(data: ComplaintEmailData): EmailTemplate {
  const year = new Date().getFullYear();
  
  return {
    subject: `🔍 Complaint Under Review - ${data.complaintId}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background: #0F0F0F; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #0F0F0F; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1A1A2E 0%, #16213E 100%); border-radius: 24px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #F59E0B 0%, #EA580C 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #1C1917; font-size: 24px; font-weight: 700;">ComplaintResolver</h1>
              <p style="margin: 8px 0 0; color: #1C1917; font-size: 14px; opacity: 0.8;">AI-Powered Resolution System</p>
            </td>
          </tr>
          
          <!-- Review Icon -->
          <tr>
            <td style="padding: 40px 30px 20px; text-align: center;">
              <div style="width: 80px; height: 80px; background: rgba(59, 130, 246, 0.2); border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px;">🔍</span>
              </div>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 0 30px 30px; text-align: center;">
              <h2 style="color: #FAFAF9; font-size: 22px; margin: 0 0 16px;">Your Complaint is Under Review</h2>
              <p style="color: #A8A29E; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
                Hi ${data.citizenName},<br><br>
                Great news! Your complaint has been assigned to our team and we are now reviewing the details. Work will begin shortly.
              </p>
            </td>
          </tr>
          
          <!-- Status Card -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 16px;">
                <tr>
                  <td style="padding: 20px; text-align: center;">
                    <p style="color: #3B82F6; font-size: 14px; font-weight: 600; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">Current Status</p>
                    <p style="color: #FAFAF9; font-size: 20px; font-weight: 700; margin: 0;">UNDER REVIEW</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Complaint Details -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="color: #A8A29E; font-size: 12px; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 1px;">Complaint ID</p>
                    <p style="color: #F59E0B; font-size: 18px; font-weight: 600; margin: 0 0 16px;">${data.complaintId}</p>
                    
                    <p style="color: #A8A29E; font-size: 12px; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 1px;">Title</p>
                    <p style="color: #FAFAF9; font-size: 15px; margin: 0;">${data.title}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Next Steps -->
          <tr>
            <td style="padding: 0 30px 30px; text-align: center;">
              <p style="color: #A8A29E; font-size: 14px; margin: 0;">
                You will receive another email within 2 days when work begins on your complaint.
              </p>
            </td>
          </tr>
          
          <!-- Track Button -->
          <tr>
            <td style="padding: 0 30px 40px; text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/complaint/track?id=${data.complaintId}" 
                 style="display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: #FFFFFF; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 15px;">
                View Progress
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: rgba(0,0,0,0.3); padding: 20px 30px; text-align: center;">
              <p style="color: #78716C; font-size: 12px; margin: 0;">
                © ${year} Smart Public Complaint Resolver. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    text: `Your Complaint is Under Review\n\nHi ${data.citizenName},\n\nYour complaint has been assigned to our team and we are now reviewing the details.\n\nComplaint ID: ${data.complaintId}\nTitle: ${data.title}\nStatus: Under Review\n\nYou will receive another email within 2 days when work begins.\n\nTrack your complaint: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/complaint/track?id=${data.complaintId}`
  };
}

// Stage 3: Work Started
export function getWorkStartedEmail(data: ComplaintEmailData): EmailTemplate {
  const year = new Date().getFullYear();
  
  return {
    subject: `🚀 Work Started on Your Complaint - ${data.complaintId}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background: #0F0F0F; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #0F0F0F; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1A1A2E 0%, #16213E 100%); border-radius: 24px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #F59E0B 0%, #EA580C 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #1C1917; font-size: 24px; font-weight: 700;">ComplaintResolver</h1>
              <p style="margin: 8px 0 0; color: #1C1917; font-size: 14px; opacity: 0.8;">AI-Powered Resolution System</p>
            </td>
          </tr>
          
          <!-- Work Icon -->
          <tr>
            <td style="padding: 40px 30px 20px; text-align: center;">
              <div style="width: 80px; height: 80px; background: rgba(139, 92, 246, 0.2); border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px;">🚀</span>
              </div>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 0 30px 30px; text-align: center;">
              <h2 style="color: #FAFAF9; font-size: 22px; margin: 0 0 16px;">Work Has Started!</h2>
              <p style="color: #A8A29E; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
                Hi ${data.citizenName},<br><br>
                Exciting news! Our team has started working on resolving your complaint. We are actively addressing the issue you reported.
              </p>
            </td>
          </tr>
          
          <!-- Progress Card -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 16px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="color: #8B5CF6; font-size: 14px; font-weight: 600; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 1px;">Progress</p>
                    
                    <!-- Progress Bar -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 12px;">
                      <tr>
                        <td style="background: rgba(255,255,255,0.1); border-radius: 8px; height: 12px; padding: 0;">
                          <div style="background: linear-gradient(90deg, #8B5CF6, #A855F7); width: 60%; height: 12px; border-radius: 8px;"></div>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="color: #FAFAF9; font-size: 16px; font-weight: 600; margin: 0;">60% Complete</p>
                    <p style="color: #A8A29E; font-size: 13px; margin: 4px 0 0;">Work in Progress</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Complaint Details -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="color: #A8A29E; font-size: 12px; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 1px;">Complaint ID</p>
                    <p style="color: #F59E0B; font-size: 18px; font-weight: 600; margin: 0 0 16px;">${data.complaintId}</p>
                    
                    <p style="color: #A8A29E; font-size: 12px; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 1px;">Title</p>
                    <p style="color: #FAFAF9; font-size: 15px; margin: 0;">${data.title}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Next Steps -->
          <tr>
            <td style="padding: 0 30px 30px; text-align: center;">
              <p style="color: #A8A29E; font-size: 14px; margin: 0;">
                You will receive a final email within 2 days when your complaint is resolved.
              </p>
            </td>
          </tr>
          
          <!-- Track Button -->
          <tr>
            <td style="padding: 0 30px 40px; text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/complaint/track?id=${data.complaintId}" 
                 style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); color: #FFFFFF; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 15px;">
                Track Progress
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: rgba(0,0,0,0.3); padding: 20px 30px; text-align: center;">
              <p style="color: #78716C; font-size: 12px; margin: 0;">
                © ${year} Smart Public Complaint Resolver. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    text: `Work Has Started!\n\nHi ${data.citizenName},\n\nOur team has started working on resolving your complaint.\n\nComplaint ID: ${data.complaintId}\nTitle: ${data.title}\nStatus: In Progress (60% Complete)\n\nYou will receive a final email within 2 days when your complaint is resolved.\n\nTrack your complaint: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/complaint/track?id=${data.complaintId}`
  };
}

// Stage 4: Work Completed
export function getWorkCompletedEmail(data: ComplaintEmailData): EmailTemplate {
  const year = new Date().getFullYear();
  
  return {
    subject: `✅ Complaint Resolved - ${data.complaintId}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background: #0F0F0F; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #0F0F0F; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1A1A2E 0%, #16213E 100%); border-radius: 24px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #FFFFFF; font-size: 24px; font-weight: 700;">ComplaintResolver</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">AI-Powered Resolution System</p>
            </td>
          </tr>
          
          <!-- Success Icon -->
          <tr>
            <td style="padding: 40px 30px 20px; text-align: center;">
              <div style="width: 100px; height: 100px; background: rgba(16, 185, 129, 0.2); border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center; border: 3px solid rgba(16, 185, 129, 0.5);">
                <span style="font-size: 50px;">🎉</span>
              </div>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 0 30px 30px; text-align: center;">
              <h2 style="color: #10B981; font-size: 26px; margin: 0 0 16px;">Complaint Resolved!</h2>
              <p style="color: #A8A29E; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
                Hi ${data.citizenName},<br><br>
                We are pleased to inform you that your complaint has been successfully resolved! Thank you for your patience and for helping us improve our community.
              </p>
            </td>
          </tr>
          
          <!-- Completion Card -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 16px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="color: #10B981; font-size: 14px; font-weight: 600; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 1px;">Status</p>
                    
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="50%" style="padding: 12px; background: rgba(16, 185, 129, 0.2); border-radius: 8px; text-align: center;">
                          <p style="color: #10B981; font-size: 24px; font-weight: 700; margin: 0;">✓</p>
                          <p style="color: #FAFAF9; font-size: 12px; margin: 4px 0 0;">RESOLVED</p>
                        </td>
                        <td width="50%" style="padding: 12px;">
                          <p style="color: #A8A29E; font-size: 12px; margin: 0 0 4px;">Resolution Time</p>
                          <p style="color: #FAFAF9; font-size: 16px; font-weight: 600; margin: 0;">~6 Days</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Complaint Details -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="color: #A8A29E; font-size: 12px; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 1px;">Complaint ID</p>
                    <p style="color: #10B981; font-size: 18px; font-weight: 600; margin: 0 0 16px;">${data.complaintId}</p>
                    
                    <p style="color: #A8A29E; font-size: 12px; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 1px;">Title</p>
                    <p style="color: #FAFAF9; font-size: 15px; margin: 0;">${data.title}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Feedback Request -->
          <tr>
            <td style="padding: 0 30px 30px; text-align: center;">
              <p style="color: #A8A29E; font-size: 14px; margin: 0 0 16px;">
                We value your feedback! Did we meet your expectations?
              </p>
              <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="padding: 8px;">
                    <span style="font-size: 32px; cursor: pointer;">👍</span>
                  </td>
                  <td style="padding: 8px;">
                    <span style="font-size: 32px; cursor: pointer;">👎</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Track Button -->
          <tr>
            <td style="padding: 0 30px 40px; text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/complaint/track?id=${data.complaintId}" 
                 style="display: inline-block; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: #FFFFFF; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 15px;">
                View Details
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: rgba(0,0,0,0.3); padding: 20px 30px; text-align: center;">
              <p style="color: #78716C; font-size: 12px; margin: 0 0 8px;">
                Thank you for helping improve our community!
              </p>
              <p style="color: #57534E; font-size: 11px; margin: 0;">
                © ${year} Smart Public Complaint Resolver. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    text: `Complaint Resolved!\n\nHi ${data.citizenName},\n\nWe are pleased to inform you that your complaint has been successfully resolved!\n\nComplaint ID: ${data.complaintId}\nTitle: ${data.title}\nStatus: RESOLVED\n\nThank you for your patience and for helping us improve our community.\n\nView details: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/complaint/track?id=${data.complaintId}`
  };
}

export type EmailStage = 'received' | 'under_review' | 'work_started' | 'completed';

export function getEmailForStage(stage: EmailStage, data: ComplaintEmailData): EmailTemplate {
  switch (stage) {
    case 'received':
      return getReceivedEmail(data);
    case 'under_review':
      return getUnderReviewEmail(data);
    case 'work_started':
      return getWorkStartedEmail(data);
    case 'completed':
      return getWorkCompletedEmail(data);
  }
}
