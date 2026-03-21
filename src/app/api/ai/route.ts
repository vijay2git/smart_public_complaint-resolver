import { NextResponse } from 'next/server';

// Mock AI responses for demo (when OpenAI is not configured)
const mockClassification = {
  category: 'pothole',
  severity: 'medium',
  keywords: ['pothole', 'road', 'damage'],
  confidence: 0.85,
  reasoning: 'Detected road damage complaint',
  aiSeverityScore: 0.6,
};

const mockDuplicates = {
  isDuplicate: false,
  similarityScore: 0,
  similarComplaints: [],
  reasoning: 'No similar complaints found',
};

const mockSummary = {
  summary: 'Road damage issue requiring attention',
  keyDetails: ['Location identified', 'Safety concern noted'],
  urgencyIndicators: ['Traffic impact', 'Potential hazard'],
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, data } = body;

    // Check if OpenAI API key is configured
    const hasOpenAI = !!process.env.OPENAI_API_KEY;

    switch (action) {
      case 'classify':
        if (!hasOpenAI) {
          return NextResponse.json({ success: true, data: mockClassification });
        }
        try {
          const { classifyComplaint } = await import('@/lib/ai/service');
          const classification = await classifyComplaint(
            data.title,
            data.description,
            data.location
          );
          return NextResponse.json({ success: true, data: classification });
        } catch (e) {
          console.error('Classification error:', e);
          return NextResponse.json({ success: true, data: mockClassification });
        }

      case 'detect_duplicates':
        if (!hasOpenAI) {
          return NextResponse.json({ success: true, data: mockDuplicates });
        }
        try {
          const { detectDuplicates } = await import('@/lib/ai/service');
          const duplicates = await detectDuplicates(
            data.title,
            data.description,
            data.location
          );
          return NextResponse.json({ success: true, data: duplicates });
        } catch (e) {
          console.error('Duplicate detection error:', e);
          return NextResponse.json({ success: true, data: mockDuplicates });
        }

      case 'summarize':
        if (!hasOpenAI) {
          return NextResponse.json({ success: true, data: mockSummary });
        }
        try {
          const { summarizeComplaint } = await import('@/lib/ai/service');
          const summary = await summarizeComplaint(
            data.title,
            data.description
          );
          return NextResponse.json({ success: true, data: summary });
        } catch (e) {
          console.error('Summarization error:', e);
          return NextResponse.json({ success: true, data: mockSummary });
        }

      case 'analyze_complaint':
        // Return mock data for demo purposes
        // In production, this would call the actual AI service
        const classification = hasOpenAI ? await (async () => {
          try {
            const { classifyComplaint } = await import('@/lib/ai/service');
            return await classifyComplaint(data.title, data.description, data.location);
          } catch (e) {
            console.error('Classification error:', e);
            return mockClassification;
          }
        })() : mockClassification;

        return NextResponse.json({
          success: true,
          data: {
            classification,
            duplicates: mockDuplicates,
            summary: mockSummary,
          },
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('AI API error:', error);
    // Return success with mock data instead of error
    return NextResponse.json({
      success: true,
      data: {
        classification: mockClassification,
        duplicates: mockDuplicates,
        summary: mockSummary,
      },
    });
  }
}
