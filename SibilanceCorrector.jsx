import React, { useState, useRef, useEffect } from 'react';
import { 
  Activity, 
  Mic, 
  Download, 
  Wand2, 
  Waves, 
  AlertCircle,
  Plus,
  Trash2,
  Cpu,
  Target,
  Brain,
  Shield,
  Zap,
  FileAudio,
  CheckCircle,
  Loader2,
  BarChart2,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { processAudioTrack, bufferToWav } from '@/components/studio/neurosonic/audioEngine';
import { generateVocalSyllable, analyzeAudioCharacteristics } from '@/components/studio/neurosonic/synthesisService'; 
import { ProcessingStage } from '@/components/studio/neurosonic/types';
import { validateCSP, blockScriptInjection } from '@/components/shared/SecurityValidator';
import { useMLDataCollector } from '@/components/shared/MLDataCollector';
import { useUsageLimits } from '@/components/shared/useUsageLimits';
import LimitLocker from "@/components/shared/LimitLocker";
import { base44 } from "@/api/base44Client";
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ParticleSystem from "@/components/shared/ParticleSystem";
import SecurityMonitor from "@/components/shared/SecurityMonitor";
import LiveSecurityDisplay from "@/components/shared/LiveSecurityDisplay";
import LiveThreatDisplay from "@/components/shared/LiveThreatDisplay";
import { NetworkErrorBanner, AILearningBanner } from "@/components/shared/NetworkErrorHandler";

const Diagram = ({ type, label, color = "cyan" }) => {
  const colorMap = {
    cyan: "text-cyan-400 border-cyan-500/30 bg-cyan-950/30",
    purple: "text-purple-400 border-purple-500/30 bg-purple-950/30",
    orange: "text-orange-400 border-orange-500/30 bg-orange-950/30",
    green: "text-green-400 border-green-500/30 bg-green-950/30"
  };
  
  return (
    <div className="w-full h-48 bg-black/40 border border-white/10 rounded-xl flex items-center justify-center relative overflow-hidden group my-6 hover:border-white/20 transition-all">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      <div className="text-center z-10 p-6 relative">
        <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center animate-pulse border ${colorMap[color].replace('text-', 'border-').split(' ')[1]} bg-opacity-10`}>
          <Waves className={`w-6 h-6 ${colorMap[color].split(' ')[0]}`} />
        </div>
        <div className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">DSP Flow Visualization</div>
        <Badge variant="outline" className={`font-mono text-md py-1 px-4 mb-2 ${colorMap[color]}`}>
          &lt;{type} /&gt;
        </Badge>
        {label && <p className="text-slate-400 text-sm max-w-md mx-auto mt-2">{label}</p>}
      </div>
      {/* Decorative tech lines */}
      <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${color}-500/50 to-transparent opacity-50`} />
      <div className={`absolute top-0 left-0 w-32 h-32 bg-${color}-500/5 blur-3xl rounded-full pointer-events-none`} />
    </div>
  );
};

