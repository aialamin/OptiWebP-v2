import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap,
  Sliders,
  Play,
  PauseCircle,
  Check,
  ArrowRight,
} from 'lucide-react';
import { Badge } from './untitledui/Badge';
import { BorderBeam } from './animations/BorderBeam';
import { AnimatedNumber } from './animations/AnimatedNumber';
import { SpotlightCard } from './animations/SpotlightCard';
import { ShinyText } from './animations/ShinyText';
import { DecryptedText } from './animations/DecryptedText';

interface StageInfo {
  step: number;
  title: string;
  badge: string;
  tagline: string;
  description: string;
  technicalDetails: string;
}

// Concise, crisp stage explanations (User requested less text)
const STAGES: StageInfo[] = [
  {
    step: 1,
    title: 'Macroblock Grid',
    badge: 'Stage 1: Partition',
    tagline: 'Splits raw pixels into 16×16 blocks',
    description:
      'WebP divides the canvas into hierarchical macroblocks and optimizes chroma subsampling before compression.',
    technicalDetails: '16×16 Luma blocks · YUV 4:2:0 subsampling',
  },
  {
    step: 2,
    title: 'Intra-Prediction',
    badge: 'Stage 2: VP8 Predict',
    tagline: 'Encodes differences between neighbors',
    description:
      'Predicts pixel values from adjacent blocks, storing only tiny residual differences to cut ~70% of payload.',
    technicalDetails: 'Directional prediction · Residual matrix encoding',
  },
  {
    step: 3,
    title: 'Frequency Filtering',
    badge: 'Stage 3: Quantize',
    tagline: 'Eliminates invisible high-frequency noise',
    description:
      'Applies discrete cosine transform to zero out imperceptible noise while preserving razor-sharp silhouettes.',
    technicalDetails: '4×4 FDCT Transform · Psycho-visual matrix',
  },
  {
    step: 4,
    title: 'Bitstream Output',
    badge: 'Stage 4: Packaging',
    tagline: 'Compresses into compact WebP container',
    description:
      'Packs quantized coefficients using Boolean arithmetic entropy coding for fast, private browser delivery.',
    technicalDetails: 'Boolean arithmetic coder · VP8/VP8L bitstream',
  },
];

