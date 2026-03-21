import { openai } from '@ai-sdk/openai';
import { createOpenAI } from '@ai-sdk/openai';

// Configure OpenAI provider
const openaiProvider = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// AI model configuration
export const aiConfig = {
  provider: process.env.AI_PROVIDER || 'openai',
  model: process.env.AI_MODEL || 'gpt-4o',
  embeddingModel: 'text-embedding-3-small',
  temperature: 0.3,
  maxTokens: 1000,
};

// Get the configured model
export function getModel() {
  if (aiConfig.provider === 'openai') {
    return openai(aiConfig.model);
  }
  // Add support for other providers here
  return openai(aiConfig.model);
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
