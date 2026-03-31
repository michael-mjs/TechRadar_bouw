import React from 'react';
import { motion } from 'framer-motion';

const Blip = ({ blip, index, quadrantConfig, isSelected, isHovered, isDimmed, onSelect, onHover, onLeave }) => {
  const isOuter = blip.isNew;
  const color = quadrantConfig?.color || '#333';
  const active = isSelected || isHovered;

  const drawShape = () => {
    if (isOuter) {
      return (
        <path 
          d="M 0 -10 L 8.66 5 L -8.66 5 Z" 
          fill={color} 
        />
      );
    } else {
      return (
        <circle 
          r="9" 
          fill={color} 
        />
      );
    }
  }

  return (
    <motion.g 
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: isDimmed ? 0.15 : 1,
        x: blip.x,
        y: blip.y
      }}
      exit={{ opacity: 0 }}
      transition={{ 
        duration: 0.3,
        delay: index * 0.01,
        opacity: { duration: 0.2 }
      }}
      onMouseEnter={!isDimmed ? onHover : undefined}
      onMouseLeave={!isDimmed ? onLeave : undefined}
      onClick={(e) => { if (!isDimmed) { e.stopPropagation(); onSelect(); } }}
      className={isDimmed ? 'pointer-events-none' : 'cursor-pointer'}
      tabIndex={isDimmed ? -1 : 0}
      role="button"
      aria-label={blip.name}
      onKeyDown={(e) => { if (!isDimmed && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onSelect(); } }}
    >
      {/* Invisible larger hit area */}
      <circle r="18" fill="transparent" pointerEvents={isDimmed ? "none" : "all"} />
      
      {/* Scale the shape only, not the tooltip */}
      <g transform={active ? 'scale(1.3)' : 'scale(1)'} style={{ transition: 'transform 0.15s ease-out' }}>
        {/* Selection ring */}
        {isSelected && (
          <circle r="14" fill="none" stroke={color} strokeWidth="2" opacity="0.5" />
        )}
        
        {drawShape()}
        
        {/* Blip number */}
        <text 
          x="0" y={isOuter ? "1" : "3"} 
          fill="white"
          textAnchor="middle"
          style={{ fontSize: '9px', fontWeight: 700, fontFamily: 'Inter, system-ui, sans-serif', pointerEvents: 'none' }}
        >
          {blip.id}
        </text>
      </g>
    </motion.g>
  )
}
export default Blip;
