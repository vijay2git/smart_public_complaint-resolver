import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { supabaseAdmin } from '@/lib/supabase';

// AI Classification result type
export interface ClassificationResult {
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  keywords: string[];
  confidence: number;
  reasoning: string;
  aiSeverityScore: number;
}

// Similarity detection result type
export interface SimilarityResult {
  isDuplicate: boolean;
  similarityScore: number;
  similarComplaints: Array<{
    id: string;
    title: string;
    description: string;
    similarity: number;
  }>;
  reasoning: string;
}

// Complaint categories with descriptions for AI classification
export const complaintCategories = {
  pothole: {
    name: 'Pothole/Road Damage',
    description: 'Road surface damage, potholes, cracks, or uneven surfaces',
    priorityMultiplier: 1.2,
  },
  water_leak: {
    name: 'Water Leak/Burst Pipe',
    description: 'Water leaks from pipes, hydrants, or public infrastructure',
    priorityMultiplier: 1.3,
  },
  streetlight: {
    name: 'Streetlight Issue',
    description: 'Broken, flickering, or missing streetlights',
    priorityMultiplier: 1.1,
  },
  trash: {
    name: 'Waste Management',
    description: 'Overflowing bins, missed collections, illegal dumping',
    priorityMultiplier: 1.0,
  },
  noise: {
    name: 'Noise Complaint',
    description: 'Excessive noise from construction, traffic, or establishments',
    priorityMultiplier: 0.9,
  },
  parking: {
    name: 'Parking Violation',
    description: 'Illegal parking, blocking access, abandoned vehicles',
    priorityMultiplier: 0.8,
  },
  sidewalk: {
    name: 'Sidewalk/Pedestrian',
    description: 'Broken sidewalks, obstacles, accessibility issues',
    priorityMultiplier: 1.1,
  },
  graffiti: {
    name: 'Vandalism/Graffiti',
    description: 'Graffiti, property damage, vandalism',
    priorityMultiplier: 0.7,
  },
  other: {
    name: 'Other',
    description: 'General complaints not fitting other categories',
    priorityMultiplier: 1.0,
  },
};

// Severity levels with scoring
export const severityLevels = {
  low: { score: 0.2, label: 'Low', description: 'Minor inconvenience, no immediate danger' },
  medium: { score: 0.5, label: 'Medium', description: 'Moderate impact, requires attention' },
  high: { score: 0.8, label: 'High', description: 'Significant impact, urgent attention needed' },
  critical: { score: 1.0, label: 'Critical', description: 'Immediate danger or safety risk' },
};

// AI prompts for classification
export const aiPrompts = {
  classifyComplaint: `You are a public complaint classification system. Analyze the following complaint and provide:

1. Category: Choose the most appropriate category from: ${Object.keys(complaintCategories).join(', ')}
2. Severity: Rate as low, medium, high, or critical based on urgency and impact
3. Keywords: Extract 3-5 key terms for duplicate detection
4. Confidence: Rate your confidence in this classification (0-1)

Respond in JSON format:
{
  "category": "category_name",
  "severity": "low|medium|high|critical",
  "keywords": ["keyword1", "keyword2", ...],
  "confidence": 0.95,
  "reasoning": "Brief explanation of classification"
}`,

  detectDuplicates: `You are a duplicate complaint detection system. Compare the following complaint with potential duplicates and determine if they should be merged.

Consider:
- Similar location
- Same underlying issue
- Overlapping timeframes
- Same affected infrastructure

Respond in JSON format:
{
  "isDuplicate": true/false,
  "similarityScore": 0.95,
  "reasoning": "Brief explanation",
  "recommendedAction": "merge|keep_separate|review"
}`,

  summarizeComplaint: `You are a complaint summarization system. Create a concise summary of the complaint that captures the key details for administrative review.

Respond in JSON format:
{
  "summary": "2-3 sentence summary",
  "keyDetails": ["detail1", "detail2", ...],
  "urgencyIndicators": ["indicator1", "indicator2", ...]
}`,
};

// Classify a complaint using AI
export async function classifyComplaint(
  title: string,
  description: string,
  location?: { latitude: number; longitude: number }
): Promise<ClassificationResult> {
  try {
    const locationContext = location 
      ? `\nLocation: Latitude ${location.latitude}, Longitude ${location.longitude}` 
      : '';

    const { text } = await generateText({
      model: openai('gpt-4o'),
      system: aiPrompts.classifyComplaint,
      prompt: `Complaint Title: ${title}\n\nDescription: ${description}${locationContext}`,
      temperature: 0.3,
      maxTokens: 1000,
    });

    const result = JSON.parse(text || '{}');
    
    // Validate and enhance the result
    const category = complaintCategories[result.category as keyof typeof complaintCategories] 
      ? result.category 
      : 'other';
    
    const severity = severityLevels[result.severity as keyof typeof severityLevels]
      ? result.severity
      : 'medium';

    return {
      category,
      severity,
      keywords: Array.isArray(result.keywords) ? result.keywords : [],
      confidence: Math.min(Math.max(result.confidence || 0.5, 0), 1),
      reasoning: result.reasoning || 'No reasoning provided',
      aiSeverityScore: severityLevels[severity as keyof typeof severityLevels].score,
    };
  } catch (error) {
    console.error('Classification error:', error);
    // Return default classification on error
    return {
      category: 'other',
      severity: 'medium',
      keywords: [],
      confidence: 0.5,
      reasoning: 'Classification failed, using default values',
      aiSeverityScore: 0.5,
    };
  }
}

