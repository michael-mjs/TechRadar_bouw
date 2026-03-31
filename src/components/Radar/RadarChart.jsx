import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { calculateBlipCoordinates } from '../../utils/math';
import Blip from './Blip';
import { AnimatePresence } from 'framer-motion';

// Helper to create an SVG arc path for a wedge/slice
function describeArc(cx, cy, outerR, startAngle, endAngle) {
  const x1 = cx + outerR * Math.cos(startAngle);
  const y1 = cy + outerR * Math.sin(startAngle);
  const x2 = cx + outerR * Math.cos(endAngle);
  const y2 = cy + outerR * Math.sin(endAngle);
  const largeArc = (endAngle - startAngle) > Math.PI ? 1 : 0;
  return [
    `M ${cx} ${cy}`,
    `L ${x1} ${y1}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2}`,
    `Z`
  ].join(' ');
}

const RadarChart = ({ data, rings, quadrants, selectedBlip, onSelectBlip, hoveredBlip, onHoverBlip, onClickBackground }) => {
  const svgRef = useRef(null);
  const gRef = useRef(null);
  const [transform, setTransform] = useState(d3.zoomIdentity);
  const zoomRef = useRef(null);

  const width = 1000;
  const height = 1000;
  const outerRadius = rings[rings.length - 1]?.radius || 400;

  // Determine visible quadrants (those with at least 1 non-dimmed blip)
  const { visibleQuadrants, quadrantSlotMap } = useMemo(() => {
    const blipCountPerQuadrant = {};
    data.forEach(blip => {
      if (!blip.dimmed) {
        blipCountPerQuadrant[blip.quadrant] = (blipCountPerQuadrant[blip.quadrant] || 0) + 1;
      }
    });
    
    const visible = quadrants.filter(q => (blipCountPerQuadrant[q.id] || 0) > 0);
    const slotMap = {};
    visible.forEach((q, index) => {
      slotMap[q.id] = index;
    });
    
    return { visibleQuadrants: visible, quadrantSlotMap: slotMap };
  }, [data, quadrants]);

  const visibleCount = visibleQuadrants.length;
  const sliceAngle = visibleCount > 0 ? (2 * Math.PI) / visibleCount : 0;

  // Process blips with anti-collision using remapped quadrant slots
  const blipsWithCoords = useMemo(() => {
    const blips = data
      .filter(blip => quadrantSlotMap[blip.quadrant] !== undefined)
      .map(blip => {
        const slotIndex = quadrantSlotMap[blip.quadrant];
        const { x, y } = calculateBlipCoordinates(blip, rings, visibleCount, slotIndex);
        return { ...blip, x, y };
      });
    
    // Force-directed nudge pass to prevent overlap
    const minDist = 26;
    for (let iter = 0; iter < 12; iter++) {
      for (let i = 0; i < blips.length; i++) {
        for (let j = i + 1; j < blips.length; j++) {
          const dx = blips[j].x - blips[i].x;
          const dy = blips[j].y - blips[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minDist && dist > 0) {
            const overlap = (minDist - dist) / 2;
            const nx = (dx / dist) * overlap;
            const ny = (dy / dist) * overlap;
            blips[i].x -= nx;
            blips[i].y -= ny;
            blips[j].x += nx;
            blips[j].y += ny;
          }
        }
      }
    }
    return blips;
  }, [data, rings, visibleCount, quadrantSlotMap]);

  // Setup d3 zoom
  useEffect(() => {
    if (!svgRef.current) return;
    
    const zoom = d3.zoom()
      .scaleExtent([0.5, 4])
      .on('zoom', (event) => {
        setTransform(event.transform);
      });
    
    zoomRef.current = zoom;
    d3.select(svgRef.current).call(zoom);
    
    return () => {
      d3.select(svgRef.current).on('.zoom', null);
    };
  }, []);

  const handleZoomIn = useCallback(() => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, 1.4);
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, 0.7);
    }
  }, []);

  const handleZoomReset = useCallback(() => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current).transition().duration(500).call(zoomRef.current.transform, d3.zoomIdentity);
    }
  }, []);

  return (
    <div className="absolute inset-0">
      <svg 
        ref={svgRef}
        viewBox={`-${width/2} -${height/2} ${width} ${height}`} 
        className="w-full h-full"
        style={{ cursor: 'grab' }}
        onClick={(e) => {
          if (e.target === svgRef.current || e.target.closest('.radar-grid') || e.target.closest('.quadrant-fills')) {
            onClickBackground?.();
          }
        }}
      >
        <g ref={gRef} transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}>
          {/* Quadrant Background Fills — only visible quadrants */}
          <g className="quadrant-fills">
            {visibleQuadrants.map((quadrant, i) => {
              const startAngle = sliceAngle * i;
              const endAngle = sliceAngle * (i + 1);
              return (
                <path
                  key={`fill-${quadrant.id}`}
                  d={describeArc(0, 0, outerRadius, startAngle, endAngle)}
                  fill={quadrant.color}
                  fillOpacity={0.07}
                  stroke="none"
                />
              );
            })}
          </g>

          {/* Grid Rings */}
          <g className="radar-grid">
            {rings.map((ring, i) => (
              <circle 
                key={ring.id} 
                r={ring.radius} 
                cx="0" cy="0" 
                fill="none"
                stroke="#475569"
                strokeWidth={i === rings.length - 1 ? '2' : '1'}
                strokeDasharray={i === rings.length - 1 ? 'none' : '6 4'}
                opacity="0.5"
              />
            ))}
            {/* Slice Divider Lines — only for visible quadrants */}
            {visibleQuadrants.map((q, i) => {
              const angle = sliceAngle * i;
              return (
                <line 
                  key={`line-${q.id}`}
                  x1="0" y1="0" 
                  x2={outerRadius * Math.cos(angle)} 
                  y2={outerRadius * Math.sin(angle)} 
                  stroke="#475569"
                  strokeWidth="1"
                  opacity="0.4"
                />
              );
            })}
          </g>

          {/* Ring Labels */}
          {rings.map(ring => (
            <g key={`ring-label-${ring.id}`}>
              <rect 
                x={-ring.name.length * 4.5 - 6} 
                y={-ring.radius + 4} 
                width={ring.name.length * 9 + 12} 
                height={18} 
                rx="4" 
                fill="#1e293b" 
                fillOpacity="0.9"
                stroke="#334155"
                strokeWidth="0.5"
              />
              <text 
                x={0} 
                y={-ring.radius + 16} 
                textAnchor="middle"
                style={{ fill: '#64748b', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}
              >
                {ring.name}
              </text>
            </g>
          ))}

          {/* Quadrant Labels — following the curve */}
          <defs>
            {visibleQuadrants.map((quadrant, i) => {
              const startA = sliceAngle * i;
              const endA = sliceAngle * (i + 1);
              const midA = startA + (sliceAngle / 2);
              const labelRadius = outerRadius + 35;
              
              // We want text to be "upright". 
              // Generally, if the angle is in the bottom half (0 to PI), 
              // we should draw the arc from right to left (counter-clockwise) 
              // so the text isn't upside down.
              const isBottom = midA > 0 && midA < Math.PI;
              
              const x1 = labelRadius * Math.cos(isBottom ? endA : startA);
              const y1 = labelRadius * Math.sin(isBottom ? endA : startA);
              const x2 = labelRadius * Math.cos(isBottom ? startA : endA);
              const y2 = labelRadius * Math.sin(isBottom ? startA : endA);
              const sweep = isBottom ? 0 : 1;
              
              const pathData = `M ${x1} ${y1} A ${labelRadius} ${labelRadius} 0 0 ${sweep} ${x2} ${y2}`;
              
              return (
                <path 
                  key={`path-${quadrant.id}`} 
                  id={`quadrant-path-${quadrant.id}`} 
                  d={pathData} 
                  fill="none" 
                />
              );
            })}
          </defs>

          {visibleQuadrants.map((quadrant) => (
            <text 
              key={`label-${quadrant.id}`}
              style={{ 
                fill: quadrant.color, 
                fontSize: '13px', 
                fontWeight: 700, 
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}
            >
              <textPath 
                xlinkHref={`#quadrant-path-${quadrant.id}`} 
                startOffset="50%" 
                textAnchor="middle"
              >
                {quadrant.name}
              </textPath>
            </text>
          ))}

          {/* Blips with AnimatePresence */}
          <g className="blips">
            <AnimatePresence>
              {blipsWithCoords.map((blip, index) => (
                <Blip 
                  key={blip.id} 
                  blip={blip}
                  index={index}
                  quadrantConfig={quadrants.find(q => q.id === blip.quadrant)}
                  isSelected={selectedBlip?.id === blip.id}
                  isHovered={hoveredBlip?.id === blip.id}
                  isDimmed={blip.dimmed}
                  onSelect={() => onSelectBlip(blip)}
                  onHover={() => onHoverBlip(blip)}
                  onLeave={() => onHoverBlip(null)}
                />
              ))}
            </AnimatePresence>
          </g>

          {/* Tooltip overlay — renders on top of all blips */}
          {(() => {
            // Only show tooltip on hover, not when selected (sidebar handles that)
            const activeBlip = hoveredBlip ? blipsWithCoords.find(b => 
              hoveredBlip.id === b.id && !b.dimmed
            ) : null;
            if (!activeBlip) return null;
            
            const quad = quadrants.find(q => q.id === activeBlip.quadrant);
            const tooltipColor = quad?.color || '#333';
            const tooltipOnLeft = activeBlip.x > 80;
            const hasSubtitle = !!activeBlip.metadata?.handeling;
            const tooltipHeight = hasSubtitle ? 44 : 26;
            const subtitleText = activeBlip.metadata.handeling;
            const tooltipWidth = Math.max(
              activeBlip.name.length * 7.5 + 24, 
              (subtitleText?.length || 0) * 6 + 24,
              140
            );
            const tx = tooltipOnLeft ? -(tooltipWidth + 12) : 18;
            
            return (
              <g transform={`translate(${activeBlip.x}, ${activeBlip.y})`} style={{ pointerEvents: 'none' }}>
                <rect 
                  x={tx} y={-tooltipHeight / 2} 
                  width={tooltipWidth} 
                  height={tooltipHeight} 
                  rx="8" ry="8" 
                  fill="rgba(15, 23, 42, 0.95)" 
                  stroke={tooltipColor}
                  strokeWidth="1"
                  strokeOpacity="0.5"
                />
                <text 
                  x={tx + 10} y={hasSubtitle ? -4 : 4} 
                  style={{ fontSize: '12px', fontWeight: 700, fill: 'white', fontFamily: 'Inter, system-ui, sans-serif' }}
                >
                  {activeBlip.name.length > 30 ? activeBlip.name.substring(0, 30) + '…' : activeBlip.name}
                </text>
                {hasSubtitle && (
                  <text 
                    x={tx + 10} y={14} 
                    style={{ fontSize: '10px', fontWeight: 500, fill: tooltipColor, fontFamily: 'Inter, system-ui, sans-serif' }}
                  >
                    {subtitleText}
                  </text>
                )}
              </g>
            );
          })()}
        </g>
      </svg>

      {/* Zoom Controls */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-1">
        <button 
          onClick={handleZoomIn}
          className="w-8 h-8 bg-slate-800/90 border border-slate-600/50 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700/90 transition-all text-lg font-bold backdrop-blur-sm"
          title="Zoom in"
        >+</button>
        <button 
          onClick={handleZoomOut}
          className="w-8 h-8 bg-slate-800/90 border border-slate-600/50 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700/90 transition-all text-lg font-bold backdrop-blur-sm"
          title="Zoom out"
        >−</button>
        <button 
          onClick={handleZoomReset}
          className="w-8 h-8 bg-slate-800/90 border border-slate-600/50 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700/90 transition-all text-xs backdrop-blur-sm"
          title="Reset zoom"
        >⟲</button>
      </div>
    </div>
  );
};
export default RadarChart;
