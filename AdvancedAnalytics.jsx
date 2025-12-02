import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Shield, Sparkles, Megaphone, Heart, Brain, LayoutGrid } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { validateCSP, blockScriptInjection } from '@/components/shared/SecurityValidator';
import { useMLDataCollector } from '@/components/shared/MLDataCollector';
import { useUsageLimits } from '@/components/shared/useUsageLimits';
import LimitLocker from "@/components/shared/LimitLocker";
import { base44 } from "@/api/base44Client";
import LiveSecurityDisplay from '@/components/shared/LiveSecurityDisplay';
import LiveThreatDisplay from '@/components/shared/LiveThreatDisplay';

export default function AdvancedAnalyticsPage() {
  const navigate = useNavigate();
  const mlDataCollector = useMLDataCollector();
  const [securityStatus, setSecurityStatus] = useState({ safe: true, threats: 0, mlComplexity: 0 });
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const { isLocked, loading: loadingLimits } = useUsageLimits(currentUser);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  // Lock enforcement handled by LimitLocker


  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        blockScriptInjection();
        const cspResult = validateCSP();
        if (mounted) {
          setSecurityStatus({ safe: cspResult.valid, threats: cspResult.violations?.length || 0, mlComplexity: cspResult.mlComplexity || 0 });
        }
        mlDataCollector.record('advanced_analytics_visit', { feature: 'advanced_analytics', timestamp: Date.now() });
      } catch (error) {
        console.error('Init failed:', error);
      } finally {
        if (mounted) setIsPageLoading(false);
      }
    };
    init();
    return () => { mounted = false; };
  }, []);

  const handleNavigation = (path) => {
    mlDataCollector.record('analytics_navigation', { feature: 'advanced_analytics', destination: path, timestamp: Date.now() });
    navigate(createPageUrl(path));
  };

  if (isPageLoading) return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center"><Loader2 className="w-16 h-16 text-purple-400 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-8 pb-8">
      <LimitLocker feature="advanced_analytics" featureKey="ADVANCED_ANALYTICS" user={currentUser} />
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-3xl sm:text-4xl font-black text-white bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Advanced Analytics</h1>
          <Button onClick={() => navigate(createPageUrl("Dashboard"))} className="bg-gradient-to-r from-blue-600 to-purple-600 z-base"><ArrowLeft className="w-4 h-4 mr-2" />Dashboard</Button>
        </div>
        <Card className="bg-black/40 backdrop-blur-xl border-l-4 border-l-cyan-500 border-y-0 border-r-0 shadow-2xl shadow-cyan-900/20 rounded-xl overflow-hidden relative group hover:shadow-cyan-500/10 transition-all duration-500 z-cards">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-950/30 via-transparent to-transparent opacity-100" />
          <CardContent className="p-4 relative z-10">
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-cyan-400 animate-pulse" />
              <div className="flex-1">
                <p className="text-white font-bold text-sm">🤖 AI Learns From Your Data</p>
                <p className="text-xs text-cyan-400/80">Training on analytics patterns • ML complexity: {securityStatus.mlComplexity.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <LiveSecurityDisplay />
        
        <LiveThreatDisplay />
        <Card className="bg-black/40 backdrop-blur-xl border border-purple-900/30 shadow-[0_0_40px_-10px_rgba(147,51,234,0.1)] rounded-2xl overflow-hidden z-cards">
          <CardHeader className="border-b border-purple-900/20 bg-purple-950/5 p-6">
            <CardTitle className="text-white font-bold text-xl flex items-center gap-2"><LayoutGrid className="w-6 h-6 text-purple-400" /> Select Analysis Type</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card onClick={() => handleNavigation('CreativeAnalysis')} className="cursor-pointer bg-black/40 backdrop-blur-xl border border-purple-900/30 hover:border-purple-500/50 hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.15)] transition-all duration-300 group z-base">
                <CardContent className="p-6">
                  <div className="p-3 rounded-xl bg-purple-950/30 w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Sparkles className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-white font-bold text-xl mb-2 group-hover:text-purple-300 transition-colors">Creative Insights</h3>
                  <p className="text-slate-400 text-sm">AI-powered creative analysis with spectrogram visualization</p>
                </CardContent>
              </Card>
              
              <Card onClick={() => handleNavigation('MarketingAnalysis')} className="cursor-pointer bg-black/40 backdrop-blur-xl border border-blue-900/30 hover:border-blue-500/50 hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.15)] transition-all duration-300 group z-base">
                <CardContent className="p-6">
                  <div className="p-3 rounded-xl bg-blue-950/30 w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Megaphone className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="text-white font-bold text-xl mb-2 group-hover:text-blue-300 transition-colors">Marketing Strategy</h3>
                  <p className="text-slate-400 text-sm">Marketing insights with audio frequency analysis</p>
                </CardContent>
              </Card>
              
              <Card onClick={() => handleNavigation('CognitiveAnalysis')} className="cursor-pointer bg-black/40 backdrop-blur-xl border border-purple-900/30 hover:border-purple-500/50 hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.15)] transition-all duration-300 group z-base">
                <CardContent className="p-6">
                  <div className="p-3 rounded-xl bg-purple-950/30 w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Brain className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-white font-bold text-xl mb-2 group-hover:text-purple-300 transition-colors">Cognitive Impact</h3>
                  <p className="text-slate-400 text-sm">Neural response and attention analysis</p>
                </CardContent>
              </Card>
              
              <Card onClick={() => handleNavigation('EmotionalAnalysis')} className="cursor-pointer bg-black/40 backdrop-blur-xl border border-blue-900/30 hover:border-blue-500/50 hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.15)] transition-all duration-300 group z-base">
                <CardContent className="p-6">
                  <div className="p-3 rounded-xl bg-blue-950/30 w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Heart className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="text-white font-bold text-xl mb-2 group-hover:text-blue-300 transition-colors">Emotional Response</h3>
                  <p className="text-slate-400 text-sm">Emotional engagement and mood analysis</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}