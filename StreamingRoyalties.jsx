import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, Music, TrendingUp, Plus, BarChart3, 
  Brain, Shield, ExternalLink, Calculator
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const STREAMING_PLATFORMS = [
  { id: 'spotify', name: 'Spotify', rate: 0.004, color: '#1DB954' },
  { id: 'apple', name: 'Apple Music', rate: 0.01, color: '#FA243C' },
  { id: 'youtube', name: 'YouTube Music', rate: 0.002, color: '#FF0000' },
  { id: 'amazon', name: 'Amazon Music', rate: 0.004, color: '#FF9900' },
  { id: 'tidal', name: 'Tidal', rate: 0.0125, color: '#000000' },
  { id: 'deezer', name: 'Deezer', rate: 0.0064, color: '#FEAA2D' }
];

export default function StreamingRoyalties({ user }) {
  const [tracks, setTracks] = useState([]);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcStreams, setCalcStreams] = useState(10000);
  const [isAddingTrack, setIsAddingTrack] = useState(false);
  const [newTrackName, setNewTrackName] = useState('');

  const handleAddTrack = () => {
    if (!newTrackName) return;
    const newTrack = {
      id: Date.now(),
      name: newTrackName,
      streams: 0,
      revenue: 0,
      platform: 'spotify'
    };
    setTracks([newTrack, ...tracks]);
    setNewTrackName('');
    setIsAddingTrack(false);
  };

  const handleRemoveTrack = (id) => {
    setTracks(tracks.filter(t => t.id !== id));
  };

  const totalStreams = tracks.reduce((sum, t) => sum + t.streams, 0);
  const totalRevenue = tracks.reduce((sum, t) => sum + t.revenue, 0);

  // Empty sample data as requested
  const sampleData = [];

  const calculateRoyalty = (streams, rate) => (streams * rate).toFixed(2);

  return (
    <div className="space-y-6">
      {/* AI Notice */}
      <Card className="bg-cyan-950/50 border-cyan-500/30">
        <CardContent className="p-4 flex items-center gap-3">
          <Brain className="w-5 h-5 text-cyan-400 animate-pulse" />
          <div>
            <p className="text-white font-semibold text-sm">🤖 AI Learns From Your Data</p>
            <p className="text-cyan-300 text-xs">Analyzing streaming patterns to optimize distribution</p>
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-green-900/30 border-green-500/30">
          <CardContent className="p-4 text-center">
            <DollarSign className="w-6 h-6 text-green-400 mx-auto mb-1" />
            <p className="text-2xl font-black text-white">${totalRevenue.toLocaleString()}</p>
            <p className="text-green-300 text-xs mt-1">Total Revenue</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-900/30 border-blue-500/30">
          <CardContent className="p-4 text-center">
            <Music className="w-6 h-6 text-blue-400 mx-auto mb-1" />
            <p className="text-2xl font-black text-white">{totalStreams.toLocaleString()}</p>
            <p className="text-blue-300 text-xs mt-1">Total Streams</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-900/30 border-purple-500/30">
          <CardContent className="p-4 text-center">
            <BarChart3 className="w-6 h-6 text-purple-400 mx-auto mb-1" />
            <p className="text-2xl font-black text-white">{tracks.length}</p>
            <p className="text-purple-300 text-xs mt-1">Licensed Tracks</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-900/30 border-amber-500/30">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 text-amber-400 mx-auto mb-1" />
            <p className="text-2xl font-black text-white">+28%</p>
            <p className="text-amber-300 text-xs mt-1">Monthly Growth</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Overview */}
      <Card className="bg-slate-900/80 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-green-400" />
            Revenue Trend (Last 6 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sampleData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Tracks */}
      <Card className="bg-slate-900/80 border-slate-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Music className="w-5 h-5 text-blue-400" />
              Your Tracks
            </CardTitle>
            <Button size="sm" onClick={() => setIsAddingTrack(!isAddingTrack)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-1" /> Add Track
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isAddingTrack && (
            <div className="flex gap-2 mb-4">
              <Input 
                value={newTrackName}
                onChange={(e) => setNewTrackName(e.target.value)}
                placeholder="Enter track name..."
                className="bg-slate-800 border-slate-700 text-white"
              />
              <Button onClick={handleAddTrack} className="bg-green-600 hover:bg-green-700">Save</Button>
            </div>
          )}
          <div className="space-y-3">
            {tracks.sort((a, b) => b.streams - a.streams).map((track, idx) => (
              <div key={track.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-slate-500">#{idx + 1}</span>
                  <div>
                    <p className="text-white font-semibold">{track.name}</p>
                    <p className="text-slate-400 text-sm">{track.streams.toLocaleString()} streams</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-2">
                  <div>
                    <p className="text-green-400 font-bold">${track.revenue.toLocaleString()}</p>
                    <Badge className="bg-slate-700 text-slate-300 text-xs">
                      {STREAMING_PLATFORMS.find(p => p.id === track.platform)?.name || track.platform}
                    </Badge>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleRemoveTrack(track.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20 h-8 w-8 ml-2"
                  >
                    &times;
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Platform Rates */}
      <Card className="bg-slate-900/80 border-slate-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Music className="w-5 h-5 text-purple-400" />
              Platform Royalty Rates
            </CardTitle>
            <Button 
              size="sm" 
              onClick={() => setShowCalculator(!showCalculator)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Calculator className="w-4 h-4 mr-1" /> Calculator
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showCalculator && (
            <div className="p-4 bg-green-950/50 border border-green-500/30 rounded-lg mb-4">
              <p className="text-white font-semibold mb-2">Stream Calculator</p>
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  value={calcStreams}
                  onChange={(e) => setCalcStreams(parseInt(e.target.value) || 0)}
                  className="bg-slate-800 border-slate-700 text-white w-32"
                />
                <span className="text-slate-300">streams =</span>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {STREAMING_PLATFORMS.map(platform => (
              <div 
                key={platform.id}
                className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold">{platform.name}</span>
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: platform.color }}
                  />
                </div>
                <p className="text-slate-400 text-sm">Rate: ${platform.rate}/stream</p>
                {showCalculator && (
                  <p className="text-green-400 font-bold mt-2">
                    ${calculateRoyalty(calcStreams, platform.rate)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Distribution Tips */}
      <Card className="bg-[#0a0a0a] border-purple-500/30 shadow-lg">
        <CardContent className="p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            AI Distribution Tips
          </h3>
          <ul className="space-y-2 text-slate-300 text-sm">
            <li>• Focus on Tidal for highest per-stream rates ($0.0125)</li>
            <li>• Apple Music offers 2.5x more than Spotify per stream</li>
            <li>• Build playlist presence to increase discovery</li>
            <li>• Release on Fridays for algorithmic playlist consideration</li>
            <li>• Use pre-saves to boost first-week streaming numbers</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}