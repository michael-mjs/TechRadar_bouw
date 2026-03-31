import React, { useState } from 'react';

const FilterPanel = ({ typeRobots, activeFilters, onToggleFilter, blips, onSelectAll, onClearAll }) => {
  const [collapsed, setCollapsed] = useState(false);
  
  // Group "Overig" subtypes
  const overigTypes = typeRobots.filter(t => t.startsWith('Overig'));
  const mainTypes = typeRobots.filter(t => !t.startsWith('Overig'));
  const [overigOpen, setOverigOpen] = useState(false);

  // Count blips per type
  const countFor = (type) => blips?.filter(b => b.metadata.typeRobot === type).length || 0;
  const overigCount = overigTypes.reduce((sum, t) => sum + countFor(t), 0);
  const overigActiveCount = overigTypes.filter(t => activeFilters.includes(t)).length;

  const renderCheckbox = (type, label) => (
    <label key={type} className="flex items-center gap-2.5 cursor-pointer group py-1">
      <input 
        type="checkbox"
        className="w-3.5 h-3.5 rounded border-slate-500 bg-slate-700 text-blue-500 focus:ring-blue-500/30 focus:ring-offset-0 cursor-pointer accent-blue-500"
        checked={activeFilters.includes(type)}
        onChange={() => onToggleFilter(type)}
      />
      <span className="text-xs text-slate-300 leading-snug group-hover:text-white transition-colors flex-1">
        {label || type}
      </span>
      <span className="text-[10px] text-slate-500 font-mono">{countFor(type)}</span>
    </label>
  );

  if (collapsed) {
    return (
      <div className="w-10 bg-slate-800/60 border-r border-slate-700/50 flex flex-col items-center pt-4 shrink-0">
        <button onClick={() => setCollapsed(false)} className="text-slate-400 hover:text-white transition-colors p-1" title="Open filters">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
        </button>
      </div>
    );
  }

  return (
    <div className="w-56 bg-slate-800/60 border-r border-slate-700/50 backdrop-blur-sm flex flex-col h-full shrink-0">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h2 className="text-sm font-bold text-white tracking-tight">Filters</h2>
        <button onClick={() => setCollapsed(true)} className="text-slate-400 hover:text-white transition-colors p-0.5" title="Collapse">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
        </button>
      </div>

      {/* Select All / Clear All */}
      <div className="flex gap-2 px-4 pb-3">
        <button onClick={onSelectAll} className="text-[10px] text-blue-400 hover:text-blue-300 font-medium transition-colors">Select All</button>
        <span className="text-slate-600">|</span>
        <button onClick={onClearAll} className="text-[10px] text-blue-400 hover:text-blue-300 font-medium transition-colors">Clear All</button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
        {/* Main Types */}
        <div>
          <h3 className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Type Robot</h3>
          <div className="space-y-0.5">
            {mainTypes.map(type => renderCheckbox(type))}
          </div>
        </div>
        
        {/* Overig group */}
        {overigTypes.length > 0 && (
          <div>
            <button 
              onClick={() => setOverigOpen(!overigOpen)}
              className="flex items-center gap-2 w-full text-left group"
            >
              <svg className={`w-3 h-3 text-slate-500 transition-transform ${overigOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-300 transition-colors">
                Overig ({overigActiveCount}/{overigTypes.length})
              </span>
              <span className="text-[10px] text-slate-600 font-mono ml-auto">{overigCount}</span>
            </button>
            {overigOpen && (
              <div className="ml-5 mt-1 space-y-0.5">
                {overigTypes.map(type => renderCheckbox(type, type.replace('Overig ', '').replace('Overig', 'Overig (Algemeen)')))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterPanel;