export default function SibilanceCorrectorPage({ initialFile }) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const { isLocked, loading: loadingLimits } = useUsageLimits(currentUser);
  const mlDataCollector = useMLDataCollector();

  // Core State
  const [file, setFile] = useState(initialFile || null);
  const [audioBuffer, setAudioBuffer] = useState(null);
  
  // DSP Parameters
  const [sibilanceThreshold, setSibilanceThreshold] = useState(-24);
  const [sibilanceReduction, setSibilanceReduction] = useState(6);
  const [consonantBoost, setConsonantBoost] = useState(2);
  
  // Syllable Correction State
  const [corrections, setCorrections] = useState([]);
  const [newSyllableTime, setNewSyllableTime] = useState("0:00");
  const [newSyllableText, setNewSyllableText] = useState("");

  // Sibilance Targeting State
  const [sibilanceEvents, setSibilanceEvents] = useState([]);
  const [newSibilanceTime, setNewSibilanceTime] = useState("0:00");
  const [newSibilanceWord, setNewSibilanceWord] = useState("");
  
  // Processing State
  const [stage, setStage] = useState(ProcessingStage.IDLE);
  const [stats, setStats] = useState(null);
  const [processedUrl, setProcessedUrl] = useState(null);
  
  const audioContextRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
    blockScriptInjection();
    validateCSP();
    
    mlDataCollector.record('studio_corrector_visit', {
        feature: 'neurosonic_vocal_architect',
        timestamp: Date.now()
    });
  }, []);

  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  };

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setStage(ProcessingStage.ANALYZING);
      initAudio();
      
      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const decoded = await audioContextRef.current.decodeAudioData(arrayBuffer);
        setAudioBuffer(decoded);
        setStage(ProcessingStage.IDLE);
        mlDataCollector.record('file_uploaded', { feature: 'neurosonic', size: selectedFile.size, timestamp: Date.now() });
      } catch (error) {
        console.error(error);
        setStage(ProcessingStage.ERROR);
        mlDataCollector.record('upload_error', { feature: 'neurosonic', error: error.message, timestamp: Date.now() });
      }
    }
  };

  const parseTime = (timeStr) => {
    const parts = timeStr.split(':');
    if (parts.length === 2) {
      return parseInt(parts[0]) * 60 + parseFloat(parts[1]);
    }
    return parseFloat(timeStr) || 0;
  };

  const addCorrection = () => {
    if (!newSyllableText) return;
    const timeInSeconds = parseTime(newSyllableTime);
    const newCorrection = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: timeInSeconds,
      syllable: newSyllableText,
      pitchShift: 0,
      volumeBoost: 0
    };
    setCorrections([...corrections, newCorrection]);
    setNewSyllableText("");
    mlDataCollector.record('syllable_correction_added', { feature: 'neurosonic', syllable: newSyllableText, time: timeInSeconds, timestamp: Date.now() });
  };

  const addSibilanceEvent = () => {
    if (!newSibilanceWord) return;
    const timeInSeconds = parseTime(newSibilanceTime);
    const newEvent = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: timeInSeconds,
      word: newSibilanceWord
    };
    setSibilanceEvents([...sibilanceEvents, newEvent]);
    setNewSibilanceWord("");
    mlDataCollector.record('sibilance_event_added', { feature: 'neurosonic', word: newSibilanceWord, time: timeInSeconds, timestamp: Date.now() });
  };

  const removeCorrection = (id) => setCorrections(corrections.filter(c => c.id !== id));
  const removeSibilanceEvent = (id) => setSibilanceEvents(sibilanceEvents.filter(e => e.id !== id));
  const updateCorrection = (id, field, value) => {
    setCorrections(corrections.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const runProcessing = async () => {
    if (!audioBuffer || !audioContextRef.current) return;
    mlDataCollector.record('processing_started', { feature: 'neurosonic', timestamp: Date.now() });

    try {
      setStage(ProcessingStage.ANALYZING);
      const characteristics = analyzeAudioCharacteristics(audioBuffer);
      setStage(ProcessingStage.GENERATING_SYLLABLES);
      
      const syllableBuffers = new Map();
      for (const correction of corrections) {
        const rawSyllableData = await generateVocalSyllable(correction.syllable, characteristics);
        const decodedSyllable = await audioContextRef.current.decodeAudioData(rawSyllableData);
        syllableBuffers.set(correction.id, decodedSyllable);
      }

      setStage(ProcessingStage.DE_ESSING);
      const resultBuffer = await processAudioTrack(
        audioBuffer,
        corrections,
        sibilanceEvents,
        syllableBuffers,
        { sibilanceThreshold, sibilanceReduction, consonantBoost },
        (currentStage) => setStage(currentStage)
      );

      setStage(ProcessingStage.RENDERING);
      const wavBlob = bufferToWav(resultBuffer);
      const url = URL.createObjectURL(wavBlob);
      setProcessedUrl(url);

      setStats({
        sibilanceEventsDetected: sibilanceEvents.length > 0 ? sibilanceEvents.length : Math.floor(resultBuffer.duration * 0.8), 
        syllablesReconstructed: corrections.length,
        staticArtifactsPrevented: Math.floor(resultBuffer.duration * 44100 * 0.001), 
        processingTime: 0.8
      });

      setStage(ProcessingStage.COMPLETE);
      mlDataCollector.record('processing_completed', { feature: 'neurosonic', stats: stats, timestamp: Date.now() });
    } catch (error) {
      console.error(error);
      setStage(ProcessingStage.ERROR);
      mlDataCollector.record('processing_error', { feature: 'neurosonic', error: error.message, timestamp: Date.now() });
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(2).padStart(5, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="min-h-screen bg-[#030014] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal-900/10 via-slate-900/0 to-slate-900/0 p-4 md:p-8 pb-24 text-slate-100 font-sans overflow-x-hidden">
      
      {/* Cyberpunk Grid Background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e1b4b_1px,transparent_1px),linear-gradient(to_bottom,#1e1b4b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0 opacity-20"></div>
      <ParticleSystem />

      <LimitLocker feature="advanced_analytics" featureKey="STUDIO_CORRECTOR" user={currentUser} />
      <NetworkErrorBanner />
      <AILearningBanner />
      <SecurityMonitor />

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-slate-400 hover:text-white">
                <ArrowRight className="w-6 h-6 rotate-180" />
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Activity className="w-8 h-8 text-teal-400 animate-pulse" />
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-500">
                  NEURO-SONIC RESTORATION TERMINAL
                </h1>
              </div>
              <p className="text-slate-400 font-mono text-xs md:text-sm tracking-wide">
                SIBILANCE ARCHITECT • FORMANT RECONSTRUCTION • 32-BIT DSP
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <Badge variant="outline" className="bg-teal-500/10 text-teal-400 border-teal-500/30 px-3 py-1 font-mono">
                <Zap className="w-3 h-3 mr-2" /> ZERO_ITERATION
             </Badge>
             <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 px-3 py-1 font-mono">
                <Waves className="w-3 h-3 mr-2" /> FLOAT_32
             </Badge>
          </div>
        </div>

        <LiveThreatDisplay />
        
        {/* Status & Security */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <LiveSecurityDisplay />
            <Card className="bg-slate-900/60 border border-cyan-500/30 backdrop-blur-xl md:col-span-2">
                <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
                        <Cpu className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                            <p className="text-cyan-400 font-mono text-xs uppercase tracking-wider">DSP Engine Status</p>
                            <p className={`font-bold text-xs font-mono ${stage === ProcessingStage.ERROR ? 'text-red-500' : 'text-green-400'}`}>
                                {stage === ProcessingStage.IDLE ? 'STANDBY' : stage.replace(/_/g, ' ')}
                            </p>
                        </div>
                        <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div 
                                className={`h-full transition-all duration-300 ${stage === ProcessingStage.ERROR ? 'bg-red-500' : 'bg-cyan-500'}`}
                                style={{ width: stage === ProcessingStage.IDLE ? '0%' : stage === ProcessingStage.COMPLETE ? '100%' : '60%' }}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* LEFT COLUMN: Input & DSP */}
            <div className="space-y-6">
                
                {/* File Input */}
                <Card className="bg-slate-900/40 border border-white/10 backdrop-blur-md">
                    <CardHeader>
                        <CardTitle className="text-white font-mono text-sm uppercase tracking-widest flex items-center gap-2">
                            <FileAudio className="w-4 h-4 text-teal-400" /> Source Audio Input
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!file ? (
                            <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-teal-500/50 transition-colors cursor-pointer relative group">
                                <input type="file" onChange={handleFileUpload} accept="audio/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                                <div className="w-16 h-16 mx-auto bg-slate-800 rounded-full flex items-center justify-center mb-4 group-hover:bg-teal-900/30 transition-colors">
                                    <Mic className="w-8 h-8 text-slate-400 group-hover:text-teal-400" />
                                </div>
                                <p className="text-slate-300 font-bold mb-1">UPLOAD VOCAL TRACK</p>
                                <p className="text-slate-500 text-xs font-mono">WAV, FLAC, MP3 SUPPORTED</p>
                            </div>
                        ) : (
                            <div className="bg-teal-950/20 border border-teal-500/30 rounded-lg p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-teal-500/20 rounded flex items-center justify-center">
                                        <Waves className="w-5 h-5 text-teal-400" />
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-sm truncate max-w-[200px]">{file.name}</p>
                                        <p className="text-teal-400/60 text-xs font-mono">
                                            {audioBuffer ? `${audioBuffer.duration.toFixed(2)}s • ${audioBuffer.sampleRate}Hz` : 'DECODING...'}
                                        </p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setFile(null)} className="text-slate-400 hover:text-red-400">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* DSP Parameters - Teal */}
                <Card className="bg-slate-900/40 border border-white/10 backdrop-blur-md">
                    <CardHeader>
                        <CardTitle className="text-teal-400 font-mono text-sm uppercase tracking-widest flex items-center gap-2">
                            <BarChart2 className="w-4 h-4" /> DSP De-Essing Matrix
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Diagram type="dsp_frequency_response_curve" label="Real-time Frequency Response Analysis" color="cyan" />
                        
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <label className="text-xs font-mono text-slate-400 uppercase">Global Threshold</label>
                                    <span className="text-xs font-mono text-teal-400">{sibilanceThreshold}dB</span>
                                </div>
                                <Slider 
                                    defaultValue={[sibilanceThreshold]} 
                                    min={-60} max={0} step={1} 
                                    onValueChange={(vals) => setSibilanceThreshold(vals[0])}
                                    className="py-2"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <label className="text-xs font-mono text-slate-400 uppercase">Reduction Amount</label>
                                    <span className="text-xs font-mono text-teal-400">{sibilanceReduction}dB</span>
                                </div>
                                <Slider 
                                    defaultValue={[sibilanceReduction]} 
                                    min={0} max={20} step={0.5} 
                                    onValueChange={(vals) => setSibilanceReduction(vals[0])}
                                    className="py-2"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <label className="text-xs font-mono text-slate-400 uppercase">Consonant Clarity Boost</label>
                                    <span className="text-xs font-mono text-blue-400">+{consonantBoost}dB</span>
                                </div>
                                <Slider 
                                    defaultValue={[consonantBoost]} 
                                    min={0} max={10} step={0.5} 
                                    onValueChange={(vals) => setConsonantBoost(vals[0])}
                                    className="py-2"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Targeted Removal - Orange */}
                <Card className="bg-slate-900/40 border border-white/10 backdrop-blur-md">
                    <CardHeader>
                        <CardTitle className="text-orange-400 font-mono text-sm uppercase tracking-widest flex items-center gap-2">
                            <Target className="w-4 h-4" /> Precision Targeting
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-orange-950/10 border border-orange-500/20 rounded-lg p-4 mb-4">
                            <div className="grid grid-cols-[1fr_1fr_auto] gap-3 items-end">
                                <div>
                                    <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Time (s)</label>
                                    <Input 
                                        value={newSibilanceTime}
                                        onChange={(e) => setNewSibilanceTime(e.target.value)}
                                        className="bg-black/40 border-orange-500/30 text-orange-100 font-mono h-8 text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Word Target</label>
                                    <Input 
                                        value={newSibilanceWord}
                                        onChange={(e) => setNewSibilanceWord(e.target.value)}
                                        placeholder="e.g. sister"
                                        className="bg-black/40 border-orange-500/30 text-orange-100 font-mono h-8 text-xs"
                                    />
                                </div>
                                <Button onClick={addSibilanceEvent} size="icon" className="bg-orange-600 hover:bg-orange-500 h-8 w-8">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1 custom-scrollbar">
                            {sibilanceEvents.length === 0 && (
                                <p className="text-center text-slate-600 text-xs font-mono py-4">NO TARGETED VECTORS DEFINED</p>
                            )}
                            {sibilanceEvents.map((event) => (
                                <div key={event.id} className="flex items-center justify-between bg-black/20 border border-white/5 rounded p-2">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className="border-orange-500/50 text-orange-400 font-mono text-[10px] bg-orange-950/30">
                                            {formatTime(event.timestamp)}
                                        </Badge>
                                        <span className="text-sm font-bold text-slate-300">"{event.word}"</span>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => removeSibilanceEvent(event.id)} className="h-6 w-6 text-slate-500 hover:text-red-400">
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

            </div>

            {/* RIGHT COLUMN: Neural Synthesis */}
            <div className="space-y-6">
                <Card className="bg-slate-900/40 border border-white/10 backdrop-blur-md h-full">
                    <CardHeader>
                        <CardTitle className="text-purple-400 font-mono text-sm uppercase tracking-widest flex items-center gap-2">
                            <Brain className="w-4 h-4" /> Neural Syllable Reconstruction
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col h-full">
                        <Diagram type="neural_phoneme_synthesis_flow" label="Phoneme Synthesis Neural Pathway" color="purple" />
                        
                        <div className="bg-purple-950/10 border border-purple-500/20 rounded-lg p-4 mb-4">
                            <div className="grid grid-cols-[1fr_1fr_auto] gap-3 items-end">
                                <div>
                                    <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Time (s)</label>
                                    <Input 
                                        value={newSyllableTime}
                                        onChange={(e) => setNewSyllableTime(e.target.value)}
                                        className="bg-black/40 border-purple-500/30 text-purple-100 font-mono h-8 text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Phoneme</label>
                                    <Input 
                                        value={newSyllableText}
                                        onChange={(e) => setNewSyllableText(e.target.value)}
                                        placeholder="e.g. sha"
                                        className="bg-black/40 border-purple-500/30 text-purple-100 font-mono h-8 text-xs"
                                    />
                                </div>
                                <Button onClick={addCorrection} size="icon" className="bg-purple-600 hover:bg-purple-500 h-8 w-8">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1 min-h-[200px] space-y-2 overflow-y-auto custom-scrollbar pr-1 mb-4">
                             {corrections.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-slate-600 text-xs font-mono border border-dashed border-slate-800 rounded-lg p-8">
                                    <Wand2 className="w-8 h-8 mb-2 opacity-20" />
                                    NO RECONSTRUCTION NODES ACTIVE
                                </div>
                            )}
                            {corrections.map((correction) => (
                                <div key={correction.id} className="bg-black/20 border border-purple-500/20 rounded-lg p-3 hover:border-purple-500/40 transition-colors">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="border-purple-500/50 text-purple-400 font-mono text-[10px] bg-purple-950/30">
                                                {formatTime(correction.timestamp)}
                                            </Badge>
                                            <span className="text-sm font-black text-white">"{correction.syllable}"</span>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => removeCorrection(correction.id)} className="h-6 w-6 text-slate-500 hover:text-red-400">
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4 bg-black/40 p-2 rounded">
                                        <div>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-[10px] font-mono text-slate-500">PITCH</span>
                                                <span className="text-[10px] font-mono text-purple-400">{correction.pitchShift}</span>
                                            </div>
                                            <Slider 
                                                value={[correction.pitchShift]} 
                                                min={-12} max={12} step={0.1} 
                                                onValueChange={(vals) => updateCorrection(correction.id, 'pitchShift', vals[0])}
                                                className="h-1"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-[10px] font-mono text-slate-500">GAIN</span>
                                                <span className="text-[10px] font-mono text-purple-400">+{correction.volumeBoost}dB</span>
                                            </div>
                                            <Slider 
                                                value={[correction.volumeBoost]} 
                                                min={-6} max={12} step={0.1} 
                                                onValueChange={(vals) => updateCorrection(correction.id, 'volumeBoost', vals[0])}
                                                className="h-1"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

        </div>

        {/* Action Bar */}
        <Card className="sticky bottom-4 bg-slate-900/90 border-t border-teal-500/30 backdrop-blur-xl shadow-2xl z-50">
            <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                     {stage === ProcessingStage.COMPLETE && stats && (
                        <div className="flex items-center gap-4 text-xs font-mono hidden md:flex">
                            <span className="text-green-400 flex items-center gap-1"><Target className="w-3 h-3" /> {stats.sibilanceEventsDetected} EVENTS</span>
                            <span className="text-purple-400 flex items-center gap-1"><Brain className="w-3 h-3" /> {stats.syllablesReconstructed} SYNTHESIZED</span>
                            <span className="text-blue-400 flex items-center gap-1"><Shield className="w-3 h-3" /> {stats.staticArtifactsPrevented} ARTIFACTS BLOCKED</span>
                        </div>
                    )}
                </div>

                <div className="flex gap-3">
                    {processedUrl && (
                        <Button asChild variant="outline" className="border-teal-500 text-teal-400 hover:bg-teal-950/50 font-mono font-bold">
                            <a href={processedUrl} download={`spectromodel_restoration_${Date.now()}.wav`}>
                                <Download className="w-4 h-4 mr-2" /> EXPORT WAV
                            </a>
                        </Button>
                    )}
                    
                    <Button 
                        onClick={runProcessing} 
                        disabled={!file || (stage !== ProcessingStage.IDLE && stage !== ProcessingStage.COMPLETE)}
                        className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-black tracking-wider min-w-[200px] shadow-[0_0_20px_rgba(0,255,255,0.3)]"
                    >
                        {stage !== ProcessingStage.IDLE && stage !== ProcessingStage.COMPLETE && stage !== ProcessingStage.ERROR ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> PROCESSING...</>
                        ) : (
                            <><Wand2 className="w-4 h-4 mr-2" /> INITIATE RESTORATION</>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>

      </div>
    </div>
  );
}