import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Shield, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import MetaverseSceneGenerator from '@/components/shared/MetaverseSceneGenerator';
import AIResolver from '@/components/shared/AIResolver';
import { validateCSP, blockScriptInjection } from '@/components/shared/SecurityValidator';
import { useMLDataCollector } from '@/components/shared/MLDataCollector';
import LimitLocker from "@/components/shared/LimitLocker";
import { base44 } from "@/api/base44Client";

export default function SceneGeneratorPage() {
  const navigate = useNavigate();
  const mlDataCollector = useMLDataCollector();
  const [securityStatus, setSecurityStatus] = useState({ safe: true, threats: 0, mlComplexity: 0 });
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
        const cspResult = validateCSP();

        if (mounted) {
          setSecurityStatus({
            safe: cspResult.valid,
            threats: cspResult.violations?.length || 0,
            mlComplexity: cspResult.mlComplexity || 0
          });
        }

        mlDataCollector.record('scene_generator_visit', {
          feature: 'scene_generator',
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8 pb-8">
      <LimitLocker feature="analysis_uploads" featureKey="SPECTROVERSE" user={currentUser} />
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-3xl sm:text-4xl font-black text-white bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Scene Generator
          </h1>
          <Button onClick={() => navigate(createPageUrl("SpectroVerse"))} className="bg-gradient-to-r from-blue-600 to-purple-600 z-base">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <Card className="bg-slate-950/90 border-green-500/30 z-cards">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">🛡️ Security Active</p>
                  <p className="text-xs text-slate-400">{securityStatus.safe ? `Protected • ML: ${securityStatus.mlComplexity.toFixed(1)}` : `${securityStatus.threats} blocked`}</p>
                </div>
              </div>
              <Badge className={securityStatus.safe ? 'bg-green-500' : 'bg-orange-500'}>
                {securityStatus.safe ? 'SAFE' : 'ALERT'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-cyan-950/90 to-blue-950/90 border-cyan-500/40 z-cards">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-cyan-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">🤖 AI Learning Active</p>
                <p className="text-xs text-cyan-300">Learning from your scene preferences</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <AIResolver context={{ feature: 'scene_generator' }} />

        <MetaverseSceneGenerator />
      </div>
    </div>
  );
}