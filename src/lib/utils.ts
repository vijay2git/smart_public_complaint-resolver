import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date formatting utilities
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function timeAgo(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return formatDate(date);
}

// Priority score calculation
export function calculatePriorityScore(
  aiSeverity: number, // 0-1 scale
  hoursPending: number,
  categoryMultiplier: number = 1.0
): number {
  const severityWeight = 0.6;
  const timeWeight = 0.3;
  const categoryWeight = 0.1;

  const timeFactor = Math.min(hoursPending / 72, 1); // Max out at 72 hours
  const score = 
    (aiSeverity * severityWeight) + 
    (timeFactor * timeWeight) + 
    (categoryMultiplier * categoryWeight);
  
  return Math.round(score * 100);
}

// Complaint status colors
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'in_progress': 'bg-blue-100 text-blue-800',
    'escalated': 'bg-red-100 text-red-800',
    'resolved': 'bg-green-100 text-green-800',
    'closed': 'bg-gray-100 text-gray-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

// Category icons mapping
export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    'pothole': '🕳️',
    'water_leak': '💧',
    'streetlight': '💡',
    'trash': '🗑️',
    'noise': '🔊',
    'parking': '🅿️',
    'sidewalk': '🚶',
    'graffiti': '🎨',
    'other': '📋'
  };
  return icons[category] || '📋';
}
