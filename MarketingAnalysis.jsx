import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Zap, Users, Globe, Layers, TrendingUp, Share2, Target, Megaphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { validateCSP, blockScriptInjection } from '@/components/shared/SecurityValidator';
import { useMLDataCollector } from '@/components/shared/MLDataCollector';
import LimitLocker from "@/components/shared/LimitLocker";
import { base44 } from "@/api/base44Client";
import { AILearningBanner, NetworkErrorBanner } from "@/components/shared/NetworkErrorHandler";
import LiveSecurityDisplay from "@/components/shared/LiveSecurityDisplay";
import LiveThreatDisplay from "@/components/shared/LiveThreatDisplay";
import AIResolver from '@/components/shared/AIResolver';

export default function MarketingAnalysisPage() {
  const navigate = useNavigate();
  const mlDataCollector = useMLDataCollector();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        blockScriptInjection();
        validateCSP();

        mlDataCollector.record('marketing_analysis_visit', {
          feature: 'marketing_analysis',
          timestamp: Date.now()
        });
      } catch (error) {
        console.error('Init failed:', error);
      } finally {
        if (mounted) setIsPageLoading(false);
      }
    };

    init();
    return () => { mounted = false; };
  }, []);

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-pink-400 animate-spin" />
      </div>
    );
  }

  return (
    // CYBERPUNK BASE - DEEP VOID BACKGROUND
    <div className="min-h-screen bg-[#030014] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-900/20 via-slate-900/0 to-slate-900/0 p-4 md:p-8 pb-8 text-cyan-50 font-sans selection:bg-pink-500/30 selection:text-pink-100">
      
      {/* Decorative Grid Overlay - NEON BLUE/PINK VECTORS */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none z-0"></div>
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0"></div>

      <LimitLocker feature="marketing_analysis" featureKey="MARKET_RESEARCH" user={currentUser} />
      
      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        <NetworkErrorBanner />
        <AILearningBanner />

        {/* HEADER */}
        <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="text-pink-400 hover:text-pink-300 hover:bg-pink-950/30 rounded-full transition-all duration-300"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight flex items-center gap-4">
              <Megaphone className="w-10 h-10 text-pink-500" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-500 to-cyan-500 animate-pulse">
                STRATEGIC GROWTH TERMINAL
              </span>
            </h1>
            <p className="text-slate-400 uppercase tracking-widest text-xs font-semibold mt-2">
              Viral Loops • Demographics • Platform Strategy • Release Architecture
            </p>
          </div>
        </div>

        {/* STATUS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LiveSecurityDisplay />
            <LiveThreatDisplay />
        </div>

        {/* MAIN LAYOUT - GLASSMORPHIC PANELS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN - VIRAL POTENTIAL (PINK) */}
            <Card className="bg-black/60 border border-pink-500/30 shadow-[0_0_30px_-10px_rgba(236,72,153,0.2)] backdrop-blur-xl rounded-2xl overflow-hidden lg:col-span-1">
                <CardHeader className="border-b border-white/5 bg-white/5 p-6">
                    <CardTitle className="text-white flex items-center gap-3 text-xl font-bold uppercase tracking-wide">
                        <Zap className="w-6 h-6 text-pink-400" />
                        Viral Potential
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <span className="text-pink-300 text-sm font-mono">VIRALITY SCORE</span>
                        <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/50">HIGH VELOCITY</Badge>
                    </div>
                    <div className="text-5xl font-black text-white tracking-tighter">
                        87<span className="text-2xl text-pink-500/50">/100</span>
                    </div>
                    
                    {/* DIAGRAM: VIRAL LOOP */}
                    <div className="p-4 bg-slate-950/50 border border-pink-500/20 rounded-lg flex flex-col items-center justify-center min-h-[120px]">
                         <div className="text-[10px] text-pink-400/70 border border-pink-500/30 rounded px-2 py-1 bg-pink-900/10 font-mono mb-2">
                            [Image of viral loop mechanism diagram]
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-pink-400 font-mono uppercase">
                            <Share2 className="w-3 h-3" />
                            <span>Feedback Loop Active</span>
                        </div>
                    </div>
                    
                    <p className="text-slate-400 text-xs leading-relaxed">
                        High probability of exponential growth detected. K-factor estimated at 1.4 based on current engagement metrics.
                    </p>
                </CardContent>
            </Card>

            {/* MIDDLE COLUMN - TARGET DEMOGRAPHICS (BLUE) */}
            <Card className="bg-black/60 border border-blue-500/30 shadow-lg backdrop-blur-xl rounded-2xl overflow-hidden lg:col-span-1">
                <CardHeader className="border-b border-white/5 bg-white/5 p-6">
                    <CardTitle className="text-white flex items-center gap-3 text-xl font-bold uppercase tracking-wide">
                        <Users className="w-6 h-6 text-blue-400" />
                        Target Demographics
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                     {/* DIAGRAM: DEMOGRAPHICS CHART */}
                    <div className="p-4 bg-slate-950/50 border border-blue-500/20 rounded-lg flex flex-col items-center justify-center min-h-[160px]">
                         <div className="text-[10px] text-blue-400/70 border border-blue-500/30 rounded px-2 py-1 bg-blue-900/10 font-mono mb-2">
                            [Image of social media platform demographics chart]
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-blue-400 font-mono uppercase">
                            <Target className="w-3 h-3" />
                            <span>Audience Segmentation</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-900/10 p-3 rounded border border-blue-500/20">
                            <div className="text-blue-300 text-xs font-bold mb-1">PRIMARY AGE</div>
                            <div className="text-white text-lg font-black">18-24</div>
                        </div>
                        <div className="bg-blue-900/10 p-3 rounded border border-blue-500/20">
                            <div className="text-blue-300 text-xs font-bold mb-1">LOCATION</div>
                            <div className="text-white text-lg font-black">GLOBAL</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* RIGHT COLUMN - PLATFORM STRATEGY (CYAN) */}
            <Card className="bg-black/60 border border-cyan-500/30 shadow-lg backdrop-blur-xl rounded-2xl overflow-hidden lg:col-span-1">
                <CardHeader className="border-b border-white/5 bg-white/5 p-6">
                    <CardTitle className="text-white flex items-center gap-3 text-xl font-bold uppercase tracking-wide">
                        <Globe className="w-6 h-6 text-cyan-400" />
                        Platform Strategy
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-cyan-950/30 rounded border border-cyan-500/20">
                            <span className="text-cyan-100 font-bold text-sm">TikTok</span>
                            <Badge className="bg-cyan-500 text-black font-bold">PRIORITY #1</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-cyan-950/20 rounded border border-cyan-500/10">
                            <span className="text-cyan-100 font-bold text-sm">Instagram Reels</span>
                            <Badge variant="outline" className="text-cyan-400 border-cyan-500/50">SECONDARY</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-cyan-950/20 rounded border border-cyan-500/10">
                            <span className="text-cyan-100 font-bold text-sm">YouTube Shorts</span>
                            <Badge variant="outline" className="text-cyan-400 border-cyan-500/50">SUPPORT</Badge>
                        </div>
                    </div>
                    <p className="text-slate-400 text-xs mt-4">
                        Algorithm optimization suggests short-form video content as the primary growth driver.
                    </p>
                </CardContent>
            </Card>

            {/* BOTTOM SECTION - CAMPAIGN IDEAS (PURPLE) */}
            <div className="lg:col-span-3">
                <Card className="bg-black/60 border border-purple-500/30 shadow-lg backdrop-blur-xl rounded-2xl overflow-hidden">
                    <CardHeader className="border-b border-white/5 bg-white/5 p-6">
                        <CardTitle className="text-white flex items-center gap-3 text-xl font-bold uppercase tracking-wide">
                            <Layers className="w-6 h-6 text-purple-400" />
                            Campaign Architecture
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            <div className="space-y-4">
                                <div className="p-4 bg-purple-900/10 border border-purple-500/20 rounded-lg">
                                    <h4 className="text-purple-300 font-bold text-sm mb-2">PHASE 1: TEASER</h4>
                                    <p className="text-slate-300 text-xs">15s audio snippets on TikTok trending sounds.</p>
                                </div>
                                <div className="p-4 bg-purple-900/10 border border-purple-500/20 rounded-lg">
                                    <h4 className="text-purple-300 font-bold text-sm mb-2">PHASE 2: LAUNCH</h4>
                                    <p className="text-slate-300 text-xs">Cross-platform challenge with influencer seeding.</p>
                                </div>
                            </div>
                            
                            {/* DIAGRAM: MARKETING FUNNEL */}
                            <div className="p-4 bg-slate-950/50 border border-purple-500/20 rounded-lg flex flex-col items-center justify-center min-h-[200px]">
                                 <div className="text-[10px] text-purple-400/70 border border-purple-500/30 rounded px-2 py-1 bg-purple-900/10 font-mono mb-2">
                                    {/* Marketing Funnel Diagram Placeholder */}
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mb-2 mx-auto opacity-50">
                                        <path d="M22 3L2 3L10 12L10 19L14 21L14 12L22 3Z" />
                                    </svg>
                                    [Image of marketing funnel visualization]
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-purple-400 font-mono uppercase">
                                    <TrendingUp className="w-3 h-3" />
                                    <span>Conversion Pipeline</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>

        <AIResolver context={{ feature: 'marketing_analysis' }} />
      </div>
    </div>
  );
}