export const OptimizationExplainerAnimation: React.FC = () => {
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState<'photo' | 'transparent'>('photo');
  const [qualitySlider, setQualitySlider] = useState(85);
  const [sliderPosition, setSliderPosition] = useState(50); // Split slider 0 to 100%
  const [isHovered, setIsHovered] = useState(false);
  const [activeGridScanX, setActiveGridScanX] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(640);

  const activeStage = STAGES[activeStageIndex];

  // Dynamic calculations based on quality and preset
  const originalSizeKb = selectedPreset === 'photo' ? 313 : 1420;
  const webpSizeKb = selectedPreset === 'photo'
    ? Math.round(originalSizeKb * (0.28 + Math.pow(qualitySlider / 100, 2.3) * 0.14))
    : Math.round(originalSizeKb * (0.07 + Math.pow(qualitySlider / 100, 2.3) * 0.18));
  const savedPercent = Math.round(((originalSizeKb - webpSizeKb) / originalSizeKb) * 100);
  const encodingTimeMs = Math.round(24 + (qualitySlider / 100) * 18);

  // Measure container width for pixel-perfect split image slider
  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const stepButtonProgressRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Butter-smooth 60fps/120fps hardware-composited timer loop for stage progression
  // Directly updates DOM styles on animation frames with zero lag or stutter
  useEffect(() => {
    // Reset/synchronize progress on all buttons according to activeStageIndex
    stepButtonProgressRefs.current.forEach((el, idx) => {
      if (!el) return;
      if (idx < activeStageIndex) {
        el.style.width = '100%';
      } else if (idx > activeStageIndex) {
        el.style.width = '0%';
      }
    });

    if (!isPlaying) return;

    let startTime = performance.now();
    let frameId: number;
    const stageDurationMs = 4500; // 4.5 seconds per stage

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / stageDurationMs);

      // Smoothly fill the active button's bottom line (0% -> 100%)
      const activeBtnEl = stepButtonProgressRefs.current[activeStageIndex];
      if (activeBtnEl) {
        activeBtnEl.style.width = `${progress * 100}%`;
      }

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      } else {
        // Stage completed: advance to next stage smoothly
        setActiveStageIndex((curr) => (curr + 1) % STAGES.length);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, activeStageIndex]);

  // Animated grid scan horizontal position
  useEffect(() => {
    if (activeStage.step !== 1) return;
    const interval = setInterval(() => {
      setActiveGridScanX((prev) => (prev >= 100 ? 0 : prev + 1.2));
    }, 40);
    return () => clearInterval(interval);
  }, [activeStage.step]);

  // Touch and mouse handlers for split slider
  const handleSplitDrag = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = Math.round((x / rect.width) * 100);
    setSliderPosition(percentage);
  };

  const handleSelectStage = (idx: number) => {
    setActiveStageIndex(idx);
  };

  return (
    <div
      className="w-full transition-colors"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top Controller Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-neutral-200/80 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="brand" size="sm" dot>
              <ShinyText speed={4} className="text-emerald-700 dark:text-emerald-300">
                Live Compression Pipeline
              </ShinyText>
            </Badge>
            <span className="text-xs text-neutral-400">·</span>
            <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
              Hardware Canvas VP8 & VP8L
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            How WebP Optimization Works
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-2xl">
            See how predictive macroblock quantization strips redundant payload without losing visual sharpness.
          </p>
        </div>

        {/* Control Actions & Preset Switcher (Fixed dark mode hover contrast) */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Preset Buttons */}
          <div className="inline-flex p-1 bg-neutral-100 dark:bg-neutral-850 rounded-xl border border-neutral-200/80 dark:border-neutral-800">
            <button
              onClick={() => setSelectedPreset('photo')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                selectedPreset === 'photo'
                  ? 'bg-white dark:bg-emerald-600 text-neutral-900 dark:text-white shadow-xs font-bold'
                  : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-emerald-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800'
              }`}
            >
              Penthouse Photo (OptiWeb)
            </button>
            <button
              onClick={() => setSelectedPreset('transparent')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                selectedPreset === 'transparent'
                  ? 'bg-white dark:bg-emerald-600 text-neutral-900 dark:text-white shadow-xs font-bold'
                  : 'text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-emerald-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800'
              }`}
            >
              Graphic (Lossless VP8L)
            </button>
          </div>

          {/* Play/Pause Button */}
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white dark:bg-neutral-850 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-750 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-950 dark:hover:text-white rounded-xl transition-all duration-150 cursor-pointer shadow-xs active:scale-95"
          >
            {isPlaying ? (
              <PauseCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            ) : (
              <Play className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            )}
            <span>{isPlaying ? 'Pause' : 'Auto Play'}</span>
          </button>
        </div>
      </div>

      {/* Stage Step Tabs: Step 01 to 04 with sleek thin borders and smooth under-button progress indicator */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 pb-5 w-full">
        {STAGES.map((s, idx) => {
          const isActive = idx === activeStageIndex;
          const isDone = idx < activeStageIndex;

          return (
            <button
              key={s.step}
              onClick={() => handleSelectStage(idx)}
              className={`text-left p-3 sm:p-3.5 rounded-xl border transition-all duration-300 cursor-pointer relative overflow-hidden w-full ${
                isActive
                  ? 'bg-neutral-50/90 dark:bg-[#141822]/90 border-emerald-500/50 dark:border-emerald-500/50 shadow-xs'
                  : isDone
                  ? 'bg-white dark:bg-[#11141b] border-neutral-200/70 dark:border-neutral-800/80 hover:border-neutral-300 dark:hover:border-neutral-700'
                  : 'bg-white dark:bg-[#11141b] border-neutral-200/70 dark:border-neutral-800/80 opacity-75 hover:opacity-100 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              {/* Smooth thin active ring / accent */}
              {isActive && (
                <motion.div
                  layoutId="activeStepGlow"
                  className="absolute inset-0 rounded-xl ring-1 ring-emerald-500/30 pointer-events-none"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}

              {/* Ultra-smooth thin green progress line animation across full width of button bottom */}
              <div className="absolute bottom-0 left-0 right-0 w-full h-[2px] bg-neutral-200/40 dark:bg-neutral-800/60 overflow-hidden">
                <div
                  ref={(el) => {
                    stepButtonProgressRefs.current[idx] = el;
                  }}
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.7)]"
                  style={{
                    width: idx < activeStageIndex ? '100%' : '0%',
                  }}
                />
              </div>

              <div className="flex items-center justify-between gap-1 mb-1 relative z-10">
                <span className="font-mono text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                  Step 0{s.step}
                </span>
                {isDone ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                ) : isActive ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_#10b981] shrink-0" />
                ) : null}
              </div>

              <div className="text-xs sm:text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate relative z-10">
                {s.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Interactive Stage Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2">
        {/* Left Column: Visual Interactive Graphic Simulation */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div
            ref={containerRef}
            className="relative w-full h-76 sm:h-88 rounded-2xl overflow-hidden border border-neutral-300 dark:border-neutral-700 bg-neutral-950 select-none shadow-sm"
          >
            {/* BorderBeam on the active canvas */}
            <BorderBeam
              size={180}
              duration={10}
              colorFrom="#10b981"
              colorTo="#06b6d4"
              borderWidth={1.5}
            />

            {/* Base Visual Scene */}
            {selectedPreset === 'photo' ? (
              <div className="absolute inset-0 bg-neutral-950 overflow-hidden">
                <img
                  src="/Optiweb.jpg"
                  alt="High-resolution modern interior architecture with ocean view"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out"
                  referrerPolicy="no-referrer"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-neutral-950/30 pointer-events-none" />

                <div className="absolute bottom-4 left-4 z-10 font-mono text-[11px] text-white/90 bg-neutral-900/80 px-2.5 py-1 rounded-md backdrop-blur-md border border-white/10 shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>OptiWeb Raw Interior · 1600 × 1067 px</span>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 bg-[#0d1117] flex items-center justify-center">
                <div
                  className="absolute inset-0 opacity-15"
                  style={{
                    backgroundImage: `
                      linear-gradient(45deg, #262c36 25%, transparent 25%), 
                      linear-gradient(-45deg, #262c36 25%, transparent 25%), 
                      linear-gradient(45deg, transparent 75%, #262c36 75%), 
                      linear-gradient(-45deg, transparent 75%, #262c36 75%)
                    `,
                    backgroundSize: '16px 16px',
                    backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0',
                  }}
                />

                <div className="relative z-10 flex flex-col items-center">
                  <motion.div
                    animate={{ scale: [1, 1.03, 1] }}
                    transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                    className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-300 p-1 shadow-[0_0_40px_rgba(16,185,129,0.3)]"
                  >
                    <div className="w-full h-full rounded-2xl bg-neutral-950/90 flex flex-col items-center justify-center">
                      <Zap className="w-12 h-12 text-emerald-400 mb-1" />
                      <span className="font-mono text-xs font-bold text-white tracking-wider">
                        VP8L ALPHA
                      </span>
                    </div>
                  </motion.div>
                  <span className="mt-3 font-mono text-[11px] text-emerald-400/90 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                    Lossless 32-Bit RGBA Transparency
                  </span>
                </div>
              </div>
            )}

            {/* STAGE 1 OVERLAY: Macroblock Grid */}
            <AnimatePresence>
              {activeStage.step === 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 pointer-events-none"
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `
                        linear-gradient(to right, rgba(16, 185, 129, 0.35) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(16, 185, 129, 0.35) 1px, transparent 1px)
                      `,
                      backgroundSize: '32px 32px',
                    }}
                  />
                  <div
                    className="absolute top-0 bottom-0 w-1.5 bg-gradient-to-b from-emerald-400 via-teal-300 to-cyan-400 shadow-[0_0_15px_#10b981]"
                    style={{ left: `${activeGridScanX}%` }}
                  />
                  <div className="absolute top-4 right-4 bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 font-mono text-[10px] px-2.5 py-1 rounded-md backdrop-blur-md">
                    Scanning 16×16 Macroblocks
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* STAGE 2 OVERLAY: Intra-Frame Prediction Vector Arrows */}
            <AnimatePresence>
              {activeStage.step === 2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 pointer-events-none flex items-center justify-center"
                >
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-6 sm:gap-10 p-6 opacity-75">
                    {Array.from({ length: 18 }).map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          x: [0, (i % 2 === 0 ? 6 : -6), 0],
                          y: [0, (i % 3 === 0 ? 6 : -6), 0],
                          opacity: [0.4, 0.9, 0.4],
                        }}
                        transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.08 }}
                        className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/60 flex items-center justify-center font-mono text-[10px] text-emerald-300"
                      >
                        {i % 4 === 0 ? '→' : i % 4 === 1 ? '↓' : i % 4 === 2 ? '↘' : 'DC'}
                      </motion.div>
                    ))}
                  </div>
                  <div className="absolute top-4 right-4 bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 font-mono text-[10px] px-2.5 py-1 rounded-md backdrop-blur-md">
                    VP8 Spatial Predictors Active
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* STAGE 3 OVERLAY: Quantization Frequency Heatmap */}
            <AnimatePresence>
              {activeStage.step === 3 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 pointer-events-none flex items-center justify-center"
                >
                  <div className="absolute inset-0 bg-emerald-950/20 backdrop-blur-[0.5px]" />
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="grid grid-cols-4 gap-1 p-2 bg-neutral-900/90 border border-emerald-500/40 rounded-xl shadow-2xl backdrop-blur-md">
                      {Array.from({ length: 16 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-7 h-7 sm:w-9 sm:h-9 rounded-md flex items-center justify-center font-mono text-[10px] font-bold ${
                            i < 6
                              ? 'bg-emerald-500 text-neutral-950 shadow-xs'
                              : i < 11
                              ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50'
                              : 'bg-neutral-800 text-neutral-500'
                          }`}
                        >
                          {i < 6 ? 'DC' : i < 11 ? 'AC' : '0'}
                        </div>
                      ))}
                    </div>
                    <span className="mt-2 font-mono text-[10px] text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                      High frequencies zeroed ({qualitySlider}% Quality)
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* STAGE 4 OVERLAY: Interactive Split Comparison Slider */}
            <AnimatePresence>
              {activeStage.step === 4 && (
                <div
                  className="absolute inset-0 z-20 cursor-ew-resize"
                  onMouseDown={(e) => {
                    handleSplitDrag(e.clientX);
                    const onMove = (moveEvt: MouseEvent) => handleSplitDrag(moveEvt.clientX);
                    const onUp = () => {
                      window.removeEventListener('mousemove', onMove);
                      window.removeEventListener('mouseup', onUp);
                    };
                    window.addEventListener('mousemove', onMove);
                    window.addEventListener('mouseup', onUp);
                  }}
                  onTouchMove={(e) => {
                    if (!e.touches[0]) return;
                    handleSplitDrag(e.touches[0].clientX);
                  }}
                >
                  {/* Left Side: Original Tag */}
                  <div className="absolute top-4 left-4 z-20 px-2.5 py-1 rounded bg-neutral-950/85 text-neutral-300 font-mono text-[10px] border border-neutral-700 pointer-events-none">
                    Original JPEG ({originalSizeKb} KB)
                  </div>

                  {/* Right Side: WebP Mask */}
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
                  >
                    <img
                      src="/Optiweb.webp"
                      alt="Optimized WebP render"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 z-20 px-2.5 py-1 rounded bg-emerald-950/90 text-emerald-300 font-mono text-[10px] border border-emerald-500/50 pointer-events-none">
                      WebP Result ({webpSizeKb} KB · -{savedPercent}%)
                    </div>
                  </div>

                  {/* Split Divider Handle */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.8)] z-30 pointer-events-none"
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-neutral-900 border-2 border-white shadow-xl flex items-center justify-center text-[10px] text-white">
                      ⇔
                    </div>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Explanatory Context & Live Quality Simulator */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
          {/* Active Stage Card with Crisp, Short Description */}
          <SpotlightCard className="p-5 border-neutral-200/80 dark:border-neutral-800 space-y-2.5 bg-white dark:bg-[#11141b]">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-neutral-950 text-[11px] font-bold font-mono flex items-center justify-center shrink-0">
                {activeStage.step}
              </span>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                {activeStage.title}
              </h3>
            </div>

            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              {activeStage.tagline}
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed font-normal">
              {activeStage.description}
            </p>

            <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
              <DecryptedText text={activeStage.technicalDetails} triggerOnHover={true} speed={20} />
            </div>
          </SpotlightCard>

          {/* Live Metrics Telemetry */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#141822] border border-neutral-200/80 dark:border-neutral-800">
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block font-medium">
                Payload Reduction
              </span>
              <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 tabular-nums">
                -<AnimatedNumber value={savedPercent} />%
              </div>
              <div className="flex items-center gap-1 text-[10px] font-mono text-neutral-400 dark:text-neutral-500 mt-1">
                <span>{originalSizeKb} KB</span>
                <ArrowRight className="w-3 h-3 text-neutral-400 inline shrink-0" />
                <span><AnimatedNumber value={webpSizeKb} /> KB</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#141822] border border-neutral-200/80 dark:border-neutral-800">
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block font-medium">
                In-Browser Encode
              </span>
              <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-white mt-0.5 tabular-nums">
                <AnimatedNumber value={encodingTimeMs} />ms
              </div>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-medium block mt-1">
                0ms Server Upload
              </span>
            </div>
          </div>

          {/* USER REQUEST #4: Quality Factor Simulator with Great Colors & Quick Presets */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 dark:from-emerald-950/40 dark:via-[#111622] dark:to-teal-950/30 border border-emerald-500/30 dark:border-emerald-500/40 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-white">
                <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Simulate WebP Quality Factor:</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-lg font-mono text-xs font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-500/20 border border-emerald-500/30">
                {qualitySlider}%
              </span>
            </div>

            {/* Vibrant Quality Range Slider */}
            <input
              type="range"
              min="50"
              max="100"
              value={qualitySlider}
              onChange={(e) => setQualitySlider(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-500 h-2 bg-emerald-200 dark:bg-emerald-950/80 rounded-lg cursor-pointer"
            />

            {/* Clickable Preset Quick Chips with Vibrant Contrast Colors */}
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setQualitySlider(60)}
                className={`py-1.5 px-2 text-[10px] font-mono font-semibold rounded-lg border transition-all cursor-pointer text-center ${
                  qualitySlider <= 65
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white/80 dark:bg-neutral-850/80 text-neutral-700 dark:text-neutral-300 border-neutral-200/90 dark:border-neutral-700 hover:border-emerald-500/50 hover:text-emerald-600 dark:hover:text-emerald-400'
                }`}
              >
                60% (Max Speed)
              </button>

              <button
                type="button"
                onClick={() => setQualitySlider(85)}
                className={`py-1.5 px-2 text-[10px] font-mono font-semibold rounded-lg border transition-all cursor-pointer text-center ${
                  qualitySlider > 65 && qualitySlider < 95
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white/80 dark:bg-neutral-850/80 text-neutral-700 dark:text-neutral-300 border-neutral-200/90 dark:border-neutral-700 hover:border-emerald-500/50 hover:text-emerald-600 dark:hover:text-emerald-400'
                }`}
              >
                85% (Smart Auto)
              </button>

              <button
                type="button"
                onClick={() => setQualitySlider(100)}
                className={`py-1.5 px-2 text-[10px] font-mono font-semibold rounded-lg border transition-all cursor-pointer text-center ${
                  qualitySlider >= 95
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white/80 dark:bg-neutral-850/80 text-neutral-700 dark:text-neutral-300 border-neutral-200/90 dark:border-neutral-700 hover:border-emerald-500/50 hover:text-emerald-600 dark:hover:text-emerald-400'
                }`}
              >
                100% (Lossless VP8L)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
