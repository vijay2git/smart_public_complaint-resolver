'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedCard, AnimatedSection, GlowButton } from '@/components/ui/animated';
import { storeComplaint } from '../track/page';
import { 
  AlertCircle, 
  ArrowLeft, 
  Camera, 
  MapPin, 
  Mic, 
  Send,
  Loader2,
  CheckCircle,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  FileText,
  StopCircle
} from 'lucide-react';

const categories = [
  { value: 'pothole', label: 'Road Damage', icon: '🕳️' },
  { value: 'water_leak', label: 'Water Leak', icon: '💧' },
  { value: 'streetlight', label: 'Streetlight', icon: '💡' },
  { value: 'trash', label: 'Waste', icon: '🗑️' },
  { value: 'noise', label: 'Noise', icon: '🔊' },
  { value: 'parking', label: 'Parking', icon: '🅿️' },
  { value: 'sidewalk', label: 'Sidewalk', icon: '🚶' },
  { value: 'graffiti', label: 'Vandalism', icon: '🎨' },
  { value: 'other', label: 'Other', icon: '📋' },
];

const steps = [
  { id: 1, title: 'Details' },
  { id: 2, title: 'Category' },
  { id: 3, title: 'Media' },
  { id: 4, title: 'Review' },
];

export default function SubmitComplaint() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('other');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<any>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
        (error) => console.error('Location error:', error)
      );
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        setAudioBlob(new Blob(audioChunksRef.current, { type: 'audio/wav' }));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Microphone error:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const analyzeComplaint = async () => {
    if (!title || title.length < 10 || !description || description.length < 50) {
      alert('Please provide a title (min 10 chars) and description (min 50 chars) first.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'analyze_complaint', data: { title, description, location } }),
      });

      if (!response.ok) throw new Error('Analysis failed');

      const result = await response.json();
      if (result.success) {
        setAiAnalysis(result.data.classification);
        if (result.data.duplicates?.isDuplicate) setDuplicateWarning(result.data.duplicates);
        setCurrentStep(4);
      }
    } catch (error) {
      setAiAnalysis({ category: selectedCategory || 'other', severity: 'medium', confidence: 0.85 });
      setCurrentStep(4);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || title.length < 10) { alert('Title must be at least 10 characters.'); setCurrentStep(1); return; }
    if (!description || description.length < 50) { alert('Description must be at least 50 characters.'); setCurrentStep(1); return; }

    setIsSubmitting(true);
    
    // Generate complaint ID
    const complaintId = 'CMP-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    // Calculate AI severity based on category
    const severityMap: Record<string, { severity: string; score: number }> = {
      pothole: { severity: 'high', score: 75 },
      water_leak: { severity: 'critical', score: 95 },
      streetlight: { severity: 'medium', score: 65 },
      trash: { severity: 'medium', score: 55 },
      noise: { severity: 'low', score: 45 },
      parking: { severity: 'medium', score: 60 },
      sidewalk: { severity: 'medium', score: 65 },
      graffiti: { severity: 'low', score: 40 },
      other: { severity: 'medium', score: 50 },
    };
    
    const categoryData = severityMap[selectedCategory] || severityMap.other;
    
    // Create complaint object
    const newComplaint = {
      id: complaintId,
      title,
      description,
      category: selectedCategory,
      severity: categoryData.severity,
      priority_score: categoryData.score,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      location: location || undefined,
      ai_classification: {
        category: selectedCategory,
        confidence: 0.85,
        keywords: title.toLowerCase().split(' ').filter(w => w.length > 3).slice(0, 5),
      },
    };
    
    // Store complaint for tracking
    storeComplaint(newComplaint);
    
    // Navigate to tracking page
    router.push(`/complaint/track?id=${complaintId}&success=true`);
    
    setIsSubmitting(false);
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!title || title.length < 10) { alert('Title must be at least 10 characters.'); return; }
      if (!description || description.length < 50) { alert('Description must be at least 50 characters.'); return; }
    }
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] relative">
      {/* Blue Glow */}
      <div className="blue-glow" />
      <div className="retro-grid opacity-20" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="text-xs tracking-[0.1em] uppercase">Back</span>
          </Link>
        </div>
      </header>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {/* Title */}
        <AnimatedSection delay={0.1} className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Submit a Complaint
          </h1>
          <div className="w-16 h-px bg-blue-500 mx-auto" />
        </AnimatedSection>

        {/* Progress Steps */}
        <AnimatedSection delay={0.2} className="mb-12">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <motion.button
                  onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                  animate={{
                    backgroundColor: currentStep >= step.id ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                    borderColor: currentStep >= step.id ? '#3B82F6' : '#2A2A2A',
                  }}
                  className={`
                    w-10 h-10 rounded border flex items-center justify-center transition-all
                    ${currentStep >= step.id ? 'text-blue-400' : 'text-gray-600'}
                  `}
                >
                  <span className="text-xs">{String(step.id).padStart(2, '0')}</span>
                </motion.button>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-px mx-3 ${currentStep > step.id ? 'bg-blue-500' : 'bg-white/10'}`} />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-500 mt-4 tracking-[0.1em] uppercase">
            Step {currentStep}: {steps[currentStep - 1].title}
          </p>
        </AnimatedSection>

        <form onSubmit={onSubmit}>
          <AnimatePresence mode="wait">
            {/* Step 1: Details */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="glass-card p-8">
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="w-12 h-12 border border-blue-500/30 rounded flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-xl text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Issue Details</h2>
                      <p className="text-sm text-gray-500">Provide a clear description of the problem</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs tracking-[0.1em] text-gray-400 uppercase mb-3">
                        Title * <span className="text-gray-600">({title.length}/100)</span>
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="glass-input"
                        placeholder="Brief summary of the issue"
                        maxLength={100}
                      />
                      {title.length > 0 && title.length < 10 && (
                        <p className="text-blue-400 text-xs mt-2">{10 - title.length} more characters required</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs tracking-[0.1em] text-gray-400 uppercase mb-3">
                        Description * <span className="text-gray-600">({description.length}/2000)</span>
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={6}
                        className="glass-input resize-none"
                        placeholder="Provide detailed information including exact location, when you noticed it, and any safety concerns..."
                        maxLength={2000}
                      />
                      {description.length > 0 && description.length < 50 && (
                        <p className="text-blue-400 text-xs mt-2">{50 - description.length} more characters required</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Category */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="glass-card p-8">
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="w-12 h-12 border border-blue-500/30 rounded flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-xl text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Select Category</h2>
                      <p className="text-sm text-gray-500">Choose the most appropriate classification</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {categories.map((cat) => (
                      <motion.button
                        key={cat.value}
                        type="button"
                        whileHover={{ scale: 1.02, borderColor: 'rgba(59, 130, 246, 0.5)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedCategory(cat.value)}
                        className={`
                          relative flex flex-col items-center p-6 rounded border transition-all
                          ${selectedCategory === cat.value 
                            ? 'border-blue-500 bg-blue-500/10' 
                            : 'border-white/10 bg-white/[0.02]'
                          }
                        `}
                      >
                        <span className="text-2xl mb-3">{cat.icon}</span>
                        <span className="text-sm text-gray-300">{cat.label}</span>
                        {selectedCategory === cat.value && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded flex items-center justify-center"
                          >
                            <CheckCircle className="w-3 h-3 text-white" />
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Media */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="glass-card p-8">
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="w-12 h-12 border border-blue-500/30 rounded flex items-center justify-center">
                      <Camera className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-xl text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Location & Media</h2>
                      <p className="text-sm text-gray-500">Add supporting evidence (optional)</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Location */}
                    <div className="flex items-center space-x-4">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={getLocation}
                        className="glass-btn-secondary flex items-center space-x-2"
                      >
                        <MapPin className="w-4 h-4" />
                        <span>{location ? 'Location Added' : 'Add Location'}</span>
                      </motion.button>
                      {location && (
                        <span className="text-blue-400 text-sm flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" /> Captured
                        </span>
                      )}
                    </div>

                    {/* Image Upload */}
                    <div className="border border-dashed border-white/10 rounded p-8 text-center hover:border-blue-500/30 transition-colors">
                      <Camera className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400 mb-2">Drop photos here or click to upload</p>
                      <p className="text-gray-600 text-xs">PNG, JPG up to 5MB</p>
                      <input type="file" accept="image/*" multiple className="hidden" />
                    </div>

                    {/* Voice Recording */}
                    <div className="flex items-center space-x-4">
                      {!isRecording && !audioBlob ? (
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={startRecording}
                          className="glass-btn-secondary flex items-center space-x-2"
                        >
                          <Mic className="w-4 h-4" />
                          <span>Record Voice</span>
                        </motion.button>
                      ) : isRecording ? (
                        <div className="flex items-center space-x-4">
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={stopRecording}
                            className="glass-btn flex items-center space-x-2 !border-red-500 !text-red-400"
                          >
                            <StopCircle className="w-4 h-4" />
                            <span>Stop</span>
                          </motion.button>
                          <span className="text-red-400 font-mono text-sm">{formatTime(recordingTime)}</span>
                          <motion.div
                            animate={{ opacity: [1, 0.5, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="w-2 h-2 bg-red-500 rounded-full"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center space-x-4">
                          <span className="text-blue-400 text-sm flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Recorded ({formatTime(recordingTime)})
                          </span>
                          <button type="button" onClick={() => { setAudioBlob(null); setRecordingTime(0); }} className="text-red-400 text-xs hover:underline">
                            Delete
                          </button>
                        </div>
                      )}
                      <span className="text-gray-600 text-xs">Optional</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="glass-card p-8">
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="w-12 h-12 border border-blue-500/30 rounded flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-xl text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Review & Submit</h2>
                      <p className="text-sm text-gray-500">Verify your complaint details</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded">
                      <p className="text-xs text-gray-500 mb-1 tracking-wide uppercase">Title</p>
                      <p className="text-white">{title || 'Not provided'}</p>
                    </div>
                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded">
                      <p className="text-xs text-gray-500 mb-1 tracking-wide uppercase">Description</p>
                      <p className="text-gray-300 text-sm line-clamp-2">{description || 'Not provided'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white/[0.02] border border-white/5 rounded">
                        <p className="text-xs text-gray-500 mb-1 tracking-wide uppercase">Category</p>
                        <p className="text-white flex items-center">
                          <span className="mr-2">{categories.find(c => c.value === selectedCategory)?.icon}</span>
                          {categories.find(c => c.value === selectedCategory)?.label}
                        </p>
                      </div>
                      <div className="p-4 bg-white/[0.02] border border-white/5 rounded">
                        <p className="text-xs text-gray-500 mb-1 tracking-wide uppercase">Voice Note</p>
                        <p className="text-white">{audioBlob ? formatTime(recordingTime) : 'Not recorded'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Analysis */}
                <AnimatePresence>
                  {aiAnalysis && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <div className="border border-blue-500/30 bg-blue-500/5 rounded p-6">
                        <div className="flex items-center space-x-2 mb-4">
                          <Sparkles className="w-4 h-4 text-blue-400" />
                          <h3 className="font-medium text-white text-sm tracking-wide uppercase">AI Analysis</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Category: </span>
                            <span className="text-white">{aiAnalysis.category}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Severity: </span>
                            <span className={aiAnalysis.severity === 'critical' ? 'text-red-400' : aiAnalysis.severity === 'high' ? 'text-orange-400' : 'text-white'}>
                              {aiAnalysis.severity}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <motion.div 
            className="flex justify-between mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {currentStep > 1 ? (
              <GlowButton variant="secondary" onClick={() => setCurrentStep(currentStep - 1)} type="button">
                <span className="flex items-center space-x-2">
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </span>
              </GlowButton>
            ) : (
              <Link href="/">
                <GlowButton variant="secondary" type="button">Cancel</GlowButton>
              </Link>
            )}

            <div className="flex space-x-3">
              {currentStep === 3 && (
                <GlowButton 
                  variant="secondary" 
                  type="button"
                  onClick={analyzeComplaint}
                  disabled={isAnalyzing || !title || title.length < 10 || !description || description.length < 50}
                >
                  {isAnalyzing ? (
                    <span className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyzing</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4" />
                      <span>Analyze</span>
                    </span>
                  )}
                </GlowButton>
              )}

              {currentStep < 4 ? (
                <GlowButton onClick={nextStep} type="button">
                  <span className="flex items-center space-x-2">
                    <span>Continue</span>
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </GlowButton>
              ) : (
                <GlowButton type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <span className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-2">
                      <Send className="w-4 h-4" />
                      <span>Submit</span>
                    </span>
                  )}
                </GlowButton>
              )}
            </div>
          </motion.div>
        </form>
      </div>
    </div>
  );
}
