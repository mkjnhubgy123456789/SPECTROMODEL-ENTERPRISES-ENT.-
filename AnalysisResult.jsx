import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import AnalysisResults from "../components/analyze/AnalysisResults";
import RhythmAnalysisResults from "../components/rhythm/RhythmAnalysisResults";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, Cpu, ArrowLeft, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useMLDataCollector } from "../components/shared/MLDataCollector";
import { validateCSP, blockScriptInjection } from "../components/shared/SecurityValidator";
import { NetworkErrorBanner, AILearningBanner } from "../components/shared/NetworkErrorHandler";

export default function AnalysisResultPage() {
    const navigate = useNavigate();
    const mlDataCollector = useMLDataCollector();
    const [analysis, setAnalysis] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isPolling, setIsPolling] = useState(false);

    // Security & AI Learning Initialization
    useEffect(() => {
        blockScriptInjection();
        validateCSP();
        mlDataCollector.record('page_view', { 
            page: 'AnalysisResult',
            timestamp: Date.now() 
        });
    }, [mlDataCollector]);

    const loadAnalysis = useCallback(async (id, isRecursiveCall = false) => {
        if (!isRecursiveCall) {
            setIsLoading(true);
            setError(null);
        }
        try {
            const results = await base44.entities.MusicAnalysis.filter({ id: id });
            const data = results && results.length > 0 ? results[0] : null;
            
            if (data) {
                if (data.status === 'processing') {
                    setIsPolling(true);
                    setTimeout(() => loadAnalysis(id, true), 3000); // Poll every 3s
                    setAnalysis(data); 
                } else {
                    setAnalysis(data);
                    setIsPolling(false);
                    
                    if (!isRecursiveCall) {
                        mlDataCollector.record('analysis_loaded', { 
                            id: data.id, 
                            type: data.analysis_type 
                        });
                    }
                }
            } else {
                setError("Analysis data could not be located in the neural core.");
                setIsPolling(false);
            }
        } catch (err) {
            console.error("Failed to load analysis:", err);
            setError("Connection to analysis mainframe failed.");
            setIsPolling(false);
        } finally {
            if (!isRecursiveCall) {
                setIsLoading(false);
            }
        }
    }, [mlDataCollector]); 
    
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        if (id) {
            loadAnalysis(id);
        } else {
            setError("Missing Analysis ID Protocol.");
            setIsLoading(false);
        }
    }, [loadAnalysis]);

    // WRAPPER: Common Cyberpunk Background
    const PageWrapper = ({ children }) => (
        <div className="min-h-screen bg-[#030014] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900/0 to-slate-900/0 p-4 md:p-8 text-cyan-50">
             {/* Decorative Grid Overlay */}
             <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none z-0"></div>
             <div className="relative z-10 max-w-7xl mx-auto">
                <NetworkErrorBanner />
                <AILearningBanner />
                {children}
             </div>
        </div>
    );

    // STATE: LOADING (System Boot)
    if (isLoading) {
        return (
            <PageWrapper>
                <div className="space-y-8 animate-pulse">
                    <div className="flex items-center gap-4">
                         <Skeleton className="h-12 w-12 rounded-full bg-slate-800/50" />
                         <Skeleton className="h-10 w-1/3 bg-slate-800/50" />
                    </div>
                    <Skeleton className="h-64 w-full rounded-xl bg-slate-800/30 border border-slate-700/30" />
                    <div className="grid md:grid-cols-3 gap-6">
                        <Skeleton className="h-48 w-full bg-slate-800/30 border border-slate-700/30 rounded-xl" />
                        <Skeleton className="h-48 w-full md:col-span-2 bg-slate-800/30 border border-slate-700/30 rounded-xl" />
                    </div>
                    <div className="text-center font-mono text-xs text-cyan-500/50 mt-4">
                        INITIALIZING DATA STREAMS...
                    </div>
                </div>
            </PageWrapper>
        );
    }

    // STATE: ERROR (System Failure)
    if (error) {
        return (
            <PageWrapper>
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <Card className="max-w-md w-full bg-red-950/20 border border-red-500/50 backdrop-blur-xl shadow-[0_0_30px_rgba(220,38,38,0.2)]">
                        <CardContent className="p-8 flex flex-col items-center text-center">
                            <AlertCircle className="w-16 h-16 text-red-500 mb-6 animate-pulse" />
                            <h2 className="text-2xl font-black text-white mb-2 tracking-widest uppercase">System Malfunction</h2>
                            <p className="text-red-200 font-mono text-sm mb-6">{error}</p>
                            <Button 
                                onClick={() => navigate(createPageUrl("Dashboard"))}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold tracking-wide"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                RETURN TO DASHBOARD
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </PageWrapper>
        );
    }
    
    // STATE: PROCESSING (Neural Network Active)
    if (analysis?.status === 'processing' || isPolling) {
        return (
            <PageWrapper>
                <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-8">
                    <div className="relative">
                        {/* Outer Glow Ring */}
                        <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full opacity-20 blur-xl animate-pulse"></div>
                        <Loader2 className="w-24 h-24 animate-spin text-cyan-400 relative z-10" />
                        <Cpu className="w-8 h-8 text-purple-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20" />
                    </div>
                    
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-purple-400 animate-pulse">
                            PROCESSING NEURAL DATA
                        </h1>
                        <p className="text-slate-400 font-mono text-sm tracking-widest">
                            TARGET: <span className="text-cyan-300">"{analysis?.track_name || 'UNKNOWN'}"</span>
                        </p>
                    </div>

                    <Card className="bg-black/50 border border-cyan-500/30 max-w-lg w-full backdrop-blur-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between text-xs font-mono text-cyan-500/70 mb-2">
                                <span>DSP ANALYSIS</span>
                                <span className="animate-pulse">RUNNING...</span>
                            </div>
                            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 w-2/3 animate-[progress_2s_ease-in-out_infinite]"></div>
                            </div>
                            <p className="text-xs text-slate-500 mt-4">
                                This interface will refresh automatically upon completion.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </PageWrapper>
        );
    }

    // STATE: SUCCESS (Render Child Components)
    if (analysis) {
        // Logic to determine which view to show
        const isRhythmOnly = analysis.analysis_type === 'rhythm' || (analysis.rhythm_analysis && !analysis.hit_score);
        
        return (
            <PageWrapper>
                {isRhythmOnly ? (
                    <RhythmAnalysisResults
                        result={analysis}
                        onNewAnalysis={() => navigate(createPageUrl("AnalyzeRhythm"))}
                        onBackToDashboard={() => navigate(createPageUrl("Dashboard"))}
                    />
                ) : (
                    <AnalysisResults
                        analysis={analysis}
                        onNewAnalysis={() => navigate(createPageUrl("Analyze"))}
                        onBackToDashboard={() => navigate(createPageUrl("Dashboard"))}
                    />
                )}
            </PageWrapper>
        );
    }

    return null;
}