import { BatteryCharging, BedDouble, Droplets, Flame, Fuel, Utensils, Zap } from 'lucide-react';
import { DomesticQuartersState, PlayerVitalMetrics } from '../engine/types';
import { SCENE_ART } from '../engine/worldData';
import { CanvasSceneFX } from './CanvasSceneFX';

interface SurulereQuartersStageProps {
  quarters: DomesticQuartersState;
  vitals: PlayerVitalMetrics;
  onSoakGarri: () => void;
  onToggleStove: () => void;
  onCookWarmMeal: () => void;
  onPourWater: () => void;
  onTogglePowerSource: () => void;
  onRefuelGenerator: () => void;
  onRestOnMattress: () => void;
  onGrabBlackStallion: () => void;
}

export function SurulereQuartersStage({
  quarters,
  vitals,
  onSoakGarri,
  onToggleStove,
  onCookWarmMeal,
  onPourWater,
  onTogglePowerSource,
  onRefuelGenerator,
  onRestOnMattress,
  onGrabBlackStallion,
}: SurulereQuartersStageProps) {
  const powerOut = quarters.powerSource === 'NEPA_GRID' && !quarters.nepaGridActive;

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0A0B0E]">
      {/* Authentic Surulere Living Quarters Set */}
      <img
        src={SCENE_ART.surulereQuarters}
        alt="Surulere Domestic Living Quarters"
        referrerPolicy="no-referrer"
        className={`animate-ken-burns absolute inset-0 h-full w-full object-cover transition-[filter] duration-500 ${
          powerOut ? 'brightness-50 contrast-110' : 'brightness-95'
        }`}
      />

      <CanvasSceneFX mode="interior" powerOut={powerOut} stoveLit={quarters.stoveLit} />

      <div className="cinema-vignette pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0A0B0E] via-[#0A0B0E]/20 to-[#0A0B0E]/40" />

      {/* Spatial In-Scene Hotspots */}
      {/* 1. Wooden Food Cupboard */}
      <button
        type="button"
        onClick={onSoakGarri}
        className="group absolute left-[10%] top-[38%] z-20 flex items-center gap-2 rounded-md border border-[#E5A93C]/60 bg-[#0A0B0E]/85 px-3 py-1.5 text-left transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-[#E5A93C]"
      >
        <Utensils className="h-3.5 w-3.5 text-[#E5A93C]" />
        <div className="leading-tight">
          <span className="block text-[11px] font-semibold text-[#F4F1EA]">Food Cupboard</span>
          <span className="block text-[10px] text-white/65 font-mono-tabular">
            Garri {quarters.garriServings} · Milk {quarters.milkTins} · Nuts {quarters.groundnutPacks}
          </span>
        </div>
      </button>

      {/* 2. Single-Burner Blue Camp Gas Cylinder Stove */}
      <button
        type="button"
        onClick={quarters.stoveLit ? onCookWarmMeal : onToggleStove}
        className="group absolute left-[30%] top-[61%] z-20 flex items-center gap-2 rounded-md border border-sky-400/70 bg-[#0A0B0E]/85 px-3 py-1.5 text-left transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-sky-400"
      >
        <Flame className={`h-3.5 w-3.5 ${quarters.stoveLit ? 'text-sky-400' : 'text-white/70'}`} />
        <div className="leading-tight">
          <span className="block text-[11px] font-semibold text-[#F4F1EA]">
            {quarters.stoveLit ? 'Cook Pot On Gas Stove' : 'Light Camp Gas Cylinder'}
          </span>
          <span className="block text-[10px] text-sky-300 font-mono-tabular">
            Gas {quarters.gasCylinderPct}%
          </span>
        </div>
      </button>

      {/* 3. Mattress Rest Hotspot */}
      <button
        type="button"
        onClick={onRestOnMattress}
        className="group absolute left-[54%] top-[60%] z-20 flex items-center gap-2 rounded-md border border-emerald-400/60 bg-[#0A0B0E]/85 px-3 py-1.5 text-left transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-emerald-400"
      >
        <BedDouble className="h-3.5 w-3.5 text-emerald-400" />
        <div className="leading-tight">
          <span className="block text-[11px] font-semibold text-[#F4F1EA]">Rest On Mattress</span>
          <span className="block text-[10px] text-white/65">Restore HP & Stamina</span>
        </div>
      </button>

      {/* 4. NEPA / Generator Breaker Wall Switch */}
      <button
        type="button"
        onClick={onTogglePowerSource}
        className="group absolute right-[8%] top-[24%] z-20 flex items-center gap-2 rounded-md border border-amber-400/60 bg-[#0A0B0E]/88 px-3 py-1.5 text-left transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-[#E5A93C]"
      >
        <BatteryCharging className="h-3.5 w-3.5 text-[#E5A93C]" />
        <div className="leading-tight">
          <span className="block text-[11px] font-semibold text-[#F4F1EA]">
            {quarters.powerSource === 'NEPA_GRID' ? 'NEPA Grid Active' : 'I-Pass-My-Neighbor Gen'}
          </span>
          <span className="block text-[10px] text-white/65 font-mono-tabular">
            {powerOut ? 'OUTAGE · Switch To Gen' : `Fuel ${quarters.generatorFuelLiters.toFixed(1)}L`}
          </span>
        </div>
      </button>

      {/* Bottom Domestic Sanctuary Director Deck */}
      <div className="absolute inset-x-0 bottom-20 z-20 mx-auto max-w-5xl px-4 sm:px-8">
        <div className="rounded-lg border border-white/12 bg-[#0D1017]/92 p-4 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 text-xs text-white/60">
                <span className="font-semibold text-[#E5A93C]">Surulere Domestic Sanctuary</span>
                <span aria-hidden="true">·</span>
                <span>Adeniran Ogunsanya Safehouse</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-tabular">
                  {quarters.powerSource === 'NEPA_GRID'
                    ? quarters.nepaGridActive
                      ? 'POWER: NEPA GRID'
                      : 'POWER: NEPA BLACKOUT'
                    : `POWER: GENERATOR (${quarters.generatorFuelLiters.toFixed(1)}L)`}
                </span>
              </div>
              <p className="mt-1 text-sm text-[#F4F1EA]">{quarters.lastActionLog}</p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono-tabular text-white/80">
              <span>HP {vitals.hp}/100</span>
              <span>STAMINA {vitals.stamina}/100</span>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onSoakGarri}
              className="inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-[#161A26] px-3 py-2 text-xs font-medium text-[#F4F1EA] hover:border-[#E5A93C] transition-colors whitespace-nowrap"
            >
              <Utensils className="h-3.5 w-3.5 text-[#E5A93C]" />
              <span>Soak Ijebu Garri + Milk</span>
            </button>

            <button
              type="button"
              onClick={onToggleStove}
              className="inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-[#161A26] px-3 py-2 text-xs font-medium text-[#F4F1EA] hover:border-sky-400 transition-colors whitespace-nowrap"
            >
              <Flame className="h-3.5 w-3.5 text-sky-400" />
              <span>{quarters.stoveLit ? 'Turn Off Gas Valve' : 'Ignite Gas Stove'}</span>
            </button>

            <button
              type="button"
              onClick={onCookWarmMeal}
              className="inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-[#161A26] px-3 py-2 text-xs font-medium text-[#F4F1EA] hover:border-sky-400 transition-colors whitespace-nowrap"
            >
              <span>Boil & Fry Stew (+30 HP)</span>
            </button>

            <button
              type="button"
              onClick={onPourWater}
              className="inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-[#161A26] px-3 py-2 text-xs font-medium text-[#F4F1EA] hover:border-sky-300 transition-colors whitespace-nowrap"
            >
              <Droplets className="h-3.5 w-3.5 text-sky-300" />
              <span>Pour Water ({quarters.waterPitcherPct}%)</span>
            </button>

            <button
              type="button"
              onClick={onTogglePowerSource}
              className="inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-[#161A26] px-3 py-2 text-xs font-medium text-[#F4F1EA] hover:border-[#E5A93C] transition-colors whitespace-nowrap"
            >
              <BatteryCharging className="h-3.5 w-3.5 text-[#E5A93C]" />
              <span>Switch NEPA / Gen</span>
            </button>

            <button
              type="button"
              onClick={onRefuelGenerator}
              className="inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-[#161A26] px-3 py-2 text-xs font-medium text-[#F4F1EA] hover:border-amber-400 transition-colors whitespace-nowrap"
            >
              <Fuel className="h-3.5 w-3.5 text-amber-400" />
              <span>Buy Gen Petrol (₦4k)</span>
            </button>

            <button
              type="button"
              onClick={onGrabBlackStallion}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#E5A93C]/50 bg-[#E5A93C]/15 px-3 py-2 text-xs font-semibold text-[#E5A93C] hover:bg-[#E5A93C]/25 transition-colors whitespace-nowrap"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Restock Black Stallion ({quarters.blackStallionFridgeCount})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
