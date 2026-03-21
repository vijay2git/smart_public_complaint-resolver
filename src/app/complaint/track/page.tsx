'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedCard, AnimatedSection, GlowButton } from '@/components/ui/animated';
import { 
  ArrowLeft, 
  Search, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  MapPin,
  Tag,
  TrendingUp,
  MessageSquare,
  Sparkles,
  Loader2
} from 'lucide-react';
import { formatDate, timeAgo, getCategoryIcon } from '@/lib/utils';

interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  priority_score: number;
  status: string;
  created_at: string;
  updated_at: string;
  location?: { latitude: number; longitude: number; address?: string };
  ai_classification?: { category: string; confidence: number; keywords: string[] };
}

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  pending: { color: 'text-amber-700', bg: 'bg-amber-100', label: 'Pending' },
  in_progress: { color: 'text-blue-700', bg: 'bg-blue-100', label: 'In Progress' },
  escalated: { color: 'text-red-700', bg: 'bg-red-100', label: 'Escalated' },
  resolved: { color: 'text-green-700', bg: 'bg-green-100', label: 'Resolved' },
  closed: { color: 'text-gray-700', bg: 'bg-gray-100', label: 'Closed' },
};

export default function TrackComplaint() {
  const searchParams = useSearchParams();
  const complaintId = searchParams.get('id');
  const successMessage = searchParams.get('success');

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(complaintId || '');

  const fetchComplaint = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockComplaint: Complaint = {
        id,
        title: 'Large pothole on Main Street near intersection',
        description: 'There is a large pothole approximately 2 feet wide on Main Street, near the intersection with Oak Avenue.',
        category: 'pothole',
        severity: 'high',
        priority_score: 85,
        status: 'in_progress',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        location: { latitude: 40.7128, longitude: -74.0060, address: 'Main Street & Oak Avenue' },
        ai_classification: { category: 'pothole', confidence: 0.92, keywords: ['pothole', 'road', 'traffic'] }
      };

      setComplaint(mockComplaint);
    } catch (err) {
      setError('Failed to fetch complaint details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (complaintId) fetchComplaint(complaintId);
    else setLoading(false);
  }, [complaintId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      window.history.pushState({}, '', `?id=${searchInput}`);
      fetchComplaint(searchInput);
    }
  };

  const getPriorityColor = (score: number) => {
    if (score >= 80) return 'bg-red-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-green-500';
  };

  const currentStatus = complaint ? statusConfig[complaint.status] || statusConfig.pending : statusConfig.pending;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="text-sm">Back</span>
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Title */}
        <AnimatedSection delay={0.1} className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Track Your Complaint
          </h1>
          <p className="text-gray-500">Enter your complaint ID to check status</p>
        </AnimatedSection>

        {/* Success Message */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6"
            >
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-green-800">Complaint Submitted!</p>
                  <p className="text-sm text-green-600">Your complaint is being analyzed by AI</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Form */}
        <AnimatedSection delay={0.2} className="mb-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Enter complaint ID"
                className="glass-input pl-10"
              />
            </div>
            <GlowButton type="submit" disabled={!searchInput.trim()}>
              Search
            </GlowButton>
          </form>
        </AnimatedSection>

        {/* Loading */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AnimatedCard className="py-12 text-center">
                <Loader2 className="w-8 h-8 text-[#E60023] animate-spin mx-auto mb-3" />
                <p className="text-gray-500">Loading...</p>
              </AnimatedCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {error && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
                <p className="text-red-800 mb-3">{error}</p>
                <GlowButton variant="secondary" onClick={() => fetchComplaint(searchInput)}>
                  Try Again
                </GlowButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Complaint Details */}
        <AnimatePresence>
          {!loading && !error && complaint && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Main Card */}
              <AnimatedCard>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xs font-mono text-gray-500">{complaint.id}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${currentStatus.bg} ${currentStatus.color}`}>
                        {currentStatus.label}
                      </span>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">{complaint.title}</h2>
                  </div>
                  <div className="text-right">
                    <div className={`w-14 h-14 rounded-xl ${getPriorityColor(complaint.priority_score)} flex items-center justify-center`}>
                      <span className="text-xl font-bold text-white">{complaint.priority_score}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Priority</p>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4">{complaint.description}</p>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center text-gray-500 mb-1">
                      <Tag className="w-3 h-3 mr-1" />
                      <span className="text-xs">Category</span>
                    </div>
                    <p className="text-gray-900 flex items-center">
                      <span className="mr-1">{getCategoryIcon(complaint.category)}</span>
                      <span className="capitalize">{complaint.category.replace('_', ' ')}</span>
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center text-gray-500 mb-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      <span className="text-xs">Severity</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      complaint.severity === 'critical' ? 'bg-red-100 text-red-700' :
                      complaint.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {complaint.severity}
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center text-gray-500 mb-1">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span className="text-xs">Location</span>
                    </div>
                    <p className="text-gray-900 text-sm truncate">
                      {complaint.location?.address || 'Coordinates captured'}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center text-gray-500 mb-1">
                      <Clock className="w-3 h-3 mr-1" />
                      <span className="text-xs">Submitted</span>
                    </div>
                    <p className="text-gray-900">{timeAgo(complaint.created_at)}</p>
                  </div>
                </div>
              </AnimatedCard>

              {/* AI Analysis */}
              {complaint.ai_classification && (
                <AnimatedCard delay={0.1}>
                  <div className="flex items-center space-x-2 mb-4">
                    <Sparkles className="w-4 h-4 text-[#E60023]" />
                    <h3 className="font-medium text-gray-900">AI Analysis</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Keywords</p>
                      <div className="flex flex-wrap gap-2">
                        {complaint.ai_classification.keywords.map((keyword, index) => (
                          <span key={index} className="glass-badge">{keyword}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Confidence</p>
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${complaint.ai_classification.confidence * 100}%` }}
                            transition={{ duration: 0.8 }}
                            className="h-full bg-[#E60023] rounded-full"
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {Math.round(complaint.ai_classification.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>
              )}

              {/* Timeline */}
              <AnimatedCard delay={0.2}>
                <h3 className="font-medium text-gray-900 mb-4">Status Timeline</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Submitted</p>
                      <p className="text-sm text-gray-500">{formatDate(complaint.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                      complaint.status !== 'pending' ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <RefreshCw className={`w-4 h-4 ${complaint.status !== 'pending' ? 'text-blue-600' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <p className={`font-medium ${complaint.status !== 'pending' ? 'text-gray-900' : 'text-gray-400'}`}>
                        Under Review
                      </p>
                      <p className="text-sm text-gray-500">
                        {complaint.status !== 'pending' ? formatDate(complaint.updated_at) : 'Pending'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                      complaint.status === 'resolved' || complaint.status === 'closed' ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <CheckCircle className={`w-4 h-4 ${
                        complaint.status === 'resolved' || complaint.status === 'closed' ? 'text-green-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <p className={`font-medium ${
                        complaint.status === 'resolved' || complaint.status === 'closed' ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        Resolution
                      </p>
                      <p className="text-sm text-gray-500">
                        {complaint.status === 'resolved' || complaint.status === 'closed' ? 'Completed' : 'In Progress'}
                      </p>
                    </div>
                  </div>
                </div>
              </AnimatedCard>

              {/* Actions */}
              <div className="flex justify-between pt-2">
                <Link href="/complaint/submit">
                  <GlowButton variant="secondary">New Complaint</GlowButton>
                </Link>
                <GlowButton onClick={() => fetchComplaint(complaint.id)}>
                  <span className="flex items-center space-x-2">
                    <RefreshCw className="w-4 h-4" />
                    <span>Refresh</span>
                  </span>
                </GlowButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* No Complaint */}
        <AnimatePresence>
          {!loading && !error && !complaint && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <AnimatedCard className="py-12 text-center">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-medium text-gray-900 mb-1">No Complaint Selected</h3>
                <p className="text-sm text-gray-500">Enter an ID above to track status</p>
              </AnimatedCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