// Detect duplicate complaints using embeddings
export async function detectDuplicates(
  title: string,
  description: string,
  location?: { latitude: number; longitude: number }
): Promise<SimilarityResult> {
  try {
    // Generate embedding for the complaint text
    const embedding = await generateEmbedding(`${title} ${description}`);
    
    // Search for similar complaints in the database
    const { data: similarComplaints, error } = await supabaseAdmin
      .rpc('find_similar_complaints', {
        query_embedding: embedding,
        threshold: 0.7,
        limit_count: 5,
      });

    if (error) throw error;

    if (!similarComplaints || similarComplaints.length === 0) {
      return {
        isDuplicate: false,
        similarityScore: 0,
        similarComplaints: [],
        reasoning: 'No similar complaints found',
      };
    }

    // Use AI to analyze if any are true duplicates
    const similarTexts = similarComplaints
      .map((c: any) => `- "${c.title}": ${c.description} (similarity: ${(c.similarity * 100).toFixed(1)}%)`)
      .join('\n');

    const { text } = await generateText({
      model: openai('gpt-4o'),
      system: aiPrompts.detectDuplicates,
      prompt: `New Complaint:\nTitle: ${title}\nDescription: ${description}${location ? `\nLocation: ${location.latitude}, ${location.longitude}` : ''}\n\nPotential Duplicates:\n${similarTexts}`,
      temperature: 0.2,
      maxTokens: 500,
    });

    const result = JSON.parse(text || '{}');

    return {
      isDuplicate: result.isDuplicate || false,
      similarityScore: Math.max(...similarComplaints.map((c: any) => c.similarity)),
      similarComplaints: similarComplaints.map((c: any) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        similarity: c.similarity,
      })),
      reasoning: result.reasoning || 'Analysis completed',
    };
  } catch (error) {
    console.error('Duplicate detection error:', error);
    return {
      isDuplicate: false,
      similarityScore: 0,
      similarComplaints: [],
      reasoning: 'Duplicate detection failed',
    };
  }
}

// Generate embedding for text using OpenAI
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        input: text,
        model: 'text-embedding-3-small',
      }),
    });

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Embedding generation error:', error);
    throw new Error('Failed to generate embedding');
  }
}

// Calculate priority score using decision logic
export function calculatePriorityScore(
  aiSeverityScore: number,
  hoursPending: number,
  category: string,
  isDuplicate: boolean = false
): number {
  // Base weights
  const severityWeight = 0.5;
  const timeWeight = 0.3;
  const categoryWeight = 0.15;
  const duplicateWeight = 0.05;

  // Get category multiplier
  const categoryInfo = complaintCategories[category as keyof typeof complaintCategories];
  const categoryMultiplier = categoryInfo?.priorityMultiplier || 1.0;

  // Time factor (increases with age, caps at 72 hours)
  const timeFactor = Math.min(hoursPending / 72, 1);

  // Duplicate penalty (reduces priority if duplicate)
  const duplicatePenalty = isDuplicate ? 0.5 : 1.0;

  // Calculate score
  const score = (
    (aiSeverityScore * severityWeight) +
    (timeFactor * timeWeight) +
    (categoryMultiplier * categoryWeight) +
    (duplicatePenalty * duplicateWeight)
  ) * duplicatePenalty;

  // Scale to 0-100
  return Math.round(Math.min(Math.max(score * 100, 0), 100));
}

// Summarize complaint for admin dashboard
export async function summarizeComplaint(
  title: string,
  description: string
): Promise<{
  summary: string;
  keyDetails: string[];
  urgencyIndicators: string[];
}> {
  try {
    const { text } = await generateText({
      model: openai('gpt-4o'),
      system: aiPrompts.summarizeComplaint,
      prompt: `Complaint Title: ${title}\n\nDescription: ${description}`,
      temperature: 0.3,
      maxTokens: 300,
    });

    const result = JSON.parse(text || '{}');
    
    return {
      summary: result.summary || title,
      keyDetails: Array.isArray(result.keyDetails) ? result.keyDetails : [],
      urgencyIndicators: Array.isArray(result.urgencyIndicators) ? result.urgencyIndicators : [],
    };
  } catch (error) {
    console.error('Summarization error:', error);
    return {
      summary: title,
      keyDetails: [],
      urgencyIndicators: [],
    };
  }
}
