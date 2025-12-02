import React, { useState, useCallback, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Shield, Brain, Activity, Zap, Upload, Mic, RefreshCw, Waves, Timer, Music, Cpu, Layers } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import RhythmAnalysisResults from "../components/rhythm/RhythmAnalysisResults";
import AudioConverter from "../components/analyze/AudioConverter";
import SearchHistory from "../components/shared/SearchHistory";
import { validateCSP, blockScriptInjection, validateFile } from "@/components/shared/SecurityValidator";
import { useMLDataCollector } from "@/components/shared/MLDataCollector";
import LiveSecurityDisplay from "@/components/shared/LiveSecurityDisplay";
import LiveThreatDisplay from "@/components/shared/LiveThreatDisplay";
import { useUsageLimits } from "@/components/shared/useUsageLimits";
import LimitLocker from "@/components/shared/LimitLocker";
import { NetworkErrorBanner, AILearningBanner } from "@/components/shared/NetworkErrorHandler";
import HolographicBackground from "@/components/shared/HolographicBackground";

export default function AnalyzeRhythmPage() {
  const navigate = useNavigate();
  const mlDataCollector = useMLDataCollector();
  
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  
  useEffect(() => {
    base44.auth.me().then(u => setCurrentUser(u)).catch(() => {});
    blockScriptInjection();
    validateCSP();
  }, []);

  return (
    // CYBERPUNK BASE - Deep Black/Green/Teal
    <div className="min-h-screen bg-[#030014] text-green-50 font-mono selection:bg-green-500/30 selection:text-green-100 overflow-x-hidden relative">
      
      <HolographicBackground />
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none z-[1]"></div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8 p-4 md:p-8">
        <NetworkErrorBanner />
        <AILearningBanner />
        <LimitLocker feature="advanced_analytics" key="RHYTHM_ANALYSIS" user={currentUser} />
        
        {/* HEADER */}
        <div className="flex items-center gap-4 border-b border-green-500/20 bg-green-950/10 backdrop-blur-sm rounded-xl p-6 shadow-2xl">
            <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl("Dashboard"))} className="text-green-400 hover:text-green-300 hover:bg-green-950/30 rounded-full border border-green-500/30 transition-all duration-300">
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl md:text-5xl font-black tracking-tight flex items-center gap-4">
                <Activity className="w-10 h-10 text-green-500 animate-pulse" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 uppercase">
                  RHYTHM DSP CORE
                </span>
              </h1>
              <p className="text-green-400/60 font-mono text-xs mt-2 uppercase tracking-widest">
                Groove Quantization • Beat Detection • Tempo Mapping
              </p>
            </div>
        </div>

        {/* STATUS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <Card className="bg-black/60 border border-teal-500/30 backdrop-blur-md rounded-xl group hover:bg-black/40 transition-all shadow-[0_0_20px_rgba(20,184,166,0.2)]">
                <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-teal-900/20 border border-teal-500/30 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(20,184,166,0.2)]">
                            <Brain className="w-8 h-8 text-teal-400 animate-pulse" />
                        </div>
                        <div>
                            <p className="text-teal-100 font-bold text-lg uppercase">Neural Engine</p>
                            <p className="text-teal-400/60 text-xs font-mono mt-1">&gt;&gt; ANALYZING MICRO-TIMING</p>
                        </div>
                    </div>
                    <Badge className="bg-teal-500/20 text-teal-400 border border-teal-500/50">ONLINE</Badge>
                </CardContent>
            </Card>

            <Card className="bg-black/60 border border-green-500/30 backdrop-blur-md rounded-xl group hover:bg-black/40 transition-all shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-green-900/20 border border-green-500/30 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                            <Shield className="w-8 h-8 text-green-400" />
                        </div>
                        <div>
                            <p className="text-green-100 font-bold text-lg uppercase">Secure Enclave</p>
                            <p className="text-green-400/60 text-xs font-mono mt-1">&gt;&gt; PROTOCOLS ACTIVE</p>
                        </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border border-green-500/50">SECURE</Badge>
                </CardContent>
            </Card>
        </div>

        <LiveSecurityDisplay />
        <LiveThreatDisplay />

        {/* MAIN INTERFACE */}
        {!analysis ? (
             <Card className="bg-black/60 border border-green-500/30 shadow-[0_0_40px_-10px_rgba(34,197,94,0.15)] backdrop-blur-xl rounded-xl overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-teal-500"></div>
                
                {/* Big Background Icon */}
                <Activity className="absolute -right-12 -bottom-12 w-64 h-64 text-green-500/5 rotate-12 pointer-events-none" />

                <CardContent className="p-12 flex flex-col items-center text-center relative z-10">
                    
                    {/* Diagram Injection */}
                    <div className="mb-8 p-4 bg-green-950/20 border border-green-500/20 flex items-center justify-center gap-4 w-full max-w-md rounded-lg backdrop-blur-sm">
                         <Waves className="w-6 h-6 text-green-400" />
                         <div className="text-[10px] text-green-400/70 border border-green-500/30 px-3 py-2 bg-black/30 font-mono rounded">
                            [Image of digital signal processing flow chart]
                        </div>
                        <span className="text-[9px] text-green-500/50 font-mono uppercase">DSP Flow</span>
                    </div>

                    {/* Upload Area with massive icon */}
                    <div className="border-2 border-dashed border-green-500/30 bg-green-950/10 p-12 w-full max-w-xl text-center hover:bg-green-950/20 hover:border-green-500/50 transition-all cursor-pointer group rounded-2xl relative overflow-hidden backdrop-blur-sm">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.1),transparent)] opacity:0 group-hover:opacity-100 transition-opacity"></div>
                        
                        <div className="w-24 h-24 bg-black/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30 group-hover:scale-110 transition-transform shadow-lg shadow-green-500/20">
                             <Upload className="w-12 h-12 text-green-500" />
                        </div>
                        <h3 className="text-green-100 font-bold text-2xl uppercase tracking-wide mb-2">Input Audio Stream</h3>
                        <p className="text-green-500/50 text-sm font-mono mb-8">WAV • FLAC • MP3 (32-BIT FLOAT)</p>
                        <Button className="bg-green-600 hover:bg-green-500 text-black font-bold uppercase tracking-widest text-sm h-14 px-10 border border-green-400 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                            <Zap className="w-4 h-4 mr-2" /> Initialize Upload
                        </Button>
                    </div>
                </CardContent>
             </Card>
        ) : (
            <RhythmAnalysisResults analysis={analysis} />
        )}
      </div>
    </div>
  );
}