import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Briefcase, DollarSign, Target, Users, ExternalLink, TrendingUp, PieChart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import LimitLocker from "@/components/shared/LimitLocker";
import { base44 } from "@/api/base44Client";
import { AILearningBanner, NetworkErrorBanner } from "@/components/shared/NetworkErrorHandler";
import { useMLDataCollector } from "@/components/shared/MLDataCollector";
import LiveSecurityDisplay from "@/components/shared/LiveSecurityDisplay";
import LiveThreatDisplay from "@/components/shared/LiveThreatDisplay";

export default function BusinessInsightsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const mlDataCollector = useMLDataCollector();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    
    // Log page visit
    mlDataCollector.record('business_insights_visit', {
      feature: 'business_insights',
      timestamp: Date.now()
    });
  }, []);

  const insights = [
    {
      title: "Licensing & Publishing Matrix",
      description: "Analysis of sync licensing opportunities, mechanical royalties, and global publishing administration deals.",
      icon: DollarSign,
      color: "text-green-400",
      borderColor: "border-green-500/30",
      url: "https://www.ascap.com/help/music-business-101",
      hasDiagram: true // Diagram flag
    },
    {
      title: "Revenue Model Architecture",
      description: "Strategic breakdown of streaming royalties (0.003-0.005/stream), touring margins, and merchandise scaling.",
      icon: Target,
      color: "text-purple-400",
      borderColor: "border-purple-500/30",
      url: "https://www.hypebot.com/"
    },
    {
      title: "Audience Acquisition Vectors",
      description: "Tactical frameworks for social media growth, TikTok viral mechanics, and influencer partnership structures.",
      icon: Users,
      color: "text-blue-400",
      borderColor: "border-blue-500/30",
      url: "https://blog.hootsuite.com/music-marketing/"
    },
    {
      title: "Capital & Funding Protocols",
      description: "Intelligence on label advances, independent distributor funding, and venture capital injection points.",
      icon: Briefcase,
      color: "text-orange-400",
      borderColor: "border-orange-500/30",
      url: "https://www.musicbusinessworldwide.com/"
    }
  ];

  return (
    // CYBERPUNK BASE
    <div className="min-h-screen bg-[#030014] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900/0 to-slate-900/0 p-4 md:p-8 pb-8 text-cyan-50 font-sans selection:bg-purple-500/30 selection:text-purple-100">
      
      {/* Decorative Grid Overlay */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none z-0"></div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-8">
        <NetworkErrorBanner />
        <AILearningBanner />
        <LimitLocker feature="Business Insights" featureKey="INDUSTRY_INSIGHTS" user={user} />

        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                mlDataCollector.record('navigation_back', {
                    feature: 'business_insights',
                    destination: 'Dashboard',
                    timestamp: Date.now()
                });
                navigate(createPageUrl("Dashboard"));
              }}
              className="text-purple-400 hover:text-purple-300 hover:bg-purple-950/30 rounded-full transition-all duration-300"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight flex items-center gap-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 animate-pulse">
                  STRATEGIC COMMAND
                </span>
              </h1>
              <p className="text-slate-400 uppercase tracking-widest text-xs font-semibold">
                Revenue Architecture & Industry Intelligence
              </p>
            </div>
          </div>
        </div>

        {/* THREAT/SECURITY DISPLAY */}
        <LiveSecurityDisplay />
        <LiveThreatDisplay />

        {/* INSIGHTS GRID */}
        <div className="grid md:grid-cols-2 gap-6">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <Card key={index} className={`bg-black/60 border ${insight.borderColor} shadow-[0_0_20px_-5px_rgba(0,0,0,0.3)] backdrop-blur-xl rounded-2xl overflow-hidden hover:bg-black/80 transition-all duration-300 group`}>
                <CardHeader className="p-6 border-b border-white/5">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl bg-slate-900/50 border ${insight.borderColor}`}>
                      <Icon className={`w-6 h-6 ${insight.color}`} />
                    </div>
                    <Badge variant="outline" className={`font-mono text-xs ${insight.color} border-${insight.color.split('-')[1]}-500/30`}>
                      INTEL
                    </Badge>
                  </div>
                  <CardTitle className="text-white text-xl font-bold mt-4 uppercase tracking-wide">
                    {insight.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-slate-400 mb-6 text-sm leading-relaxed font-light">
                    {insight.description}
                  </p>

                  {/* Diagram Injection for Revenue Models */}
                  {insight.hasDiagram && (
                    <div className="mb-6 p-4 bg-slate-900/50 border border-slate-800 rounded-lg flex items-center gap-3">
                        <PieChart className="w-5 h-5 text-green-400" />
                        <div className="flex-1">
                            <p className="text-[10px] text-green-300 font-mono uppercase mb-1">Visual Data:</p>
                            <div className="text-[10px] text-slate-500 border border-slate-700 rounded px-2 py-1 inline-block bg-black/50">
                                LIVE GRAPH
                            </div>
                        </div>
                    </div>
                  )}

                  <Button
                    onClick={() => {
                        window.open(insight.url, '_blank');
                        mlDataCollector.record('business_insight_clicked', {
                            feature: 'business_insights',
                            title: insight.title,
                            timestamp: Date.now()
                        });
                    }}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 font-mono text-xs h-10 tracking-widest group-hover:border-purple-500/50 transition-colors"
                  >
                    ACCESS DATALINK <ExternalLink className="w-3 h-3 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FOOTER INFO */}
        <div className="flex items-center justify-center p-4 bg-purple-950/10 border border-purple-500/20 rounded-lg mt-8">
          <p className="text-xs text-purple-400 text-center font-mono flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            &gt;&gt; MARKET DATA UPDATED: LIVE STREAM ACTIVE
          </p>
        </div>
      </div>
    </div>
  );
}