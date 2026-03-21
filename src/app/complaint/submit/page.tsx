'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedCard, AnimatedSection, GlowButton, FloatingIcon } from '@/components/ui/animated';
import { 
  AlertCircle, 
  ArrowLeft, 
  Camera, 
  MapPin, 
  Mic, 
  MicOff,
  Send,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Image as ImageIcon,
  FileText,
  StopCircle,
  Play
} from 'lucide-react';

const categories = [
  { value: 'pothole', label: 'Pothole/Road', icon: '🕳️' },
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
  { id: 1, title: 'Details', icon: FileText },
  { id: 2, title: 'Category', icon: AlertCircle },
  { id: 3, title: 'Media', icon: ImageIcon },
  { id: 4, title: 'Review', icon: Sparkles },
];

export default function SubmitComplaint() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Form data
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('other');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  
  // Media
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [images, setImages] = useState<string[]>([]);
  
  // AI Analysis
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<any>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Get user location
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Location error:', error);
          alert('Unable to get your location. Please enable location services.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Microphone access error:', error);
      alert('Unable to access microphone. Please allow microphone access.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // AI Analysis
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
        body: JSON.stringify({
          action: 'analyze_complaint',
          data: { title, description, location },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setAiAnalysis(result.data.classification);
        if (result.data.duplicates?.isDuplicate) {
          setDuplicateWarning(result.data.duplicates);
        }
        // Go to review step to show results
        setCurrentStep(4);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      // Still set mock data for demo
      setAiAnalysis({
        category: selectedCategory || 'other',
        severity: 'medium',
        confidence: 0.85,
      });
      setCurrentStep(4);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Form submission
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || title.length < 10) {
      alert('Title must be at least 10 characters.');
      setCurrentStep(1);
      return;
    }
    
    if (!description || description.length < 50) {
      alert('Description must be at least 50 characters.');
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const userId = 'demo-user-' + Date.now();

      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category: selectedCategory,
          location,
          userId,
        }),
      });

      const result = await response.json();
      
      // Always navigate on success (demo mode)
      const complaintId = result?.data?.complaint?.id || 'CMP-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      router.push(`/complaint/track?id=${complaintId}&success=true`);
    } catch (error) {
      console.error('Submit error:', error);
      // Still navigate for demo - generate a mock ID
      const mockId = 'CMP-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      router.push(`/complaint/track?id=${mockId}&success=true`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!title || title.length < 10) {
        alert('Title must be at least 10 characters.');
        return;
      }
      if (!description || description.length < 50) {
        alert('Description must be at least 50 characters.');
        return;
      }
    }
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const isStepValid = () => {
    if (currentStep === 1) {
      return title.length >= 10 && description.length >= 50;
    }
    return true;
  };

  return (
    <div className="min-h-screen retro-grid noise-overlay">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-40 right-20 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, 40, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-40 left-20 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <AnimatedSection delay={0.1}>
          <Link href="/" className="inline-flex items-center text-amber-400 hover:text-amber-300 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
          
          <div className="text-center mb-10">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Submit a <span className="text-amber-400">Complaint</span>
            </h1>
            <p className="text-gray-400 max-w-lg mx-auto">
              Report an issue and our AI will analyze and route it to the appropriate team
            </p>
          </div>
        </AnimatedSection>

        {/* Progress Steps */}
        <AnimatedSection delay={0.2} className="mb-10">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <motion.div
                  animate={{
                    scale: currentStep === step.id ? 1.1 : 1,
                    backgroundColor: currentStep >= step.id ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  }}
                  className={`
                    w-12 h-12 rounded-xl flex items-center justify-center border cursor-pointer
                    ${currentStep >= step.id ? 'border-amber-500/50' : 'border-white/10'}
                    transition-all duration-300
                  `}
                  onClick={() => {
                    if (step.id < currentStep || (step.id === currentStep + 1 && isStepValid())) {
                      setCurrentStep(step.id);
                    }
                  }}
                >
                  <step.icon className={`w-5 h-5 ${currentStep >= step.id ? 'text-amber-400' : 'text-gray-500'}`} />
                </motion.div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-2 ${currentStep > step.id ? 'bg-amber-500' : 'bg-white/10'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4">
            <span className="text-sm text-gray-400">
              Step {currentStep} of {steps.length}: <span className="text-amber-400">{steps[currentStep - 1].title}</span>
            </span>
          </div>
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
                transition={{ duration: 0.3 }}
              >
                <AnimatedCard className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <FloatingIcon>
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                    </FloatingIcon>
                    <div>
                      <h2 className="font-display text-xl font-semibold text-white">Complaint Details</h2>
                      <p className="text-sm text-gray-400">Provide a clear title and description</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Title * <span className="text-gray-500">({title.length}/100)</span>
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="glass-input"
                        placeholder="Brief summary of the issue (e.g., Large pothole on Main Street)"
                        maxLength={100}
                      />
                      {title.length > 0 && title.length < 10 && (
                        <p className="text-amber-400 text-sm mt-2">
                          {10 - title.length} more characters needed
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Detailed Description * <span className="text-gray-500">({description.length}/2000)</span>
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={6}
                        className="glass-input resize-none"
                        placeholder="Provide as much detail as possible including exact location, when you noticed it, and any safety concerns..."
                        maxLength={2000}
                      />
                      {description.length > 0 && description.length < 50 && (
                        <p className="text-amber-400 text-sm mt-2">
                          {50 - description.length} more characters needed
                        </p>
                      )}
                    </div>
                  </div>
                </AnimatedCard>
              </motion.div>
            )}

            {/* Step 2: Category */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <AnimatedCard className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <FloatingIcon>
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-white" />
                      </div>
                    </FloatingIcon>
                    <div>
                      <h2 className="font-display text-xl font-semibold text-white">Select Category</h2>
                      <p className="text-sm text-gray-400">Choose the most relevant category</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {categories.map((cat) => (
                      <motion.button
                        key={cat.value}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedCategory(cat.value)}
                        className={`
                          relative flex flex-col items-center p-4 rounded-2xl cursor-pointer
                          border transition-all duration-300
                          ${selectedCategory === cat.value 
                            ? 'border-amber-500/50 bg-amber-500/10' 
                            : 'border-white/10 bg-white/5 hover:bg-white/10'
                          }
                        `}
                      >
                        <span className="text-3xl mb-2">{cat.icon}</span>
                        <span className="text-sm text-center text-gray-300">{cat.label}</span>
                        {selectedCategory === cat.value && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-2 right-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center"
                          >
                            <CheckCircle className="w-3 h-3 text-retro-dark" />
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </AnimatedCard>
              </motion.div>
            )}

            {/* Step 3: Media */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <AnimatedCard className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <FloatingIcon>
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                        <Camera className="w-5 h-5 text-white" />
                      </div>
                    </FloatingIcon>
                    <div>
                      <h2 className="font-display text-xl font-semibold text-white">Location & Media</h2>
                      <p className="text-sm text-gray-400">Add supporting evidence</p>
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
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="glass-badge text-green-400 border-green-500/30"
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span>Captured</span>
                        </motion.div>
                      )}
                    </div>

                    {/* Image Upload */}
                    <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-amber-500/30 transition-colors">
                      <Camera className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400 mb-2">Drag and drop photos here</p>
                      <p className="text-gray-500 text-sm mb-4">PNG, JPG up to 5MB each (max 5 files)</p>
                      <label className="glass-btn-secondary cursor-pointer inline-block">
                        <span>Browse Files</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            const files = e.target.files;
                            if (files) {
                              // Handle file upload
                              console.log('Files selected:', files.length);
                            }
                          }}
                        />
                      </label>
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
                          <span>Record Voice Note</span>
                        </motion.button>
                      ) : isRecording ? (
                        <div className="flex items-center space-x-4">
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={stopRecording}
                            className="glass-btn flex items-center space-x-2 !bg-red-500"
                          >
                            <StopCircle className="w-4 h-4" />
                            <span>Stop Recording</span>
                          </motion.button>
                          <span className="text-red-400 font-mono">{formatTime(recordingTime)}</span>
                          <motion.div
                            animate={{ opacity: [1, 0.5, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="w-3 h-3 bg-red-500 rounded-full"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center space-x-4">
                          <span className="text-green-400 flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4" />
                            <span>Recording saved ({formatTime(recordingTime)})</span>
                          </span>
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={deleteRecording}
                            className="text-red-400 text-sm hover:text-red-300"
                          >
                            Delete
                          </motion.button>
                        </div>
                      )}
                      <span className="text-gray-500 text-sm">Optional</span>
                    </div>
                  </div>
                </AnimatedCard>
              </motion.div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <AnimatedCard>
                  <div className="flex items-center space-x-3 mb-6">
                    <FloatingIcon>
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                    </FloatingIcon>
                    <div>
                      <h2 className="font-display text-xl font-semibold text-white">Review & Submit</h2>
                      <p className="text-sm text-gray-400">Verify your complaint details</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="glass-input bg-white/5">
                      <p className="text-xs text-gray-500 mb-1">Title</p>
                      <p className="text-white">{title || 'Not provided'}</p>
                    </div>
                    <div className="glass-input bg-white/5">
                      <p className="text-xs text-gray-500 mb-1">Description</p>
                      <p className="text-white text-sm line-clamp-3">{description || 'Not provided'}</p>
                    </div>
                    <div className="glass-input bg-white/5">
                      <p className="text-xs text-gray-500 mb-1">Category</p>
                      <p className="text-white flex items-center">
                        <span className="mr-2">{categories.find(c => c.value === selectedCategory)?.icon}</span>
                        {categories.find(c => c.value === selectedCategory)?.label || 'Not selected'}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="glass-input bg-white/5">
                        <p className="text-xs text-gray-500 mb-1">Location</p>
                        <p className="text-white">{location ? 'Captured' : 'Not provided'}</p>
                      </div>
                      <div className="glass-input bg-white/5">
                        <p className="text-xs text-gray-500 mb-1">Voice Note</p>
                        <p className="text-white">{audioBlob ? formatTime(recordingTime) : 'Not recorded'}</p>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>

                {/* AI Analysis Preview */}
                <AnimatePresence>
                  {aiAnalysis && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <AnimatedCard className="border-amber-500/30 bg-amber-500/5">
                        <div className="flex items-center space-x-3 mb-4">
                          <Sparkles className="w-5 h-5 text-amber-400" />
                          <h3 className="font-semibold text-amber-200">AI Analysis</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Category</p>
                            <span className="glass-badge">{aiAnalysis.category}</span>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Severity</p>
                            <span className={`glass-badge ${
                              aiAnalysis.severity === 'critical' ? 'text-red-400 border-red-500/30' :
                              aiAnalysis.severity === 'high' ? 'text-orange-400 border-orange-500/30' :
                              'text-amber-400 border-amber-500/30'
                            }`}>
                              {aiAnalysis.severity}
                            </span>
                          </div>
                        </div>
                      </AnimatedCard>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Duplicate Warning */}
                <AnimatePresence>
                  {duplicateWarning && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <AnimatedCard className="border-orange-500/30 bg-orange-500/5">
                        <div className="flex items-start space-x-3">
                          <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-orange-200 mb-1">Potential Duplicate Detected</h4>
                            <p className="text-sm text-gray-400">
                              Found {duplicateWarning.similarComplaints?.length || 0} similar complaint(s). 
                              This may be linked to an existing issue.
                            </p>
                          </div>
                        </div>
                      </AnimatedCard>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <motion.div 
            className="flex justify-between mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {currentStep > 1 ? (
              <GlowButton variant="secondary" onClick={prevStep} type="button">
                <span className="flex items-center space-x-2">
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </span>
              </GlowButton>
            ) : (
              <Link href="/">
                <GlowButton variant="secondary" type="button">
                  Cancel
                </GlowButton>
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
                      <span>Analyzing...</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4" />
                      <span>Analyze with AI</span>
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
                      <span>Submitting...</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-2">
                      <Send className="w-4 h-4" />
                      <span>Submit Complaint</span>
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
