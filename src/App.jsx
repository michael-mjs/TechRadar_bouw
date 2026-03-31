import { useState, useEffect, useMemo } from 'react'
import RadarChart from './components/Radar/RadarChart'
import Sidebar from './components/Sidebar/Sidebar'
import FilterPanel from './components/Sidebar/FilterPanel'
import { loadRadarData, ringsInfo } from './data/dataLoader'

function App() {
  const [radarData, setRadarData] = useState(null)
  const [selectedBlip, setSelectedBlip] = useState(null)
  const [hoveredBlip, setHoveredBlip] = useState(null)
  const [activeFilters, setActiveFilters] = useState([])
  const [activeRings, setActiveRings] = useState([0, 1, 2, 3])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadRadarData().then(data => {
      setRadarData(data)
      setActiveFilters(data.typeRobots)
    })
  }, [])

  const handleToggleFilter = (type) => {
    setActiveFilters(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const handleToggleRing = (ringId) => {
    setActiveRings(prev =>
      prev.includes(ringId)
        ? prev.filter(r => r !== ringId)
        : [...prev, ringId].sort()
    )
  }

  // Count blips per ring (before filtering)
  const ringCounts = useMemo(() => {
    if (!radarData) return {};
    const counts = {};
    radarData.blips.forEach(b => {
      counts[b.ring] = (counts[b.ring] || 0) + 1;
    });
    return counts;
  }, [radarData]);

  const filteredBlips = useMemo(() => {
    if (!radarData) return [];
    let blips = radarData.blips
      .filter(blip => activeFilters.includes(blip.metadata.typeRobot))
      .filter(blip => activeRings.includes(blip.ring));
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      blips = blips.map(blip => {
        const matches = blip.name.toLowerCase().includes(q) ||
          blip.description?.toLowerCase().includes(q) ||
          blip.metadata.hoofdfase.toLowerCase().includes(q) ||
          blip.metadata.handeling.toLowerCase().includes(q) ||
          blip.metadata.typeRobot.toLowerCase().includes(q);
        return { ...blip, dimmed: !matches };
      });
    }
    return blips;
  }, [radarData, activeFilters, activeRings, searchQuery])

  if (!radarData) {
    return (
      <div className="flex h-screen items-center justify-center font-sans bg-slate-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 text-lg">Loading Tech Radar...</p>
        </div>
      </div>
    )
  }

  const totalVisible = filteredBlips.filter(b => !b.dimmed).length;

  // Ring pill colors
  const ringColors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'];

  return (
    <div className="flex flex-col h-screen w-full bg-slate-900 overflow-hidden font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 bg-slate-800/80 border-b border-slate-700/50 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight italic">Technology Radar</h1>
            <p className="text-xs text-slate-400">Inzet Robots in de Bouw</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Ring Filter Pills */}
          <div className="flex gap-1.5">
            {ringsInfo.map((ring, i) => {
              const isActive = activeRings.includes(ring.id);
              const count = ringCounts[ring.id] || 0;
              return (
                <button
                  key={ring.id}
                  onClick={() => handleToggleRing(ring.id)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider transition-all border ${
                    isActive 
                      ? 'text-white border-transparent' 
                      : 'text-slate-500 border-slate-600/50 bg-transparent hover:text-slate-300'
                  }`}
                  style={isActive ? { backgroundColor: ringColors[i] + '33', color: ringColors[i], borderColor: ringColors[i] + '55' } : {}}
                >
                  {ring.name} <span className="ml-0.5 opacity-70">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Zoek robot of bouwtaak..."
              className="w-64 px-4 py-2 pl-10 bg-slate-700/60 border border-slate-600/50 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            />
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex gap-2 text-xs">
            <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 rounded-full font-medium">
              {totalVisible} robots
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <FilterPanel 
          typeRobots={radarData.typeRobots}
          activeFilters={activeFilters}
          onToggleFilter={handleToggleFilter}
          blips={radarData.blips}
          onSelectAll={() => setActiveFilters([...radarData.typeRobots])}
          onClearAll={() => setActiveFilters([])}
        />
        <div className="flex-1 relative overflow-hidden">
          <RadarChart 
            data={filteredBlips} 
            rings={radarData.rings}
            quadrants={radarData.quadrants}
            selectedBlip={selectedBlip}
            onSelectBlip={setSelectedBlip}
            hoveredBlip={hoveredBlip}
            onHoverBlip={setHoveredBlip}
            onClickBackground={() => setSelectedBlip(null)}
          />
          {/* Legend */}
          <div className="absolute bottom-3 left-3 bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-lg px-3 py-2 flex gap-4 text-xs text-slate-300 z-10">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-blue-400 rounded-full inline-block"></span>
              Established
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-0 h-0 inline-block" style={{ borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderBottom: '8px solid #60a5fa' }}></span>
              Concept
            </div>
          </div>
        </div>
        <Sidebar 
          selected={selectedBlip} 
          rings={radarData.rings}
          quadrants={radarData.quadrants}
          allBlips={filteredBlips.filter(b => !b.dimmed)}
          onClose={() => setSelectedBlip(null)}
          onNavigate={setSelectedBlip}
        />
      </div>
    </div>
  )
}

export default App
