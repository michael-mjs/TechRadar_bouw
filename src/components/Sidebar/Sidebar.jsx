import React from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const Sidebar = ({ selected, rings, quadrants, allBlips, onClose, onNavigate }) => {
  if (!selected) {
    return (
      <div className="w-96 bg-slate-800/60 border-l border-slate-700/50 backdrop-blur-sm p-6 flex flex-col overflow-y-auto shrink-0">
        <h2 className="text-xl font-bold text-white mb-1 tracking-tight">Technology Radar</h2>
        <p className="text-xs text-slate-500 mb-5">Inzet Robots in de Bouw</p>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          {rings?.map(ring => {
            const count = allBlips?.filter(b => b.ring === ring.id && !b.dimmed).length || 0;
            return (
              <div key={ring.id} className="bg-slate-700/40 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-white">{count}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">{ring.name}</div>
              </div>
            );
          })}
        </div>

        {/* Content sections */}
        <div className="space-y-5 text-sm leading-relaxed">
          {/* Wat is een Technology Radar? */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Wat is een Technology Radar?</h3>
            <p className="text-slate-400 text-[13px]">
              Een Technology Radar is een krachtig, visueel instrument dat organisaties helpt om de stormvloed aan nieuwe technologieën te structureren en te evalueren. Je kunt de radar zien als een soort <em className="text-slate-300 not-italic font-medium">'weerkaart' voor innovatie</em>.
            </p>
          </div>

          {/* Ring descriptions */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5">De Ringen</h3>
            <div className="space-y-2.5">
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                  <span className="text-green-400 text-xs font-bold uppercase tracking-wider">Adopt</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Bewezen technologieën die direct waarde opleveren. Bouwbedrijven kunnen deze nu al veilig en effectief integreren.
                </p>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  <span className="text-blue-400 text-xs font-bold uppercase tracking-wider">Trial</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Veelbelovende innovaties, klaar voor pilotprojecten. Werken in gecontroleerde omstandigheden maar vereisen nog experimenteerruimte.
                </p>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">Concept / Assess</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Technologieën volop in ontwikkeling. Enorme potentie, maar nog niet klaar voor grootschalige uitrol.
                </p>
              </div>
            </div>
          </div>

          {/* Waarom? */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Waarom deze Radar?</h3>
            <div className="space-y-2">
              <div className="flex gap-2">
                <span className="text-slate-500 mt-0.5 shrink-0">1.</span>
                <p className="text-slate-400 text-[13px]"><span className="text-slate-300 font-medium">Hype scheiden van realiteit</span> — Direct zien welke usecases vandaag bruikbaar zijn en welke nog toekomstmuziek zijn.</p>
              </div>
              <div className="flex gap-2">
                <span className="text-slate-500 mt-0.5 shrink-0">2.</span>
                <p className="text-slate-400 text-[13px]"><span className="text-slate-300 font-medium">Strategische besluitvorming</span> — Gerichte keuzes maken: waar investeren, welke pilots draaien?</p>
              </div>
              <div className="flex gap-2">
                <span className="text-slate-500 mt-0.5 shrink-0">3.</span>
                <p className="text-slate-400 text-[13px]"><span className="text-slate-300 font-medium">Overzicht in een gefragmenteerde markt</span> — Robots gecategoriseerd op bouwtaak en type.</p>
              </div>
            </div>
          </div>

          {/* Hoe gebruiken? */}
          <div className="bg-slate-700/30 border border-slate-700/50 rounded-xl p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Hoe gebruik je deze app?</h3>
            <p className="text-slate-400 text-[13px] leading-relaxed">
              Blader door de radar, klik op de blips en ontdek uitgebreide usecases, impactanalyses en de bedrijven achter de technologie. Gebruik de <span className="text-slate-300 font-medium">filters</span> links om op robot-type te filteren en de <span className="text-slate-300 font-medium">ringknoppen</span> bovenin om op status te filteren.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const quad = quadrants?.find(q => q.id === selected.quadrant);
  const ring = rings?.find(r => r.id === selected.ring);
  
  // Navigation: find current index in allBlips
  const currentIndex = allBlips?.findIndex(b => b.id === selected.id) ?? -1;
  const prevBlip = currentIndex > 0 ? allBlips[currentIndex - 1] : null;
  const nextBlip = currentIndex < (allBlips?.length || 0) - 1 ? allBlips[currentIndex + 1] : null;

  return (
    <div className="w-96 bg-slate-800/60 border-l border-slate-700/50 backdrop-blur-sm p-6 flex flex-col overflow-y-auto shrink-0">
      {/* Top bar: nav + close */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-1">
          <button 
            onClick={() => prevBlip && onNavigate(prevBlip)}
            disabled={!prevBlip}
            className="p-1.5 rounded-md hover:bg-slate-700/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Vorige"
          >
            <ChevronLeft size={16} className="text-slate-400" />
          </button>
          <span className="text-xs text-slate-500 font-mono">
            {currentIndex + 1}/{allBlips?.length || 0}
          </span>
          <button 
            onClick={() => nextBlip && onNavigate(nextBlip)}
            disabled={!nextBlip}
            className="p-1.5 rounded-md hover:bg-slate-700/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Volgende"
          >
            <ChevronRight size={16} className="text-slate-400" />
          </button>
        </div>
        <button 
          onClick={onClose}
          className="p-1.5 hover:bg-slate-700/60 rounded-md transition-colors"
        >
          <X size={16} className="text-slate-400" />
        </button>
      </div>

      {/* Name */}
      <h2 className="text-xl font-bold text-white mb-4 leading-tight">{selected.name}</h2>
      
      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-5">
        {quad && (
          <span 
            className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider text-white"
            style={{ backgroundColor: quad.color + 'cc' }}
          >
            {quad.name}
          </span>
        )}
        {ring && (
          <span className="px-2.5 py-1 rounded-full bg-slate-700/80 text-slate-300 text-[10px] font-semibold uppercase tracking-wider">
            {ring.name}
          </span>
        )}
      </div>

      <div className="space-y-5">
        {/* Description */}
        <div>
          <h3 className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Omschrijving</h3>
          <p className="text-slate-300 leading-relaxed text-sm">
            {selected.description}
          </p>
        </div>

        {/* Metadata */}
        {selected.metadata && (
          <div className="bg-slate-700/30 border border-slate-700/50 p-4 rounded-xl space-y-3">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Hoofdfase</span>
              <p className="text-sm text-slate-300 mt-0.5">{selected.metadata.hoofdfase}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Specifieke Handeling</span>
              <p className="text-sm text-slate-300 mt-0.5">{selected.metadata.handeling}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Type Robot</span>
              <p className="text-sm text-slate-300 mt-0.5">{selected.metadata.typeRobot}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</span>
              <p className="text-sm text-slate-300 mt-0.5">{selected.metadata.rawStatus}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Partners & Locatie</span>
              <p className="text-sm text-slate-400 mt-0.5 italic">{selected.metadata.partners}</p>
            </div>
          </div>
        )}

        {selected.isNew && (
          <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
            <h4 className="flex items-center gap-2 text-blue-300 font-bold mb-1 text-sm">
              ✨ Concept / Early Trial
            </h4>
            <p className="text-blue-400/80 text-xs">
              Deze technologie bevindt zich momenteel in een conceptuele of vroege testfase.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Sidebar;
