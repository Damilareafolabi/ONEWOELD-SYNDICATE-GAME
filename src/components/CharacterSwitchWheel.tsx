import { X } from 'lucide-react';
import { PROTAGONISTS } from '../engine/worldData';
import { PlayerVitalMetrics, ProtagonistId } from '../engine/types';

interface CharacterSwitchWheelProps {
  open: boolean;
  activeId: ProtagonistId;
  vitals: PlayerVitalMetrics;
  onSelect: (id: ProtagonistId) => void;
  onClose: () => void;
}

const WHEEL_ORDER: { id: ProtagonistId; positionClass: string; hotkey: string }[] = [
  { id: 'kaz', positionClass: 'top-2 left-1/2 -translate-x-1/2', hotkey: '1' },
  { id: 'zuri_dapo', positionClass: 'bottom-4 left-2 sm:left-4', hotkey: '2' },
  { id: 'folabi', positionClass: 'bottom-4 right-2 sm:right-4', hotkey: '3' },
];

export function CharacterSwitchWheel({
  open,
  activeId,
  vitals,
  onSelect,
  onClose,
}: CharacterSwitchWheelProps) {
  if (!open) return null;

  const activeProfile = PROTAGONISTS[activeId];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75"
      role="dialog"
      aria-modal="true"
      aria-label="3-Character Switch Wheel"
      onClick={onClose}
    >
      <div
        className="relative w-[360px] h-[360px] sm:w-[460px] sm:h-[460px] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Radial SVG Crosshair Ring */}
        <svg
          viewBox="0 0 400 400"
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <circle
            cx="200"
            cy="200"
            r="152"
            fill="rgba(12,14,19,0.72)"
            stroke="rgba(229,169,60,0.32)"
            strokeWidth="1.5"
            strokeDasharray="6 6"
          />
          <circle
            cx="200"
            cy="200"
            r="74"
            fill="rgba(16,18,26,0.94)"
            stroke="rgba(255,255,255,0.14)"
            strokeWidth="1"
          />
          <line x1="200" y1="48" x2="200" y2="126" stroke="rgba(229,169,60,0.28)" strokeWidth="1" />
          <line x1="68" y1="276" x2="136" y2="236" stroke="rgba(16,185,129,0.28)" strokeWidth="1" />
          <line x1="332" y1="276" x2="264" y2="236" stroke="rgba(96,165,250,0.28)" strokeWidth="1" />
        </svg>

        {/* Center Telemetry Core */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center w-[132px]">
          <span className="font-mono-tabular text-[10px] tracking-widest text-[#E5A93C]">
            CREW SWITCH
          </span>
          <span className="font-display text-lg font-semibold text-[#F4F1EA] leading-tight mt-0.5">
            {activeProfile.codeName}
          </span>
          <span className="text-[11px] text-white/60 mt-1 font-mono-tabular">
            LOYALTY {vitals.partnerLoyalty}%
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close character switch wheel"
            className="mt-2 flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 hover:text-white hover:border-white/40 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* 3 Protagonist Wedges */}
        {WHEEL_ORDER.map(({ id, positionClass, hotkey }) => {
          const p = PROTAGONISTS[id];
          const isSelected = id === activeId;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(id)}
              className={`absolute ${positionClass} group flex w-[156px] sm:w-[178px] items-center gap-3 rounded-lg border p-2 text-left transition-all duration-150 focus-visible:outline-2 focus-visible:outline-[#E5A93C] ${
                isSelected
                  ? 'border-[#E5A93C] bg-[#191D28] shadow-[0_0_24px_rgba(229,169,60,0.2)]'
                  : 'border-white/15 bg-[#11141C]/95 hover:border-[#E5A93C]/70 hover:bg-[#171B26]'
              }`}
            >
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-white/15 bg-[#1B1F2A]">
                <img
                  src={p.portraitUrl}
                  alt={p.fullName}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
                <span className="absolute bottom-0.5 right-0.5 bg-black/80 px-1 text-[9px] font-mono-tabular text-[#E5A93C]">
                  {hotkey}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-display text-sm font-semibold text-[#F4F1EA] truncate">
                    {p.codeName}
                  </span>
                </div>
                <p className="text-[11px] text-white/65 truncate">{p.archetype}</p>
                <p className="text-[10px] text-[#E5A93C] truncate">{p.district}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
