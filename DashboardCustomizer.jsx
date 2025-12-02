import React from 'react';
import { Card, CardContent, Button } from '@/components/ui/index';

export default function DashboardCustomizer({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <Card className="w-full max-w-md border-cyber-cyan/50 shadow-[0_0_50px_rgba(0,243,255,0.2)]">
        <CardContent className="p-6">
          <h2 className="text-xl font-black text-white mb-4">CUSTOMIZE DASHBOARD</h2>
          <p className="text-slate-400 text-sm mb-6">Arrange widgets and configure your data streams.</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={onClose}>Save Changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}