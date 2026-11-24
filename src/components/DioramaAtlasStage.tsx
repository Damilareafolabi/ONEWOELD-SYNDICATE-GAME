import { useEffect, useRef, useState } from 'react';
import { Compass, Navigation, Plane, PlaneLanding, Radio, Users } from 'lucide-react';
import {
  CABIN_PASSENGERS,
  FICTIONAL_AIRLINES,
  GLOBAL_HUBS,
  NIGERIA_STATES_AND_FCT,
  SCENE_ART,
} from '../engine/worldData';
import { CabinPassenger, FictionalAirline, MapLocationPin } from '../engine/types';
import { CanvasSceneFX } from './CanvasSceneFX';
import { soundEngine } from '../audio/soundEngine';

interface DioramaAtlasStageProps {
  mode: 'ATLAS' | 'FLIGHT';
  currentLocationId: string;
  onSelectMode: (mode: 'ATLAS' | 'FLIGHT') => void;
  onArriveLocation: (pin: MapLocationPin) => void;
  onPassengerPerk: (pax: CabinPassenger) => void;
}

export function DioramaAtlasStage({
  mode,
  currentLocationId,
  onSelectMode,
  onArriveLocation,
  onPassengerPerk,
}: DioramaAtlasStageProps) {
  const [scope, setScope] = useState<'NIGERIA' | 'GLOBAL'>('NIGERIA');
  const [selectedPin, setSelectedPin] = useState<MapLocationPin>(
    () =>
      NIGERIA_STATES_AND_FCT.find((s) => s.id === currentLocationId) ||
      NIGERIA_STATES_AND_FCT.find((s) => s.id === 'lagos')!
  );
  const [selectedAirline, setSelectedAirline] = useState<FictionalAirline>(FICTIONAL_AIRLINES[0]);
  const [flightProgress, setFlightProgress] = useState(0);
  const [inFlight, setInFlight] = useState(false);
  const [altitudeFt, setAltitudeFt] = useState(36000);
  const [throttlePct, setThrottlePct] = useState(86);
  const [headingDeg, setHeadingDeg] = useState(42);
  const [seatbeltOn, setSeatbeltOn] = useState(true);
  const [activePassenger, setActivePassenger] = useState<CabinPassenger>(CABIN_PASSENGERS[0]);
  const [claimedPerks, setClaimedPerks] = useState<Record<string, boolean>>({});
  const [atcStatus, setAtcStatus] = useState('Murtala Muhammed Tower: Cleared for departure.');

  const mapCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const flightHudCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const originPin =
    NIGERIA_STATES_AND_FCT.find((p) => p.id === currentLocationId) ||
    GLOBAL_HUBS.find((p) => p.id === currentLocationId) ||
    NIGERIA_STATES_AND_FCT.find((p) => p.id === 'lagos')!;

  const activePins = scope === 'NIGERIA' ? NIGERIA_STATES_AND_FCT : GLOBAL_HUBS;

  // Lightweight 2.5D Sculpted Diorama Map Renderer (Canvas — zero WebGL GPU heat)
  useEffect(() => {
    if (mode !== 'ATLAS') return;
    const canvas = mapCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    const render = (now: number) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Deep ocean & relief bed
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#0B111C');
      bg.addColorStop(1, '#070B12');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Subtle latitude / longitude grid
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < w; gx += 64) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, h);
        ctx.stroke();
      }
      for (let gy = 0; gy < h; gy += 64) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(w, gy);
        ctx.stroke();
      }

      if (scope === 'NIGERIA') {
        // Sculpted 2.5D Nigeria Terrain Plateau Polygon (approximate authentic landmass)
        const poly = [
          [0.18, 0.77], [0.16, 0.56], [0.22, 0.25], [0.31, 0.09],
          [0.50, 0.09], [0.68, 0.14], [0.91, 0.14], [0.92, 0.34],
          [0.83, 0.50], [0.67, 0.78], [0.58, 0.88], [0.43, 0.90],
          [0.36, 0.76],
        ];

        // 2.5D Extruded Elevation Shadow
        ctx.save();
        ctx.translate(0, 12);
        ctx.beginPath();
        poly.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px * w, py * h) : ctx.lineTo(px * w, py * h)));
        ctx.closePath();
        ctx.fillStyle = '#04060A';
        ctx.fill();
        ctx.restore();

        // Main Sculpted Landmass
        const landGrad = ctx.createLinearGradient(0, 0.1 * h, 0, 0.9 * h);
        landGrad.addColorStop(0, '#2B261C'); // Sahel Savanna North
        landGrad.addColorStop(0.55, '#1B2821'); // Middle Belt Plateau
        landGrad.addColorStop(1, '#122922'); // Rainforest & Niger Delta Coast
        ctx.beginPath();
        poly.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px * w, py * h) : ctx.lineTo(px * w, py * h)));
        ctx.closePath();
        ctx.fillStyle = landGrad;
        ctx.fill();
        ctx.strokeStyle = 'rgba(229, 169, 60, 0.42)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Niger & Benue Rivers meeting at Lokoja Confluence
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0.24 * w, 0.21 * h);
        ctx.quadraticCurveTo(0.36 * w, 0.45 * h, 0.46 * w, 0.58 * h);
        ctx.lineTo(0.47 * w, 0.88 * h);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0.86 * w, 0.42 * h);
        ctx.quadraticCurveTo(0.64 * w, 0.54 * h, 0.46 * w, 0.58 * h);
        ctx.stroke();
      } else {
        // Global Continents Stylized Relief Arcs
        const regions = [
          { cx: 0.19, cy: 0.32, rx: 0.11, ry: 0.16 }, // North America
          { cx: 0.48, cy: 0.24, rx: 0.07, ry: 0.08 }, // UK / Europe
          { cx: 0.52, cy: 0.62, rx: 0.11, ry: 0.22 }, // Africa
          { cx: 0.69, cy: 0.43, rx: 0.09, ry: 0.10 }, // Middle East / UAE
        ];
        for (const r of regions) {
          ctx.beginPath();
          ctx.ellipse(r.cx * w, r.cy * h, r.rx * w, r.ry * h, 0, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(229, 169, 60, 0.28)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      // Great-Circle Flight Arc from Origin to Selected Pin
      const ox = (originPin.x / 100) * w;
      const oy = (originPin.y / 100) * h;
      const dx = (selectedPin.x / 100) * w;
      const dy = (selectedPin.y / 100) * h;

      if (originPin.id !== selectedPin.id) {
        const mx = (ox + dx) / 2;
        const my = Math.min(oy, dy) - 64;
        ctx.strokeStyle = 'rgba(229, 169, 60, 0.72)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.quadraticCurveTo(mx, my, dx, dy);
        ctx.stroke();
        ctx.setLineDash([]);

        // Animated plane beacon along curve
        const t = (now * 0.00028) % 1;
        const px = (1 - t) * (1 - t) * ox + 2 * (1 - t) * t * mx + t * t * dx;
        const py = (1 - t) * (1 - t) * oy + 2 * (1 - t) * t * my + t * t * dy;
        ctx.fillStyle = '#F4F1EA';
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [mode, scope, originPin, selectedPin]);

  // Flight Simulator Cockpit Attitude & Route Canvas
  useEffect(() => {
    if (mode !== 'FLIGHT') return;
    const canvas = flightHudCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    const drawCockpit = (now: number) => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const r = Math.min(w, h) * 0.38;

      // Artificial Horizon Ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();

      const bankAngle = ((headingDeg % 30) - 15) * 0.015 + Math.sin(now * 0.0012) * 0.03;
      ctx.translate(cx, cy);
      ctx.rotate(bankAngle);

      ctx.fillStyle = 'rgba(14, 116, 144, 0.32)';
      ctx.fillRect(-r * 1.4, -r * 1.4, r * 2.8, r * 1.4);
      ctx.fillStyle = 'rgba(120, 75, 32, 0.38)';
      ctx.fillRect(-r * 1.4, 0, r * 2.8, r * 1.4);

      ctx.strokeStyle = '#E5A93C';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-r, 0);
      ctx.lineTo(r, 0);
      ctx.stroke();

      // Pitch ladders
      ctx.strokeStyle = 'rgba(255,255,255,0.45)';
      ctx.lineWidth = 1;
      for (const offset of [-24, -12, 12, 24]) {
        ctx.beginPath();
        ctx.moveTo(-18, offset);
        ctx.lineTo(18, offset);
        ctx.stroke();
      }
      ctx.restore();

      ctx.strokeStyle = 'rgba(229,169,60,0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      animId = requestAnimationFrame(drawCockpit);
    };
    animId = requestAnimationFrame(drawCockpit);
    return () => cancelAnimationFrame(animId);
  }, [mode, headingDeg]);

  // Flight progress ticker
  useEffect(() => {
    if (mode !== 'FLIGHT' || !inFlight) return;
    const timer = window.setInterval(() => {
      setFlightProgress((prev) => {
        const next = Math.min(100, prev + (throttlePct / 100) * 6.5);
        if (next >= 100) {
          setInFlight(false);
          soundEngine.playRadarPing();
          setAtcStatus(`Final Approach Cleared: Touchdown at ${selectedPin.capitalOrCity} (${selectedPin.airportCode}).`);
          onArriveLocation(selectedPin);
        }
        return next;
      });
    }, 500);
    return () => window.clearInterval(timer);
  }, [mode, inFlight, throttlePct, selectedPin, onArriveLocation]);

  const handleBoardFlight = () => {
    soundEngine.playRadarPing();
    setFlightProgress(0);
    setInFlight(true);
    setAltitudeFt(selectedAirline.cruiseAltFt);
    setAtcStatus(
      `${selectedAirline.callsignPrefix}-${Math.floor(100 + Math.random() * 800)} airborne en route to ${selectedPin.name} (${selectedPin.airportCode}).`
    );
    onSelectMode('FLIGHT');
  };

  if (mode === 'FLIGHT') {
    const airspeed = Math.round(selectedAirline.cruiseSpeedKts * (throttlePct / 100));
    return (
      <div className="relative h-full w-full overflow-hidden bg-[#0A0B0E]">
        <img
          src={SCENE_ART.aviationCabin}
          alt="Fictional Aviation Cabin & Flight Simulator"
          referrerPolicy="no-referrer"
          className="animate-ken-burns absolute inset-0 h-full w-full object-cover"
        />
        <CanvasSceneFX mode="aviation" />
        <div className="cinema-vignette pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0A0B0E] via-[#0A0B0E]/35 to-[#0A0B0E]/50" />

        {/* Top Airline & Route Strip */}
        <div className="absolute left-4 right-4 top-14 z-20 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 rounded-md border border-white/12 bg-[#0A0B0E]/88 px-3 py-1.5 text-xs">
            <Plane className="h-4 w-4 text-[#E5A93C]" />
            <span className="font-semibold text-[#F4F1EA]">{selectedAirline.name}</span>
            <span aria-hidden="true">·</span>
            <span className="text-white/65">{selectedAirline.aircraftModel}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular text-[#E5A93C]">
              {originPin.airportCode} → {selectedPin.airportCode}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onSelectMode('ATLAS')}
            className="inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-[#0A0B0E]/88 px-3 py-1.5 text-xs font-medium text-[#F4F1EA] hover:border-[#E5A93C] transition-colors"
          >
            <Compass className="h-3.5 w-3.5 text-[#E5A93C]" />
            <span>Return To Diorama Atlas</span>
          </button>
        </div>

        {/* Center-Left Flight Simulator Glass Cockpit Overlay + Center-Right Cabin Passenger Interaction */}
        <div className="absolute inset-x-0 bottom-20 top-28 z-20 mx-auto flex max-w-6xl flex-col justify-end gap-3 px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
            {/* Flight Simulator Deck */}
            <div className="lg:col-span-6 rounded-lg border border-white/12 bg-[#0D1017]/92 p-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div>
                  <span className="text-xs font-semibold text-[#E5A93C]">
                    Real-Time Flight Simulator
                  </span>
                  <p className="text-[11px] text-white/65 mt-0.5">{atcStatus}</p>
                </div>
                <span className="font-mono-tabular text-xs font-semibold text-[#F4F1EA]">
                  {Math.round(flightProgress)}% ROUTE
                </span>
              </div>

              <div className="mt-3 grid grid-cols-12 gap-3 items-center">
                <div className="col-span-5 h-36 rounded-md border border-white/10 bg-[#080B12] overflow-hidden">
                  <canvas ref={flightHudCanvasRef} className="h-full w-full" />
                </div>
                <div className="col-span-7 space-y-2.5 text-xs">
                  <div className="grid grid-cols-3 gap-2 font-mono-tabular">
                    <div className="rounded bg-[#151924] p-2 border border-white/10">
                      <span className="block text-[10px] text-white/50">ALTITUDE</span>
                      <span className="text-sm font-semibold text-[#F4F1EA]">
                        {altitudeFt.toLocaleString()} ft
                      </span>
                    </div>
                    <div className="rounded bg-[#151924] p-2 border border-white/10">
                      <span className="block text-[10px] text-white/50">AIRSPEED</span>
                      <span className="text-sm font-semibold text-[#E5A93C]">{airspeed} kts</span>
                    </div>
                    <div className="rounded bg-[#151924] p-2 border border-white/10">
                      <span className="block text-[10px] text-white/50">HEADING</span>
                      <span className="text-sm font-semibold text-[#F4F1EA]">{headingDeg}°</span>
                    </div>
                  </div>

                  {/* Interactive Throttle & Heading */}
                  <div className="space-y-1.5">
                    <label className="flex items-center justify-between text-[11px] text-white/70">
                      <span>Throttle ({throttlePct}%)</span>
                      <input
                        type="range"
                        min={45}
                        max={100}
                        value={throttlePct}
                        onChange={(e) => setThrottlePct(Number(e.target.value))}
                        className="w-36 accent-[#E5A93C]"
                      />
                    </label>
                    <label className="flex items-center justify-between text-[11px] text-white/70">
                      <span>Heading Trim ({headingDeg}°)</span>
                      <input
                        type="range"
                        min={0}
                        max={359}
                        value={headingDeg}
                        onChange={(e) => setHeadingDeg(Number(e.target.value))}
                        className="w-36 accent-[#E5A93C]"
                      />
                    </label>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setSeatbeltOn((s) => !s)}
                      className="rounded border border-white/15 bg-[#161A26] px-2.5 py-1.5 text-[11px] font-medium text-[#F4F1EA] hover:border-[#E5A93C]"
                    >
                      Seatbelt Sign: {seatbeltOn ? 'ON' : 'OFF'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playRadarPing();
                        setInFlight(false);
                        setFlightProgress(100);
                        setAtcStatus(`Cleared Runway ${selectedPin.runwayLengthM}m — Touchdown at ${selectedPin.name}.`);
                        onArriveLocation(selectedPin);
                      }}
                      className="inline-flex items-center gap-1.5 rounded bg-[#E5A93C] px-3 py-1.5 text-[11px] font-semibold text-[#0A0B0E] hover:bg-[#f0b84d]"
                    >
                      <PlaneLanding className="h-3.5 w-3.5" />
                      <span>Execute Landing</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Seated Cabin Passenger Interactions */}
            <div className="lg:col-span-6 rounded-lg border border-white/12 bg-[#0D1017]/92 p-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#E5A93C]" />
                  <span className="text-xs font-semibold text-[#F4F1EA]">
                    Seated Cabin Interactions
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {CABIN_PASSENGERS.map((pax) => (
                    <button
                      key={pax.id}
                      type="button"
                      onClick={() => setActivePassenger(pax)}
                      className={`px-2 py-1 rounded text-[11px] transition-colors ${
                        activePassenger.id === pax.id
                          ? 'bg-[#E5A93C] text-[#0A0B0E] font-semibold'
                          : 'bg-[#161A26] text-white/70 hover:text-white'
                      }`}
                    >
                      {pax.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <span className="font-semibold text-[#F4F1EA]">{activePassenger.name}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activePassenger.role}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#E5A93C]">{activePassenger.seat}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[#F4F1EA]/90">
                  “{activePassenger.dialogue}”
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[11px] text-white/50">
                    Runway {selectedPin.runwayLengthM}m · {selectedPin.syndicateStatus}
                  </span>
                  <button
                    type="button"
                    disabled={Boolean(claimedPerks[activePassenger.id])}
                    onClick={() => {
                      setClaimedPerks((prev) => ({ ...prev, [activePassenger.id]: true }));
                      onPassengerPerk(activePassenger);
                    }}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                      claimedPerks[activePassenger.id]
                        ? 'bg-white/10 text-white/40 cursor-not-allowed'
                        : 'bg-[#E5A93C] text-[#0A0B0E] hover:bg-[#f0b84d]'
                    }`}
                  >
                    {claimedPerks[activePassenger.id] ? 'Interaction Completed' : activePassenger.perkLabel}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#070B12]">
      {/* Sculpted 2.5D Canvas Relief Diorama */}
      <div className="relative h-full w-full">
        <canvas ref={mapCanvasRef} className="h-full w-full block" />

        {/* Interactive Diorama Territory Pins (All 36 States + FCT OR 5 Global Hubs) */}
        <div className="absolute inset-x-0 top-14 bottom-48 pointer-events-none">
          <div className="relative h-full w-full mx-auto max-w-5xl">
            {activePins.map((pin) => {
              const isSelected = selectedPin.id === pin.id;
              const isCurrent = currentLocationId === pin.id;
              return (
                <button
                  key={pin.id}
                  type="button"
                  onClick={() => {
                    soundEngine.playTone(540, 0.08, 'sine', 0.04);
                    setSelectedPin(pin);
                  }}
                  style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                  className={`pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 group flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-[#E5A93C] ${
                    isSelected
                      ? 'z-30 scale-110 bg-[#E5A93C] text-[#0A0B0E] font-bold shadow-lg'
                      : isCurrent
                      ? 'z-20 bg-emerald-500/90 text-[#0A0B0E] font-semibold'
                      : 'z-10 bg-[#0D1017]/88 text-[#F4F1EA]/85 border border-white/15 hover:border-[#E5A93C] hover:z-20'
                  }`}
                >
                  <span className="whitespace-nowrap">{pin.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Scope Switcher (36 Nigerian States + FCT vs Global Syndicate Hubs) */}
      <div className="absolute left-4 right-4 top-14 z-30 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-1 rounded-lg border border-white/12 bg-[#0A0B0E]/90 p-1">
          <button
            type="button"
            onClick={() => {
              setScope('NIGERIA');
              setSelectedPin(NIGERIA_STATES_AND_FCT.find((s) => s.id === 'lagos')!);
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              scope === 'NIGERIA'
                ? 'bg-[#E5A93C] text-[#0A0B0E] font-semibold'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Nigeria · 36 States + FCT
          </button>
          <button
            type="button"
            onClick={() => {
              setScope('GLOBAL');
              setSelectedPin(GLOBAL_HUBS[0]);
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              scope === 'GLOBAL'
                ? 'bg-[#E5A93C] text-[#0A0B0E] font-semibold'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Global Hubs (UK · USA · UAE · CAN · SA)
          </button>
        </div>

        <div className="pointer-events-auto hidden md:flex items-center gap-2 rounded-md border border-white/12 bg-[#0A0B0E]/88 px-3 py-1.5 text-xs text-white/75">
          <Radio className="h-3.5 w-3.5 text-[#E5A93C]" />
          <span>Active Hub: {originPin.name} ({originPin.airportCode})</span>
        </div>
      </div>

      {/* Bottom Diorama Dispatch & Airline Boarding Strip */}
      <div className="absolute inset-x-0 bottom-20 z-30 mx-auto max-w-5xl px-4 sm:px-8">
        <div className="rounded-lg border border-white/12 bg-[#0D1017]/94 p-4 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-white/60">
                <span className="font-semibold text-[#E5A93C]">{selectedPin.region}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-tabular">AIRPORT {selectedPin.airportCode}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-tabular">RUNWAY {selectedPin.runwayLengthM}m</span>
              </div>
              <h3 className="font-display text-xl font-semibold text-[#F4F1EA] mt-0.5">
                {selectedPin.name} — {selectedPin.capitalOrCity}
              </h3>
              <p className="text-xs text-white/70 mt-0.5">
                {selectedPin.syndicateStatus} · Terrain: {selectedPin.terrain}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {FICTIONAL_AIRLINES.map((airline) => (
                <button
                  key={airline.id}
                  type="button"
                  onClick={() => setSelectedAirline(airline)}
                  className={`rounded-md border px-3 py-2 text-left transition-colors ${
                    selectedAirline.id === airline.id
                      ? 'border-[#E5A93C] bg-[#191D28]'
                      : 'border-white/12 bg-[#131620] hover:border-white/30'
                  }`}
                >
                  <span className="block text-xs font-semibold text-[#F4F1EA] whitespace-nowrap">
                    {airline.name}
                  </span>
                  <span className="block text-[10px] text-white/60 whitespace-nowrap">
                    {airline.tier}
                  </span>
                </button>
              ))}

              <button
                type="button"
                onClick={handleBoardFlight}
                className="inline-flex items-center gap-2 rounded-md bg-[#E5A93C] px-4 py-2.5 text-xs font-semibold text-[#0A0B0E] hover:bg-[#f0b84d] transition-colors whitespace-nowrap"
              >
                <Navigation className="h-3.5 w-3.5" />
                <span>Board & Launch Flight Sim</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
