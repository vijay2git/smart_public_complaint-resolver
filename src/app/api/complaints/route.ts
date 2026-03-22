import { NextResponse } from 'next/server';
import { registerComplaintEmails } from '@/lib/emails/scheduler';

// Generate a random ID
const generateId = () => 'CMP-' + Math.random().toString(36).substr(2, 9).toUpperCase();

// POST: Create a new complaint (demo mode without Supabase)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      title, 
      description, 
      category,
      location, 
      images, 
      voiceTranscription,
      contact, // Contact info: { fullName, email, phone }
      userId 
    } = body;

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields (title, description)' },
        { status: 400 }
      );
    }

    // Validate contact info
    if (!contact?.email) {
      return NextResponse.json(
        { success: false, error: 'Email address is required for notifications' },
        { status: 400 }
      );
    }

    // Calculate priority based on category
    const categoryMultipliers: Record<string, number> = {
      pothole: 1.2,
      water_leak: 1.5,
      streetlight: 1.1,
      trash: 1.0,
      noise: 0.9,
      parking: 0.8,
      sidewalk: 1.1,
      graffiti: 0.7,
      other: 1.0,
    };

    const severityScores: Record<string, number> = {
      pothole: 0.6,
      water_leak: 0.8,
      streetlight: 0.5,
      trash: 0.4,
      noise: 0.3,
      parking: 0.3,
      sidewalk: 0.5,
      graffiti: 0.3,
      other: 0.5,
    };

    const multiplier = categoryMultipliers[category] || 1.0;
    const severityScore = severityScores[category] || 0.5;
    const priorityScore = Math.round(severityScore * multiplier * 100);

    // Create mock complaint with contact info
    const complaintId = generateId();
    const complaint = {
      id: complaintId,
      user_id: userId || 'demo-user',
      title,
      description,
      category: category || 'other',
      severity: severityScore > 0.7 ? 'high' : severityScore > 0.4 ? 'medium' : 'low',
      ai_severity_score: severityScore,
      priority_score: Math.min(priorityScore, 100),
      status: 'pending',
      location,
      contact: {
        fullName: contact?.fullName || 'Anonymous',
        email: contact?.email,
        phone: contact?.phone || null,
      },
      images: images || [],
      voice_transcription: voiceTranscription,
      ai_classification: {
        category: category || 'other',
        confidence: 0.85,
        keywords: title.toLowerCase().split(' ').slice(0, 3),
        reasoning: 'Classified based on complaint content',
      },
      duplicate_of: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Register email notifications (sends first email immediately)
    try {
      registerComplaintEmails({
        complaintId,
        citizenName: contact?.fullName || 'Citizen',
        citizenEmail: contact?.email || `${userId || 'citizen'}@example.com`,
        title,
        description,
        category: category || 'other',
      });
      console.log(`[EMAIL] Registered complaint ${complaintId} for email notifications to ${contact?.email}`);
    } catch (emailError) {
      console.error('[EMAIL] Failed to register emails:', emailError);
      // Don't fail the complaint creation if email registration fails
    }

    // Simulate some delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({
      success: true,
      data: {
        complaint,
        classification: complaint.ai_classification,
        duplicates: null,
      },
    });
  } catch (error) {
    console.error('Create complaint error:', error);
    // Return success with mock data even on error
    const mockComplaint = {
      id: generateId(),
      title: 'Demo Complaint',
      status: 'pending',
      priority_score: 75,
      created_at: new Date().toISOString(),
    };
    
    return NextResponse.json({
      success: true,
      data: {
        complaint: mockComplaint,
        classification: { category: 'other', confidence: 0.8 },
        duplicates: null,
      },
    });
  }
}

// GET: Retrieve complaints (demo mode)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Return mock complaints for demo
    const mockComplaints = [
      {
        id: 'CMP-ABC123',
        title: 'Large pothole on Main Street',
        description: 'Dangerous pothole causing traffic issues',
        category: 'pothole',
        severity: 'high',
        priority_score: 85,
        status: 'pending',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        user: { id: 'user-1', email: 'citizen@example.com', full_name: 'John Doe' },
      },
      {
        id: 'CMP-DEF456',
        title: 'Water leak from fire hydrant',
        description: 'Water leaking onto the street',
        category: 'water_leak',
        severity: 'critical',
        priority_score: 95,
        status: 'in_progress',
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        user: { id: 'user-2', email: 'jane@example.com', full_name: 'Jane Smith' },
      },
      {
        id: 'CMP-GHI789',
        title: 'Broken streetlight near park',
        description: 'Streetlight not working for 3 days',
        category: 'streetlight',
        severity: 'medium',
        priority_score: 65,
        status: 'pending',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        user: { id: 'user-3', email: 'bob@example.com', full_name: 'Bob Wilson' },
      },
    ];

    return NextResponse.json({
      success: true,
      data: mockComplaints,
      pagination: {
        page,
        limit,
        total: mockComplaints.length,
      },
    });
  } catch (error) {
    console.error('Get complaints error:', error);
    return NextResponse.json({
      success: true,
      data: [],
      pagination: { page: 1, limit: 20, total: 0 },
    });
  }
}
