'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedCard, AnimatedSection, GlowButton } from '@/components/ui/animated';
import { 
  AlertCircle, 
  BarChart3, 
  Clock, 
  RefreshCw,
  Search,
  CheckCircle,
  AlertTriangle,
  Eye,
  Sparkles,
  X,
  Bell,
  Mail
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
  user: { email: string; full_name?: string };
  ai_classification?: { confidence: number; keywords: string[] };
}

const statusConfig: Record<string, { bg: string; color: string; label: string }> = {
  pending: { bg: 'bg-amber-100', color: 'text-amber-700', label: 'Pending' },
  in_progress: { bg: 'bg-blue-100', color: 'text-blue-700', label: 'In Progress' },
  escalated: { bg: 'bg-red-100', color: 'text-red-700', label: 'Escalated' },
  resolved: { bg: 'bg-green-100', color: 'text-green-700', label: 'Resolved' },
  closed: { bg: 'bg-gray-100', color: 'text-gray-700', label: 'Closed' },
};

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', search: '' });
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [stats, setStats] = useState({ total: 156, pending: 42, inProgress: 28, escalated: 8, resolved: 78 });

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const mockComplaints: Complaint[] = [
        { id: 'CMP-001', title: 'Large pothole on Main Street', description: 'Dangerous pothole...', category: 'pothole', severity: 'high', priority_score: 92, status: 'pending', created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), updated_at: new Date().toISOString(), user: { email: 'john@example.com', full_name: 'John Doe' }, ai_classification: { confidence: 0.95, keywords: ['pothole', 'traffic'] } },
        { id: 'CMP-002', title: 'Water leak from fire hydrant', description: 'Leaking water...', category: 'water_leak', severity: 'critical', priority_score: 98, status: 'pending', created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), updated_at: new Date().toISOString(), user: { email: 'jane@example.com', full_name: 'Jane Smith' }, ai_classification: { confidence: 0.92, keywords: ['water', 'leak'] } },
        { id: 'CMP-003', title: 'Broken streetlight at Park', description: 'Streetlight out...', category: 'streetlight', severity: 'medium', priority_score: 75, status: 'in_progress', created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), updated_at: new Date().toISOString(), user: { email: 'mike@example.com', full_name: 'Mike Wilson' }, ai_classification: { confidence: 0.88, keywords: ['streetlight', 'broken'] } },
        { id: 'CMP-004', title: 'Overflowing trash bins', description: 'Multiple bins...', category: 'trash', severity: 'medium', priority_score: 68, status: 'pending', created_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), updated_at: new Date().toISOString(), user: { email: 'sarah@example.com', full_name: 'Sarah Jones' }, ai_classification: { confidence: 0.91, keywords: ['trash', 'overflow'] } },
      ];

      setComplaints(mockComplaints);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaints(); }, []);

  const filteredComplaints = complaints.filter(c => {
    if (filters.status && c.status !== filters.status) return false;
    if (filters.search && !c.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const handleStatusChange = async (complaintId: string, newStatus: string) => {
    setComplaints(complaints.map(c => 
      c.id === complaintId ? { ...c, status: newStatus, updated_at: new Date().toISOString() } : c
    ));
    
    try {
      await fetch('/api/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'advance', data: { complaintId } }),
      });
    } catch (error) {
      console.error('Email trigger failed:', error);
    }
  };

  const getPriorityColor = (score: number) => {
    if (score >= 80) return 'bg-red-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#E60023] flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Complaint Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link href="/">
                <GlowButton variant="secondary" className="!px-4 !py-2 text-sm">Home</GlowButton>
              </Link>
              <GlowButton onClick={fetchComplaints} className="!px-4 !py-2 text-sm">
                <span className="flex items-center space-x-1">
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </span>
              </GlowButton>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <AnimatedSection delay={0.1} className="mb-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: 'Total', value: stats.total, icon: BarChart3, color: 'bg-gray-100' },
              { label: 'Pending', value: stats.pending, icon: Clock, color: 'bg-amber-100' },
              { label: 'In Progress', value: stats.inProgress, icon: RefreshCw, color: 'bg-blue-100' },
              { label: 'Escalated', value: stats.escalated, icon: AlertTriangle, color: 'bg-red-100' },
              { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'bg-green-100' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl p-4 border border-gray-100"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">{stat.label}</span>
                  <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-4 h-4 text-gray-600" />
                  </div>
                </div>
                <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Complaint Queue */}
          <div className="lg:col-span-2">
            <AnimatedCard delay={0.2}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Complaint Queue</h2>
                  <p className="text-sm text-gray-500">{filteredComplaints.length} complaints</p>
                </div>
                <div className="relative mt-3 md:mt-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="glass-input !py-2 !px-9 text-sm w-full md:w-48"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-2 mb-4">
                {['', 'pending', 'in_progress', 'escalated', 'resolved'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilters({ ...filters, status })}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      filters.status === status
                        ? 'bg-[#E60023] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {status ? status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'All'}
                  </button>
                ))}
              </div>

              {/* List */}
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-6 h-6 text-[#E60023] animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Loading...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredComplaints.map((complaint, index) => {
                    const status = statusConfig[complaint.status] || statusConfig.pending;
                    return (
                      <motion.div
                        key={complaint.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => setSelectedComplaint(complaint)}
                        className={`
                          p-4 rounded-2xl border cursor-pointer transition-all
                          ${selectedComplaint?.id === complaint.id 
                            ? 'border-[#E60023] bg-red-50' 
                            : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                          }
                        `}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-xs font-mono text-gray-400">{complaint.id}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                                {status.label}
                              </span>
                            </div>
                            <h3 className="font-medium text-gray-900 truncate">{complaint.title}</h3>
                            <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                              <span>{getCategoryIcon(complaint.category)} {complaint.category.replace('_', ' ')}</span>
                              <span>•</span>
                              <span>{complaint.user.full_name || complaint.user.email}</span>
                              <span>•</span>
                              <span>{timeAgo(complaint.created_at)}</span>
                            </div>
                          </div>
                          <div className={`w-12 h-12 rounded-xl ${getPriorityColor(complaint.priority_score)} flex items-center justify-center ml-3`}>
                            <span className="text-sm font-bold text-white">{complaint.priority_score}</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </AnimatedCard>
          </div>

          {/* Detail Panel */}
          <div>
            <AnimatePresence mode="wait">
              {selectedComplaint ? (
                <motion.div
                  key={selectedComplaint.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <AnimatedCard>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Details</h3>
                      <button
                        onClick={() => setSelectedComplaint(null)}
                        className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">{selectedComplaint.title}</h4>
                        <p className="text-sm text-gray-600">{selectedComplaint.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="p-2 bg-gray-50 rounded-xl">
                          <p className="text-xs text-gray-500">Category</p>
                          <p className="font-medium capitalize">{selectedComplaint.category.replace('_', ' ')}</p>
                        </div>
                        <div className="p-2 bg-gray-50 rounded-xl">
                          <p className="text-xs text-gray-500">Severity</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            selectedComplaint.severity === 'critical' ? 'bg-red-100 text-red-700' :
                            selectedComplaint.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {selectedComplaint.severity}
                          </span>
                        </div>
                        <div className="p-2 bg-gray-50 rounded-xl">
                          <p className="text-xs text-gray-500">Priority</p>
                          <p className="text-xl font-bold">{selectedComplaint.priority_score}</p>
                        </div>
                        <div className="p-2 bg-gray-50 rounded-xl">
                          <p className="text-xs text-gray-500">Citizen</p>
                          <p className="font-medium truncate">{selectedComplaint.user.full_name || 'N/A'}</p>
                        </div>
                      </div>

                      {/* Email Status */}
                      <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                        <div className="flex items-center space-x-2 mb-1">
                          <Mail className="w-4 h-4 text-blue-600" />
                          <p className="text-xs font-medium text-blue-700">Email Notifications</p>
                        </div>
                        <p className="text-xs text-blue-600">
                          {selectedComplaint.status === 'pending' ? '✓ Received email sent' :
                           selectedComplaint.status === 'in_progress' ? '✓ Review & Work Started emails sent' :
                           selectedComplaint.status === 'resolved' ? '✓ All emails completed' :
                           'Auto-scheduled'}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="space-y-2 pt-2">
                        <GlowButton 
                          onClick={() => handleStatusChange(selectedComplaint.id, 'in_progress')}
                          disabled={selectedComplaint.status === 'in_progress' || selectedComplaint.status === 'resolved'}
                          className="w-full !py-2 text-sm"
                        >
                          Start Work (sends email)
                        </GlowButton>
                        <GlowButton 
                          variant="secondary"
                          onClick={() => handleStatusChange(selectedComplaint.id, 'resolved')}
                          disabled={selectedComplaint.status === 'resolved'}
                          className="w-full !py-2 text-sm"
                        >
                          Mark Resolved (sends email)
                        </GlowButton>
                        <button
                          onClick={() => handleStatusChange(selectedComplaint.id, 'escalated')}
                          className="w-full py-2 rounded-2xl border-2 border-red-200 text-red-600 hover:bg-red-50 transition-colors text-sm font-medium"
                        >
                          Escalate
                        </button>
                      </div>
                    </div>
                  </AnimatedCard>
                </motion.div>
              ) : (
                <AnimatedCard className="py-12 text-center">
                  <Eye className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <h3 className="font-medium text-gray-900 mb-1">Select a Complaint</h3>
                  <p className="text-sm text-gray-500">Click to view details</p>
                </AnimatedCard>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
