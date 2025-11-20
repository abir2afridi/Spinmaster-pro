
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { arc as d3Arc, rgb as d3Rgb } from 'd3';
import { Play, Star, Heart, Crown, Zap, Smile } from 'lucide-react';
import { WheelEntry } from '../types';
import { audioManager } from '../utils/audio';

interface WheelProps {
  entries: WheelEntry[];
  isSpinning: boolean;
  onSpinComplete: (winner: WheelEntry) => void;
  onSpinStart: () => void;
  spinDuration: number;
  enableSound: boolean;
  triggerSpin: number;
  wheelImage?: string;
  rimColor: string;
  winSound: string;
  tickSound: string;
  centerHubColor: string;
  centerHubIcon: string;
  centerHubShape: string;
  centerHubText: string;
  pointerStyle: string;
  pointerColor: string;
}

const EASING = (t: number) => 1 - Math.pow(1 - t, 4); // Quartic ease-out

const Wheel: React.FC<WheelProps> = ({
  entries,
  isSpinning,
  onSpinComplete,
  onSpinStart,
  spinDuration,
  enableSound,
  triggerSpin,
  wheelImage,
  rimColor,
  winSound,
  tickSound,
  centerHubColor,
  centerHubIcon,
  centerHubShape,
  centerHubText,
  pointerStyle = 'classic',
  pointerColor = '#f43f5e'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<SVGSVGElement>(null);
  
  // Animation Refs
  const animationFrameId = useRef<number>(0);
  const rotationRef = useRef<number>(0);
  const startRotationRef = useRef<number>(0);
  const targetRotationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const lastTickRef = useRef<number>(0);

  const [size, setSize] = useState({ width: 500, height: 500 });
  const [winningIndex, setWinningIndex] = useState<number | null>(null);
  
  const activeEntries = useMemo(() => entries.filter(e => e.enabled), [entries]);
  const totalSegments = activeEntries.length;

  // Reset winner if active entries change (e.g. winner removed)
  useEffect(() => {
    setWinningIndex(null);
  }, [activeEntries]);

  // 1. Resize Observer
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { offsetWidth } = containerRef.current;
        const newSize = Math.min(offsetWidth, 600);
        setSize({ width: newSize, height: newSize });
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 2. Spin Logic (Physics Loop)
  useEffect(() => {
    if (triggerSpin === 0 || totalSegments === 0) return;

    onSpinStart();
    setWinningIndex(null); // Reset highlight

    // Calculate Winner & Target
    const sliceAngle = 360 / totalSegments;
    
    const currentRot = rotationRef.current;
    
    const spins = 5 + Math.floor(Math.random() * 3); // 5 to 7 full spins
    
    const totalRotation = 360 * spins + Math.random() * 360;
    
    startRotationRef.current = currentRot;
    targetRotationRef.current = currentRot + totalRotation;
    startTimeRef.current = performance.now();
    
    const animate = (time: number) => {
      const elapsed = (time - startTimeRef.current) / 1000; // seconds
      const progress = Math.min(elapsed / spinDuration, 1);
      const easedProgress = EASING(progress);
      
      const currentAngle = startRotationRef.current + (targetRotationRef.current - startRotationRef.current) * easedProgress;
      rotationRef.current = currentAngle;

      if (enableSound) {
        const tickInterval = sliceAngle;
        if (Math.floor(currentAngle / tickInterval) > Math.floor(lastTickRef.current / tickInterval)) {
           audioManager.playTick(tickSound);
        }
        lastTickRef.current = currentAngle;
      }

      if (canvasRef.current) {
        canvasRef.current.style.transform = `rotate(${currentAngle}deg)`;
      }

      if (progress < 1) {
        animationFrameId.current = requestAnimationFrame(animate);
      } else {
        // Finished
        if (enableSound) audioManager.playWin(winSound);
        
        // Calculate actual winner based on final rotation
        const normalizedAngle = currentAngle % 360;
        let pointerAngleOnWheel = (90 - normalizedAngle) % 360;
        if (pointerAngleOnWheel < 0) pointerAngleOnWheel += 360;
        
        const winningIdx = Math.floor(pointerAngleOnWheel / sliceAngle);
        const finalIndex = Math.min(Math.max(winningIdx, 0), totalSegments - 1);
        
        setWinningIndex(finalIndex); // Apply visual highlight
        onSpinComplete(activeEntries[finalIndex]);
      }
    };

    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerSpin]);

  // Helper to determine rim appearance
  const getRimProps = (color: string) => {
    switch (color) {
      case 'default':
        // Use transparent shadow for smoother transition to/from glow
        return { 
            stroke: '#cbd5e1', 
            filter: 'drop-shadow(0 0 0 rgba(0,0,0,0))', 
            className: 'dark:stroke-slate-600' 
        };
      case 'rainbow':
        return { 
            stroke: 'url(#rainbow-rim)', 
            filter: 'url(#glow-rainbow)', 
            className: '' 
        };
      case 'gold':
        return { 
            stroke: 'url(#gold-rim)', 
            filter: 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.6))', 
            className: '' 
        };
      default:
        // Custom color or Neon presets
        return { 
          stroke: color, 
          filter: `drop-shadow(0 0 10px ${color})`, // Enhanced glow
          className: '' 
        };
    }
  };

  const renderHubIconContent = () => {
    const iconClass = "text-slate-800 dark:text-white drop-shadow-sm opacity-90";
    switch(centerHubIcon) {
      case 'play': return <Play size={32} fill="currentColor" className={`${iconClass} ml-1`} />;
      case 'star': return <Star size={30} fill="currentColor" className={iconClass} />;
      case 'heart': return <Heart size={30} fill="currentColor" className={iconClass} />;
      case 'crown': return <Crown size={30} className={iconClass} />;
      case 'zap': return <Zap size={30} fill="currentColor" className={iconClass} />;
      case 'smile': return <Smile size={30} className={iconClass} />;
      case 'text': default: 
        return (
            <div className="text-slate-900 dark:text-white font-display text-xs tracking-wider opacity-90 font-bold truncate max-w-[90%] text-center">
                {centerHubText || 'SPIN'}
            </div>
        );
    }
  };

  // Render different pointer paths based on style
  const renderPointerPath = () => {
    const filter = "url(#glow)";
    switch (pointerStyle) {
      case 'arrow':
        return (
          <path 
            d="M 30 58 L 10 25 L 22 25 L 22 2 L 38 2 L 38 25 L 50 25 Z" 
            fill={pointerColor}
            stroke="white" 
            strokeWidth="3" 
            filter={filter} 
          />
        );
      case 'minimal':
        return (
          <path 
            d="M 30 50 L 15 20 L 45 20 Z" 
            fill={pointerColor}
            stroke="white" 
            strokeWidth="2"
          />
        );
      case 'neon':
        return (
           <g>
             <path d="M 30 55 L 5 10 L 55 10 Z" fill="none" stroke={pointerColor} strokeWidth="4" filter={filter} />
             <path d="M 30 55 L 5 10 L 55 10 Z" fill="none" stroke={pointerColor} strokeWidth="2" className="animate-pulse" />
           </g>
        );
      case 'rounded':
        return (
          <path 
            d="M 30 55 L 10 15 Q 30 5 50 15 Z" 
            fill={pointerColor}
            stroke="white" 
            strokeWidth="4" 
            filter={filter}
          />
        );
      case 'classic':
      default:
        return (
          <path 
            d="M 30 55 L 5 10 L 55 10 Z" 
            fill={pointerColor}
            stroke="white" 
            strokeWidth="4" 
            filter={filter} 
          />
        );
    }
  };

  const getHubShapeClass = () => {
      switch (centerHubShape) {
          case 'square': return 'rounded-lg';
          case 'rounded': return 'rounded-2xl';
          case 'circle': default: return 'rounded-full';
      }
  };
  
  const hubShapeClass = getHubShapeClass();
  
  const hubStyle = centerHubColor === 'default' 
    ? {} 
    : { background: centerHubColor, border: 'none' };
    
  const hubClass = centerHubColor === 'default'
    ? `bg-gradient-to-br from-white to-slate-200 dark:from-slate-700 dark:to-slate-900 border-2 border-slate-100 dark:border-slate-600`
    : `shadow-inner`;

  // D3 Generator
  const radius = size.width / 2;
  // Reduce radius slightly to accommodate the thick rim border without clipping
  const wheelRadius = radius - 15; 

  const arc = d3Arc<any, WheelEntry>()
    .outerRadius(wheelRadius)
    .innerRadius(radius * 0.15) // Hub hole
    .startAngle((d, i) => (i * 2 * Math.PI) / totalSegments)
    .endAngle((d, i) => ((i + 1) * 2 * Math.PI) / totalSegments);

  if (totalSegments === 0) {
    return (
      <div className="flex items-center justify-center h-96 w-full glass-panel rounded-full border-4 border-dashed border-slate-300 dark:border-slate-600">
        <p className="text-xl font-semibold text-slate-500">Add items to spin!</p>
      </div>
    );
  }

  const rimProps = getRimProps(rimColor);

  return (
    <div className="relative flex items-center justify-center wheel-shadow" ref={containerRef}>
      <style>{`
        @keyframes winner-pulse {
          0% { filter: brightness(1) drop-shadow(0 0 0 rgba(255,255,255,0)); }
          50% { filter: brightness(1.3) drop-shadow(0 0 15px rgba(255,255,255,0.6)); }
          100% { filter: brightness(1) drop-shadow(0 0 0 rgba(255,255,255,0)); }
        }
        .winner-path {
          animation: winner-pulse 1.5s infinite ease-in-out;
          stroke-width: 4px !important;
          stroke: white !important;
          stroke-opacity: 1 !important;
          z-index: 10;
        }
      `}</style>

      {/* Pointer */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 z-20 translate-x-[30%] filter drop-shadow-lg">
         <svg width="60" height="60" viewBox="0 0 60 60" className="rotate-90">
            <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            {renderPointerPath()}
         </svg>
      </div>

      {/* Wheel SVG */}
      <div 
        style={{ width: size.width, height: size.height }}
        className="rounded-full overflow-visible"
      >
        <svg 
            ref={canvasRef}
            width={size.width} 
            height={size.height} 
            viewBox={`0 0 ${size.width} ${size.height}`}
            className="overflow-visible will-change-transform"
        >
          <defs>
            {/* Gradients for each color */}
            {activeEntries.map((entry, i) => (
              <radialGradient key={`grad-${i}`} id={`grad-${i}`} cx="50%" cy="50%" r="70%" fx="50%" fy="50%">
                 <stop 
                    offset="40%" 
                    stopColor={entry.color} 
                    style={{ 
                        stopColor: entry.color, 
                        transition: 'stop-color 0.5s ease-in-out' 
                    }} 
                 />
                 <stop 
                    offset="100%" 
                    stopColor={d3Rgb(entry.color).darker(0.8).toString()} 
                    style={{ 
                        stopColor: d3Rgb(entry.color).darker(0.8).toString(), 
                        transition: 'stop-color 0.5s ease-in-out' 
                    }}
                 />
              </radialGradient>
            ))}
            
            {/* Rim Gradients */}
            <linearGradient id="rainbow-rim" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff0000" />
              <stop offset="16%" stopColor="#ff8800" />
              <stop offset="33%" stopColor="#ffff00" />
              <stop offset="50%" stopColor="#00ff00" />
              <stop offset="66%" stopColor="#0088ff" />
              <stop offset="83%" stopColor="#0000ff" />
              <stop offset="100%" stopColor="#ff00ff" />
            </linearGradient>

            <linearGradient id="gold-rim" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#BF953F" />
              <stop offset="25%" stopColor="#FCF6BA" />
              <stop offset="50%" stopColor="#B38728" />
              <stop offset="75%" stopColor="#FBF5B7" />
              <stop offset="100%" stopColor="#AA771C" />
            </linearGradient>

            <filter id="glow-rainbow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="slice-shadow" x="-20%" y="-20%" width="140%" height="140%">
                 <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
                 <feOffset dx="1" dy="1" result="offsetblur"/>
                 <feComponentTransfer>
                    <feFuncA type="linear" slope="0.3"/>
                 </feComponentTransfer>
                 <feMerge> 
                    <feMergeNode/>
                    <feMergeNode in="SourceGraphic"/> 
                 </feMerge>
            </filter>
            
            {/* Clip Path for Wheel Image Skin */}
            <clipPath id="wheel-skin-clip">
                <circle cx={0} cy={0} r={wheelRadius} />
            </clipPath>
          </defs>
          
          <g transform={`translate(${radius},${radius})`}>
            {/* Base Circle Background */}
            <circle r={wheelRadius} fill="#fff" className="dark:fill-slate-700" />
            
            {/* Wheel Skin Image */}
            {wheelImage && (
                <image 
                    href={wheelImage}
                    x={-wheelRadius}
                    y={-wheelRadius}
                    width={wheelRadius * 2}
                    height={wheelRadius * 2}
                    clipPath="url(#wheel-skin-clip)"
                    preserveAspectRatio="xMidYMid slice"
                />
            )}

            {/* Segments */}
            {activeEntries.map((entry, i) => {
               const angle = (i * 2 * Math.PI) / totalSegments + Math.PI / totalSegments;
               // Calculate centroid for text
               const [x, y] = arc.centroid(entry as any, i);
               
               // Text Rotation: Needs to be perpendicular to the radius
               const textRot = (angle * 180 / Math.PI) + 90 - 180; // 90 degree offset
               
               const isWinner = i === winningIndex;
               
               // If wheel image is active, use the color with low opacity, otherwise use gradient
               const fill = wheelImage ? entry.color : `url(#grad-${i})`;
               const fillOpacity = wheelImage ? 0.2 : 1;

               return (
                <g key={entry.id}>
                  <path
                    d={arc(entry as any, i) || undefined}
                    fill={fill}
                    fillOpacity={fillOpacity}
                    stroke="white"
                    strokeWidth="2"
                    strokeOpacity={wheelImage ? 0.8 : 0.5}
                    className={isWinner ? "winner-path" : ""}
                    style={{ 
                        transition: 'fill 0.5s, stroke 0.3s, stroke-width 0.3s' 
                    }}
                  />
                  <g transform={`translate(${x}, ${y}) rotate(${textRot})`}>
                      <text
                        textAnchor="middle"
                        alignmentBaseline="middle"
                        fill="white"
                        fontSize={Math.min(24, (2 * Math.PI * radius) / totalSegments / 2)}
                        fontFamily="Outfit, sans-serif"
                        fontWeight="700"
                        style={{ 
                            textShadow: '0px 2px 4px rgba(0,0,0,0.8)',
                            pointerEvents: 'none'
                        }}
                      >
                        {entry.text.length > 18 ? entry.text.substring(0, 16) + '...' : entry.text}
                      </text>
                  </g>
                </g>
              );
            })}
            
            {/* Distinct Outer Rim Border */}
            <circle 
                r={wheelRadius + 4} // Slightly larger to frame the wheel
                fill="none"
                strokeWidth={12}
                stroke={rimProps.stroke}
                filter={rimProps.filter}
                className={rimProps.className}
                style={{ 
                    transition: 'stroke 0.5s ease-in-out, filter 0.5s ease-in-out, stroke-width 0.3s' 
                }}
            />
            
            {/* Inner Rim Divider (Thin line between rim and segments for contrast) */}
             <circle 
                r={wheelRadius}
                fill="none"
                stroke="rgba(0,0,0,0.2)"
                strokeWidth={2}
            />
          </g>
        </svg>
      </div>
      
      {/* Center Hub (Floating) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div 
            className={`w-16 h-16 ${hubShapeClass} shadow-[0_5px_15px_rgba(0,0,0,0.3)] flex items-center justify-center ${hubClass} transition-all duration-300 overflow-hidden`}
            style={hubStyle}
          >
              {renderHubIconContent()}
          </div>
      </div>
    </div>
  );
};

export default Wheel;