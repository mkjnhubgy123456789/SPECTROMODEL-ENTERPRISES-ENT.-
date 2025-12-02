import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Upload, Volume2, VolumeX, Activity, Music, Brain, SkipForward, X, ChevronUp, ChevronDown } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMLDataCollector } from "@/components/shared/MLDataCollector";
import { validateCSP, blockScriptInjection } from "@/components/shared/SecurityValidator";

export default function MeditativePlayer() {
  const mlDataCollector = useMLDataCollector();
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [mode, setMode] = useState('preset'); // 'preset' or 'user'
  const [currentPreset, setCurrentPreset] = useState('piano_classical');
  const [userFile, setUserFile] = useState(null);
  const [userFileUrl, setUserFileUrl] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const audioContextRef = useRef(null);
  const oscillatorsRef = useRef([]);
  const gainNodeRef = useRef(null);
  const userAudioRef = useRef(null);
  const intervalRef = useRef(null);
  const activeNodesRef = useRef([]);

  const presets = {
    ai_flow: {
      name: "✨ AI Personalized Feed",
      type: "generative",
      style: "mixed",
      description: "Endless evolving stream based on your vibe",
      color: "text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-bold"
    },
    piano_classical: { 
      name: "Classical Piano (Sonata)", 
      type: "generative",
      instrument: "piano",
      style: "classical",
      scale: "major",
      tempo: 400, // Fast arpeggios
      description: "Structured classical piano arpeggios",
      color: "text-slate-100"
    },
    guitar_classical: { 
      name: "Classical Guitar (Etude)", 
      type: "generative",
      instrument: "guitar",
      style: "classical",
      scale: "harmonic_minor",
      tempo: 300, // Fast picking
      description: "Intricate fingerstyle guitar",
      color: "text-amber-400"
    },
    orchestra_symphony: { 
      name: "Symphonic Orchestra", 
      type: "generative",
      instrument: "orchestra",
      style: "cinematic",
      scale: "minor",
      tempo: 2000,
      description: "Full orchestral arrangement",
      color: "text-rose-300"
    },
    piano_gentle: { 
      name: "Gentle Piano (Sleep)", 
      type: "generative",
      instrument: "piano",
      style: "ambient",
      scale: "major_pentatonic",
      tempo: 3000,
      description: "Soft, slow lullaby keys",
      color: "text-blue-200"
    },
    piano_jazz: { 
      name: "Midnight Jazz Piano", 
      type: "generative",
      instrument: "piano",
      style: "jazz",
      scale: "dorian",
      tempo: 1500,
      description: "Smooth, smoky jazz chords",
      color: "text-indigo-300"
    },
    harp_dream: { 
      name: "Dream Harp", 
      type: "generative",
      instrument: "harp",
      style: "ambient",
      scale: "lydian",
      tempo: 600,
      description: "Magical flowing arpeggios",
      color: "text-amber-200"
    },
    flute_bamboo: { 
      name: "Bamboo Flute", 
      type: "generative",
      instrument: "flute",
      style: "ambient",
      scale: "major_pentatonic",
      tempo: 2800,
      description: "Airy nature-inspired flute",
      color: "text-emerald-400"
    },
    steel_tropical: { 
      name: "Island Steel Drums", 
      type: "generative",
      instrument: "steel",
      style: "ambient",
      scale: "major",
      tempo: 800,
      description: "Upbeat tropical vibes",
      color: "text-cyan-300"
    },
    trumpet_blues: {
      name: "Blues Trumpet",
      type: "generative",
      instrument: "trumpet",
      style: "jazz",
      scale: "blues",
      tempo: 1400,
      description: "Soulful late-night trumpet",
      color: "text-blue-500"
    },
    om: { 
      name: "Tibetan Om (Drone)", 
      type: "drone",
      base: 136.1, 
      description: "Deep resonant grounding drone",
      color: "text-orange-500"
    },
    bowl: { 
      name: "Crystal Bowls (Tone)", 
      type: "bowl",
      base: 432, 
      description: "Pure harmonic healing tones",
      color: "text-blue-300"
    }
  };

  useEffect(() => {
    // Security check
    try {
      blockScriptInjection();
      validateCSP();
    } catch (e) {
      console.error("Security check failed in MeditativePlayer", e);
    }
  }, []);

  useEffect(() => {
    if (mode === 'preset' && isPlaying) {
      startOscillators();
    } else {
      stopOscillators();
    }
  }, [mode, isPlaying, currentPreset]);

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(volume, audioContextRef.current.currentTime, 0.1);
    }
    if (userAudioRef.current) {
      userAudioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (mode === 'user' && userAudioRef.current) {
      if (isPlaying) {
        userAudioRef.current.play().catch(e => console.error("Playback failed:", e));
      } else {
        userAudioRef.current.pause();
      }
    }
  }, [mode, isPlaying, userFileUrl]);

  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  const startOscillators = () => {
    initAudioContext();
    stopOscillators(); 

    const ctx = audioContextRef.current;
    const preset = presets[currentPreset];
    const now = ctx.currentTime;

    // --- GENERATIVE INSTRUMENT ENGINE ---
    if (preset.type === 'generative') {
      // Expanded scales for 2 octaves
      const baseScales = {
        major: [130.81, 146.83, 164.81, 174.61, 196.00, 220.00, 246.94],
        minor: [130.81, 146.83, 155.56, 174.61, 196.00, 207.65, 233.08],
        harmonic_minor: [130.81, 146.83, 155.56, 174.61, 196.00, 207.65, 246.94],
        dorian: [130.81, 146.83, 155.56, 174.61, 196.00, 220.00, 233.08],
      };
      
      // Helper to create 3-octave range
      const createFullScale = (base) => [
        ...base, 
        ...base.map(f => f * 2), 
        ...base.map(f => f * 4)
      ];

      const scales = {
        major: createFullScale(baseScales.major),
        minor: createFullScale(baseScales.minor),
        harmonic_minor: createFullScale(baseScales.harmonic_minor),
        dorian: createFullScale(baseScales.dorian),
        major_pentatonic: createFullScale([130.81, 146.83, 164.81, 196.00, 220.00]),
        minor_pentatonic: createFullScale([130.81, 155.56, 174.61, 196.00, 233.08]),
        phrygian: createFullScale([130.81, 138.59, 155.56, 174.61, 196.00, 207.65, 233.08]),
        lydian: createFullScale([130.81, 146.83, 164.81, 185.00, 196.00, 220.00, 246.94]),
        blues: createFullScale([130.81, 155.56, 174.61, 185.00, 196.00, 233.08]),
      };

      // Robust fallback to major scale if specified scale doesn't exist
      let currentScale = (preset.scale && scales[preset.scale]) ? scales[preset.scale] : scales.major;
      let currentInstrument = preset.instrument;
      let currentTempo = preset.tempo || 2000;
      
      // Chord Logic State
      let chordStep = 0;
      const progressions = {
        classical: [[0, 2, 4], [3, 5, 7], [4, 6, 1], [0, 2, 4]], // I-IV-V-I
        jazz: [[1, 3, 5, 8], [4, 6, 8, 11], [0, 2, 4, 7]], // ii-V-I
        ambient: [[0, 4], [5, 9], [3, 7]] // Open intervals
      };
      let currentProgression = progressions.classical;
      
      if (preset.style === 'jazz') currentProgression = progressions.jazz;
      if (preset.style === 'ambient') currentProgression = progressions.ambient;

      if (preset.instrument === 'mix') {
        const instruments = ['piano', 'guitar', 'violin', 'harp', 'flute', 'steel'];
        currentInstrument = instruments[Math.floor(Math.random() * instruments.length)];
      }

      const playNote = () => {
        if (!intervalRef.current) return;

        // Mix mode logic
        if (preset.instrument === 'mix' && Math.random() > 0.85) {
           const instruments = ['piano', 'guitar', 'violin', 'harp', 'flute', 'steel'];
           currentInstrument = instruments[Math.floor(Math.random() * instruments.length)];
        }
        
        // Determine Notes
        let freqsToPlay = [];
        
        if (preset.style === 'classical' || preset.style === 'jazz') {
            // Arpeggiator / Chord logic
            const chordIndices = currentProgression[Math.floor(chordStep / 4) % currentProgression.length];
            // Arpeggiate: pick one note from current chord
            const noteIndex = chordIndices[chordStep % chordIndices.length];
            // Add octave randomness
            const octaveOffset = Math.floor(Math.random() * 2) * 7; 
            const safeIndex = (noteIndex + octaveOffset) % currentScale.length;
            freqsToPlay = [currentScale[safeIndex]];
            
            // Advance step
            chordStep++;
            
            // Accompaniment (Left hand / Bass) - on beat 1 of 4
            if (chordStep % 4 === 1) {
                const bassIndex = chordIndices[0] % 7; // Root of chord
                freqsToPlay.push(currentScale[bassIndex] / 2); // Lower octave
            }
        } else if (preset.instrument === 'orchestra') {
            // Play full chords for orchestra
            const chordIndices = currentProgression[Math.floor(chordStep / 8) % currentProgression.length];
            freqsToPlay = chordIndices.map(i => currentScale[i + 7]); // Mid range
            freqsToPlay.push(currentScale[chordIndices[0]] / 2); // Bass
            chordStep++;
        } else {
            // Ambient / Random
            freqsToPlay = [currentScale[Math.floor(Math.random() * currentScale.length)]];
        }
        
        freqsToPlay.forEach(freq => {
            if (!freq) return;
            
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const filter = ctx.createBiquadFilter();
            const panner = ctx.createStereoPanner();
            
            const t = ctx.currentTime;
            let duration = 3;
            
            // Refined Instrument Synthesis
            if (currentInstrument === 'piano') {
              duration = 2.5;
              osc.type = 'triangle'; // Brighter piano
              // Detuned oscillators for realism
              const osc2 = ctx.createOscillator();
              osc2.type = 'sine';
              osc2.frequency.value = freq * 1.001; // Slight detune
              const gain2 = ctx.createGain();
              gain2.gain.value = 0.4;
              osc2.connect(gain2);
              gain2.connect(gain);
              osc2.start(t);
              osc2.stop(t + duration);
              
              // Hammer noise
              const click = ctx.createOscillator();
              click.frequency.value = 3000;
              const clickGain = ctx.createGain();
              clickGain.gain.setValueAtTime(0.2, t);
              clickGain.gain.exponentialRampToValueAtTime(0.01, t + 0.02);
              click.connect(clickGain);
              clickGain.connect(gain);
              click.start(t);
              click.stop(t + 0.02);

              gain.gain.setValueAtTime(0, t);
              gain.gain.linearRampToValueAtTime(0.7, t + 0.02); // Fast attack
              gain.gain.exponentialRampToValueAtTime(0.01, t + duration);
            } 
            else if (currentInstrument === 'guitar') {
              duration = 2.0;
              osc.type = 'triangle';
              filter.type = 'lowpass';
              filter.frequency.setValueAtTime(1200, t);
              filter.frequency.exponentialRampToValueAtTime(300, t + 0.5);
              
              // Pluck effect
              gain.gain.setValueAtTime(0, t);
              gain.gain.linearRampToValueAtTime(0.6, t + 0.01);
              gain.gain.exponentialRampToValueAtTime(0.01, t + 1.5);
            }
            else if (currentInstrument === 'orchestra' || currentInstrument === 'violin') {
              duration = 5.0;
              osc.type = 'sawtooth';
              
              // Ensemble chorus effect via LFO on frequency
              const lfo = ctx.createOscillator();
              lfo.frequency.value = 4;
              const lfoGain = ctx.createGain();
              lfoGain.gain.value = freq * 0.005; // Vibrato depth dependent on pitch
              lfo.connect(lfoGain);
              lfoGain.connect(osc.frequency);
              lfo.start(t);
              lfo.stop(t + duration);

              filter.type = 'lowpass';
              filter.frequency.value = 2000;

              gain.gain.setValueAtTime(0, t);
              gain.gain.linearRampToValueAtTime(0.3, t + 1); // Slow swell
              gain.gain.linearRampToValueAtTime(0.3, t + 3);
              gain.gain.linearRampToValueAtTime(0, t + duration);
            }
            else if (currentInstrument === 'harp') {
              duration = 3;
              osc.type = 'triangle';
              gain.gain.setValueAtTime(0, t);
              gain.gain.linearRampToValueAtTime(0.5, t + 0.05);
              gain.gain.exponentialRampToValueAtTime(0.01, t + 2.5);
            }
            else if (currentInstrument === 'trumpet') {
              duration = 1.5;
              osc.type = 'sawtooth';
              filter.type = 'lowpass';
              filter.frequency.setValueAtTime(800, t);
              filter.frequency.linearRampToValueAtTime(2000, t + 0.1); // Brass swell
              
              // Vibrato
              const lfo = ctx.createOscillator();
              lfo.frequency.value = 5;
              const lfoGain = ctx.createGain();
              lfoGain.gain.value = 10;
              lfo.connect(lfoGain);
              lfoGain.connect(osc.frequency);
              lfo.start(t);
              lfo.stop(t + duration);

              gain.gain.setValueAtTime(0, t);
              gain.gain.linearRampToValueAtTime(0.6, t + 0.1);
              gain.gain.linearRampToValueAtTime(0.5, t + 1.0);
              gain.gain.exponentialRampToValueAtTime(0.01, t + duration);
            }
            else {
                // Fallback / Flute / Steel
                osc.type = 'sine';
                gain.gain.setValueAtTime(0, t);
                gain.gain.linearRampToValueAtTime(0.5, t + 0.1);
                gain.gain.linearRampToValueAtTime(0, t + 2);
            }

            osc.frequency.value = freq;
            panner.pan.value = (Math.random() * 1.5) - 0.75; // Wider spread

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(panner);
            panner.connect(gainNodeRef.current);

            osc.start(t);
            osc.stop(t + duration);

            activeNodesRef.current.push(osc, gain, panner, filter);
            setTimeout(() => {
              const idx = activeNodesRef.current.indexOf(osc);
              if (idx > -1) activeNodesRef.current.splice(idx, 4);
            }, duration * 1000 + 200);
        });
      };

      playNote();
      intervalRef.current = setInterval(playNote, currentTempo);
      return;
    }

    // --- STATIC DRONE/OSCILLATOR ENGINE (Existing) ---
    const newOscillators = [];
    const createOsc = (freq, type, pan, gainMod = 1) => {
      const osc = ctx.createOscillator();
      const panner = ctx.createStereoPanner();
      const gain = ctx.createGain();
      
      osc.type = type;
      osc.frequency.value = freq;
      panner.pan.value = pan;
      gain.gain.value = gainMod;

      osc.connect(gain);
      gain.connect(panner);
      panner.connect(gainNodeRef.current);
      
      osc.start(now);
      newOscillators.push(osc);
    };

    if (preset.type === 'bowl') {
      createOsc(preset.base, 'sine', 0, 0.6);
      createOsc(preset.base * 1.5, 'sine', -0.3, 0.2); 
      createOsc(preset.base * 2.0, 'sine', 0.3, 0.1);
    } else if (preset.type === 'drone') {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const panner = ctx.createStereoPanner();
      osc.type = 'sawtooth';
      osc.frequency.value = preset.base;
      filter.type = 'lowpass';
      filter.frequency.value = 200; 
      panner.pan.value = 0;
      osc.connect(filter);
      filter.connect(panner);
      panner.connect(gainNodeRef.current);
      osc.start(now);
      newOscillators.push(osc);
      createOsc(preset.base / 2, 'sine', 0, 0.3);
    } else {
      // Default / Binaural
      const beat = preset.beat || 10;
      createOsc(preset.base, 'sine', -1, 0.5);
      createOsc(preset.base + beat, 'sine', 1, 0.5);
    }

    oscillatorsRef.current = newOscillators;
  };

  const stopOscillators = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    oscillatorsRef.current.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {}
    });
    oscillatorsRef.current = [];

    activeNodesRef.current.forEach(node => {
      try {
        node.stop ? node.stop() : node.disconnect();
      } catch(e) {}
    });
    activeNodesRef.current = [];
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUserFile(file);
      setUserFileUrl(url);
      setMode('user');
      setIsPlaying(true);
      
      mlDataCollector.record('meditative_player_upload', {
        fileName: file.name,
        fileSize: file.size,
        timestamp: Date.now()
      });
    }
  };

  const togglePlay = () => {
    const newState = !isPlaying;
    setIsPlaying(newState);
    
    // Initialize context on user interaction if needed
    if (newState) {
      initAudioContext();
    }

    mlDataCollector.record('meditative_player_toggle', {
      isPlaying: newState,
      mode,
      preset: currentPreset,
      timestamp: Date.now()
    });
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-slate-950/95 border-t border-purple-500/30 backdrop-blur-xl z-50 transition-all duration-300 transform ${isExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-10px)]'}`}>
      {/* Toggle Button (Open/Close) */}
      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-6 w-12 rounded-t-xl rounded-b-none bg-slate-950/95 border-t border-l border-r border-purple-500/30 hover:bg-purple-900/20 text-purple-400 p-0 flex items-center justify-center"
        >
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </Button>
      </div>

      {/* Main Bar */}
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        
        {/* Left: Info */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className={`p-2 rounded-full ${isPlaying ? 'bg-purple-500/20 animate-pulse' : 'bg-slate-800'}`}>
            {mode === 'preset' ? (
              <Brain className={`w-6 h-6 ${presets[currentPreset].color}`} />
            ) : (
              <Music className="w-6 h-6 text-blue-400" />
            )}
          </div>
          <div className="hidden sm:block min-w-0">
            <h3 className="text-white font-bold text-sm truncate">
              {mode === 'preset' ? presets[currentPreset].name : (userFile?.name || "No file loaded")}
            </h3>
            <p className="text-xs text-slate-400 truncate">
              {mode === 'preset' ? presets[currentPreset].description : "Your custom track"}
            </p>
          </div>
        </div>

        {/* Center: Controls */}
        <div className="flex items-center gap-4">
          <Button 
            size="icon" 
            variant="ghost" 
            className="text-white hover:bg-purple-500/20 rounded-full h-10 w-10"
            onClick={togglePlay}
          >
            {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
          </Button>
          
          {/* Source Selector */}
          <div className="hidden md:flex items-center gap-2">
             <Select value={mode === 'preset' ? currentPreset : 'custom'} onValueChange={(val) => {
               if (val === 'custom') {
                 document.getElementById('meditative-upload').click();
               } else {
                 setMode('preset');
                 setCurrentPreset(val);
                 mlDataCollector.record('meditative_player_preset_change', {
                   preset: val,
                   timestamp: Date.now()
                 });
                 if (isPlaying) {
                   // Restart logic handled by effect
                 }
               }
             }}>
              <SelectTrigger className="w-[200px] bg-slate-900 border-slate-700 text-white h-8 text-xs font-medium">
                <SelectValue placeholder="Select Sound" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700 text-white">
                <SelectItem value="custom" className="text-blue-400 font-bold border-b border-slate-800 mb-1">
                  <Upload className="w-3 h-3 mr-2 inline" /> Upload Your Song...
                </SelectItem>
                {Object.entries(presets).map(([key, p]) => (
                  <SelectItem key={key} value={key}>
                    <span className={p.color}>●</span> {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input 
              type="file" 
              id="meditative-upload" 
              accept="audio/*" 
              className="hidden" 
              onChange={handleFileUpload} 
            />
          </div>
        </div>

        {/* Right: Volume & Expand */}
        <div className="flex items-center gap-3 w-[140px] justify-end">
          {volume === 0 ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-slate-400" />}
          <Slider 
            value={[volume]} 
            max={1} 
            step={0.01} 
            onValueChange={(v) => setVolume(v[0])}
            className="w-20 cursor-pointer" 
          />
        </div>
      </div>

      {/* Hidden Audio Element for User Files */}
      <audio 
        ref={userAudioRef} 
        src={userFileUrl || ""} 
        onEnded={() => setIsPlaying(false)}
        className="hidden" 
      />
    </div>
  );
}