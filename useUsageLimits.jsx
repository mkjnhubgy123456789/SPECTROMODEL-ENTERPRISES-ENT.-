import { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { LIMITS, SUBSCRIPTION_TIERS, checkUsageLimit } from "./subscriptionSystem";

export function useUsageLimits(user) {
  const [usage, setUsage] = useState({
    analysis_uploads: 0,
    time_series: 0,
    advanced_analytics: 0,
    market_fit: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchUsage = async () => {
      if (!user) {
          if (mounted) setLoading(false);
          return;
      }

      try {
        if (mounted) setLoading(true);
        
        const userTier = user.role === 'admin' ? SUBSCRIPTION_TIERS.PREMIUM : (user.subscription_tier || SUBSCRIPTION_TIERS.FREE);
        const limits = LIMITS[userTier];
        
        if (!limits) {
            if (mounted) setLoading(false);
            return;
        }

        const now = new Date();
        let startDate;
        if (limits.period === 'month') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        } else if (limits.period === 'day') {
            startDate = new Date(now.setHours(0,0,0,0));
        } else {
            // Unlimited or unknown
            startDate = new Date(0); // Check all time? Or no need?
        }

        // Always fetch if limit is not Infinity
        // If limit is Infinity, we technically don't need to count, but for stats we might want to.
        
        const [analyses, projects] = await Promise.all([
            base44.entities.MusicAnalysis.filter({
                created_by: user.email,
                created_date: { $gte: startDate.toISOString() }
            }),
            base44.entities.CreativeProject.filter({
                created_by: user.email,
                created_date: { $gte: startDate.toISOString() }
            })
        ]);

        if (!mounted) return;

        const totalUsage = analyses.length + projects.length;
        
        // Specific counters
        const timeSeriesCount = analyses.filter(a => a.analysis_type === 'time_series_analysis').length;
        const advancedCount = analyses.filter(a => a.analysis_type === 'dsp_algorithms' || a.analysis_type === 'rhythm_analysis').length; 
        
        // For market fit, we count market_research or market_fit analysis types
        const marketFitCount = analyses.filter(a => a.analysis_type === 'market_fit_score' || a.analysis_type === 'market_research').length;

        setUsage({
            analysis_uploads: totalUsage,
            time_series: timeSeriesCount,
            advanced_analytics: advancedCount,
            market_fit: marketFitCount
        });
      } catch (err) {
        console.error("Failed to fetch usage:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchUsage();
    
    return () => { mounted = false; };
  }, [user]);

  const isLocked = (limitKey) => {
    if (!user) return false; // If not logged in, assume no user-based limits (page should handle auth)
    
    const userTier = user.role === 'admin' ? SUBSCRIPTION_TIERS.PREMIUM : (user.subscription_tier || SUBSCRIPTION_TIERS.FREE);
    
    // Admin/Premium always unlocked
    if (userTier === SUBSCRIPTION_TIERS.PREMIUM) return false;
    
    // Use the checkUsageLimit logic: returns TRUE if allowed, FALSE if limit reached
    const currentCount = usage[limitKey] || (limitKey === 'analysis_uploads' ? usage.analysis_uploads : 0);
    
    const isAllowed = checkUsageLimit(userTier, limitKey, currentCount);
    
    return !isAllowed; // Locked if NOT allowed
  };

  return { usage, loading, isLocked };
}