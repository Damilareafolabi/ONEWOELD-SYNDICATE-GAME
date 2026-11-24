import { useCallback, useEffect, useState } from 'react';
import {
  Compass,
  Film,
  Home,
  Megaphone,
  Pause,
  Plane,
  Play,
  RotateCcw,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { soundEngine } from './audio/soundEngine';
import { CanvasSceneFX } from './components/CanvasSceneFX';
import { CharacterSwitchWheel } from './components/CharacterSwitchWheel';
import { DioramaAtlasStage } from './components/DioramaAtlasStage';
import { FilmStoryStage } from './components/FilmStoryStage';
import { InventoryDock } from './components/InventoryDock';
import { SponsorPortalStage } from './components/SponsorPortalStage';
import { SurulereQuartersStage } from './components/SurulereQuartersStage';
import {
  CabinPassenger,
  DomesticQuartersState,
  FilmStageMode,
  GamePhase,
  InventoryItem,
  MapLocationPin,
  PlayerVitalMetrics,
  ProtagonistId,
  SponsorBillboardBanner,
  TacticalChoice,
} from './engine/types';
import {
  FILM_CHAPTERS,
  FLAGSHIP_SPONSOR,
  INITIAL_INVENTORY,
  INITIAL_QUARTERS_STATE,
  PROTAGONISTS,
  SCENE_ART,
} from './engine/worldData';

const INITIAL_VITALS: PlayerVitalMetrics = {
  hp: 88,
  stamina: 82,
  partnerLoyalty: 76,
  heatStars: 1,
  cashNaira: 1250000,
};

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('TITLE_MENU');
  const [stageMode, setStageMode] = useState<FilmStageMode>('FILM');
  const [activeProtagonist, setActiveProtagonist] = useState<ProtagonistId>('kaz');
  const [wheelOpen, setWheelOpen] = useState(false);
  const [shutterFlashKey, setShutterFlashKey] = useState(0);
  const [muted, setMuted] = useState(false);

  const [chapterIndex, setChapterIndex] = useState(0);
  const [beatIndex, setBeatIndex] = useState(0);
  const [vitals, setVitals] = useState<PlayerVitalMetrics>(INITIAL_VITALS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [quarters, setQuarters] = useState<DomesticQuartersState>(INITIAL_QUARTERS_STATE);
  const [activeSponsor, setActiveSponsor] = useState<SponsorBillboardBanner>(FLAGSHIP_SPONSOR);
  const [currentLocationId, setCurrentLocationId] = useState<string>('lagos');
  const [inventoryNotice, setInventoryNotice] = useState<string | null>(null);

  const triggerNotice = useCallback((msg: string) => {
    setInventoryNotice(msg);
    window.setTimeout(() => {
      setInventoryNotice((curr) => (curr === msg ? null : curr));
    }, 2800);
  }, []);

  const triggerShutter = useCallback(() => {
    setShutterFlashKey((k) => k + 1);
  }, []);

  const startGame = useCallback(() => {
    soundEngine.playFilmShutter();
    triggerShutter();
    setPhase('PLAYING');
    setStageMode('FILM');
  }, [triggerShutter]);

  const resetCampaign = useCallback(() => {
    soundEngine.playFilmShutter();
    triggerShutter();
    setChapterIndex(0);
    setBeatIndex(0);
    setActiveProtagonist('kaz');
    setVitals(INITIAL_VITALS);
    setInventory(INITIAL_INVENTORY);
    setQuarters(INITIAL_QUARTERS_STATE);
    setActiveSponsor(FLAGSHIP_SPONSOR);
    setCurrentLocationId('lagos');
    setStageMode('FILM');
    setPhase('PLAYING');
  }, [triggerShutter]);

  const handleToggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      soundEngine.setMuted(next);
      return next;
    });
  }, []);

  const handleSwitchProtagonist = useCallback(
    (id: ProtagonistId) => {
      soundEngine.playCharacterSwitch();
      triggerShutter();
      setActiveProtagonist(id);
      setWheelOpen(false);
      // Jump to protagonist's signature chapter if in Film mode
      const matchingChapter = FILM_CHAPTERS.findIndex((c) => c.protagonistId === id);
      if (matchingChapter >= 0 && stageMode === 'FILM') {
        setChapterIndex(matchingChapter);
        setBeatIndex(0);
      }
    },
    [stageMode, triggerShutter]
  );

  const handleSelectStageMode = useCallback(
    (nextMode: FilmStageMode) => {
      if (nextMode === stageMode) return;
      soundEngine.playFilmShutter();
      triggerShutter();
      setStageMode(nextMode);
    },
    [stageMode, triggerShutter]
  );

  // Use 6-Slot Street Hardware Inventory
  const handleUseInventoryItem = useCallback(
    (item: InventoryItem) => {
      if (item.quantity <= 0) return;

      if (item.id === 'black_stallion') {
        soundEngine.playCanPop();
        setInventory((prev) =>
          prev.map((it) => (it.id === 'black_stallion' ? { ...it, quantity: it.quantity - 1 } : it))
        );
        setVitals((v) => ({
          ...v,
          stamina: Math.min(100, v.stamina + (item.staminaDelta ?? 45)),
        }));
        triggerNotice('Black Stallion Energy: +45 Stamina ("Fuel Your Hustle")');
        return;
      }

      if (item.id === 'newspaper_suya') {
        soundEngine.playChoiceLock();
        setInventory((prev) =>
          prev.map((it) => (it.id === 'newspaper_suya' ? { ...it, quantity: it.quantity - 1 } : it))
        );
        setVitals((v) => ({
          ...v,
          hp: Math.min(100, v.hp + (item.hpDelta ?? 30)),
        }));
        triggerNotice('Hot Newspaper Suya: +30 HP restored');
        return;
      }

      if (item.id === 'torch_phone') {
        soundEngine.playTone(720, 0.12, 'sine', 0.05);
        triggerNotice('Torch Burner Phone: Taskforce radio sweep clear — ready for chapter choices.');
        return;
      }

      if (item.id === 'vehicle_key') {
        soundEngine.playTone(210, 0.18, 'triangle', 0.06);
        triggerNotice('Okada / Car Key primed — bridge extraction routes unlocked.');
        return;
      }

      if (item.id === 'danfo_pass') {
        soundEngine.playTone(460, 0.1, 'triangle', 0.05);
        triggerNotice('Danfo Transit Pass valid across Oshodi & Third Mainland checkpoints.');
        return;
      }

      if (item.id === 'lock_picks') {
        soundEngine.playTone(620, 0.08, 'square', 0.03);
        triggerNotice('Steel Lock Picks ready — use during port & locker breaches.');
      }
    },
    [triggerNotice]
  );

  // Keyboard shortcuts across the Game Shell
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return;
      }

      if (phase === 'TITLE_MENU') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          startGame();
        }
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        if (wheelOpen) {
          setWheelOpen(false);
        } else {
          setPhase((p) => (p === 'PLAYING' ? 'PAUSED' : p === 'PAUSED' ? 'PLAYING' : p));
        }
        return;
      }

      if (phase !== 'PLAYING') return;

      if (e.key === 'Tab') {
        e.preventDefault();
        setWheelOpen((o) => !o);
      } else if (e.key === '1') {
        handleSwitchProtagonist('kaz');
      } else if (e.key === '2') {
        handleSwitchProtagonist('zuri_dapo');
      } else if (e.key === '3') {
        handleSwitchProtagonist('folabi');
      } else if (e.key.toLowerCase() === 'q') {
        handleSelectStageMode('QUARTERS');
      } else if (e.key.toLowerCase() === 'm') {
        handleSelectStageMode('ATLAS');
      } else if (e.key.toLowerCase() === 'f') {
        handleSelectStageMode('FLIGHT');
      } else if (e.key.toLowerCase() === 'b') {
        handleSelectStageMode('SPONSORS');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [phase, wheelOpen, startGame, handleSwitchProtagonist, handleSelectStageMode]);

  // Resolve Film Tactical Choice
  const handleResolveChoice = useCallback(
    (choice: TacticalChoice) => {
      soundEngine.playChoiceLock();

      if (choice.requiredItemId) {
        const consumedItem = choice.requiredItemId;
        // Torch Phone & Vehicle Key are reusable tools; consumables decrement
        const isReusable = consumedItem === 'torch_phone' || consumedItem === 'vehicle_key';
        if (!isReusable) {
          setInventory((prev) =>
            prev.map((it) =>
              it.id === consumedItem ? { ...it, quantity: Math.max(0, it.quantity - 1) } : it
            )
          );
        }
      }

      setVitals((v) => ({
        hp:
          choice.requiredItemId === 'newspaper_suya'
            ? Math.min(100, v.hp + 30)
            : v.hp,
        stamina:
          choice.requiredItemId === 'black_stallion'
            ? Math.min(100, v.stamina + 45)
            : Math.max(10, v.stamina - choice.staminaCost),
        partnerLoyalty: Math.max(0, Math.min(100, v.partnerLoyalty + choice.loyaltyDelta)),
        heatStars: Math.max(0, Math.min(5, v.heatStars + choice.heatDelta)),
        cashNaira: Math.max(0, v.cashNaira + choice.cashDelta),
      }));
    },
    []
  );

  // Surulere Domestic Sanctuary Handlers
  const handleSoakGarri = () => {
    if (quarters.garriServings <= 0) {
      setQuarters((q) => ({ ...q, lastActionLog: 'Cupboard garri jar is empty — restock on next run.' }));
      return;
    }
    soundEngine.playChoiceLock();
    setQuarters((q) => ({
      ...q,
      garriServings: q.garriServings - 1,
      milkTins: Math.max(0, q.milkTins - 1),
      groundnutPacks: Math.max(0, q.groundnutPacks - 1),
      waterPitcherPct: Math.max(0, q.waterPitcherPct - 15),
      lastActionLog: 'Soaked crisp Ijebu Garri with chilled water, evaporated milk & roasted groundnuts (+25 Stamina).',
    }));
    setVitals((v) => ({ ...v, stamina: Math.min(100, v.stamina + 25), hp: Math.min(100, v.hp + 10) }));
  };

  const handleToggleStove = () => {
    if (!quarters.stoveLit && quarters.gasCylinderPct <= 4) {
      setQuarters((q) => ({ ...q, lastActionLog: 'Blue camp gas cylinder is too low — refill cylinder.' }));
      return;
    }
    soundEngine.playStoveIgnite();
    setQuarters((q) => ({
      ...q,
      stoveLit: !q.stoveLit,
      gasCylinderPct: !q.stoveLit ? Math.max(0, q.gasCylinderPct - 4) : q.gasCylinderPct,
      lastActionLog: !q.stoveLit
        ? 'Single-burner camp gas cylinder lit — steady blue flame roaring.'
        : 'Shut off the camp gas cylinder valve safely.',
    }));
  };

  const handleCookWarmMeal = () => {
    if (!quarters.stoveLit) {
      soundEngine.playStoveIgnite();
      setQuarters((q) => ({
        ...q,
        stoveLit: true,
        gasCylinderPct: Math.max(0, q.gasCylinderPct - 8),
        lastActionLog: 'Lit gas stove and simmered hot peppered stew (+30 HP, +20 Stamina).',
      }));
    } else {
      soundEngine.playChoiceLock();
      setQuarters((q) => ({
        ...q,
        gasCylinderPct: Math.max(0, q.gasCylinderPct - 6),
        lastActionLog: 'Simmered fresh tomato stew on the camp gas stove (+30 HP, +20 Stamina).',
      }));
    }
    setVitals((v) => ({ ...v, hp: Math.min(100, v.hp + 30), stamina: Math.min(100, v.stamina + 20) }));
  };

  const handlePourWater = () => {
    soundEngine.playTone(440, 0.14, 'sine', 0.05);
    setQuarters((q) => ({
      ...q,
      waterPitcherPct: q.waterPitcherPct <= 10 ? 100 : q.waterPitcherPct - 15,
      lastActionLog:
        q.waterPitcherPct <= 10
          ? 'Refilled the cold water pitcher from the dispenser (+15 Stamina).'
          : 'Poured a cold glass of water (+15 Stamina).',
    }));
    setVitals((v) => ({ ...v, stamina: Math.min(100, v.stamina + 15) }));
  };

  const handleTogglePowerSource = () => {
    setQuarters((q) => {
      if (q.powerSource === 'NEPA_GRID') {
        if (q.generatorFuelLiters <= 0.2) {
          soundEngine.playNepaSwitch(false);
          return {
            ...q,
            nepaGridActive: false,
            lastActionLog: 'NEPA blinked out and I-Pass-My-Neighbor generator tank is dry — buy petrol!',
          };
        }
        soundEngine.playNepaSwitch(true);
        return {
          ...q,
          powerSource: 'GENERATOR',
          generatorFuelLiters: Math.max(0, Number((q.generatorFuelLiters - 0.5).toFixed(1))),
          lastActionLog: 'Pulled cord on I-Pass-My-Neighbor generator — steady tungsten light restored.',
        };
      } else {
        const gridBack = Math.random() > 0.35;
        soundEngine.playNepaSwitch(gridBack);
        return {
          ...q,
          powerSource: 'NEPA_GRID',
          nepaGridActive: gridBack,
          lastActionLog: gridBack
            ? 'Switched back to NEPA Grid — neighborhood transformer is humming.'
            : 'Switched to NEPA Grid, but Surulere Phase 2 is currently in a blackout!',
        };
      }
    });
  };

  const handleRefuelGenerator = () => {
    if (vitals.cashNaira < 4000) {
      setQuarters((q) => ({ ...q, lastActionLog: 'Insufficient Naira for 5L petrol keg.' }));
      return;
    }
    soundEngine.playChoiceLock();
    setVitals((v) => ({ ...v, cashNaira: v.cashNaira - 4000 }));
    setQuarters((q) => ({
      ...q,
      generatorFuelLiters: Math.min(10, Number((q.generatorFuelLiters + 5.0).toFixed(1))),
      lastActionLog: 'Topped up I-Pass-My-Neighbor generator with 5.0L petrol (₦4,000).',
    }));
  };

  const handleRestOnMattress = () => {
    soundEngine.playFilmShutter();
    triggerShutter();
    setVitals((v) => ({ ...v, hp: 100, stamina: 100, heatStars: Math.max(0, v.heatStars - 1) }));
    setQuarters((q) => ({
      ...q,
      stoveLit: false,
      lastActionLog: 'Slept till first call to prayer — HP & Stamina at 100%, heat cooled.',
    }));
  };

  const handleGrabBlackStallion = () => {
    if (quarters.blackStallionFridgeCount <= 0) {
      setQuarters((q) => ({ ...q, lastActionLog: 'Crate is empty — restock at Black Stallion Depot.' }));
      return;
    }
    soundEngine.playCanPop();
    setQuarters((q) => ({
      ...q,
      blackStallionFridgeCount: q.blackStallionFridgeCount - 1,
      lastActionLog: 'Pulled a frosted Black Stallion can into Slot 1.',
    }));
    setInventory((prev) =>
      prev.map((it) =>
        it.id === 'black_stallion'
          ? { ...it, quantity: Math.min(it.maxQuantity, it.quantity + 1) }
          : it
      )
    );
    triggerNotice('Slot 1 restocked: +1 Black Stallion Energy Drink');
  };

  const handleArriveLocation = useCallback(
    (pin: MapLocationPin) => {
      setCurrentLocationId(pin.id);
      triggerNotice(`Arrived at ${pin.name} (${pin.airportCode}) — ${pin.syndicateStatus}`);
    },
    [triggerNotice]
  );

  const handlePassengerPerk = useCallback(
    (pax: CabinPassenger) => {
      soundEngine.playChoiceLock();
      setVitals((v) => ({
        ...v,
        cashNaira: v.cashNaira + (pax.perkCash ?? 0),
        partnerLoyalty: Math.min(100, v.partnerLoyalty + (pax.perkLoyalty ?? 0)),
        stamina: Math.min(100, v.stamina + (pax.perkStamina ?? 0)),
      }));
      triggerNotice(`${pax.name}: ${pax.perkLabel}`);
    },
    [triggerNotice]
  );

  const currentProfile = PROTAGONISTS[activeProtagonist];

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#0A0B0E] select-none">
      {/* TITLE SCREEN */}
      {phase === 'TITLE_MENU' && (
        <div className="relative h-full w-full overflow-hidden">
          <img
            src={SCENE_ART.lagosSkyline}
            alt="Lagos Third Mainland Bridge Dusk Key Art"
            referrerPolicy="no-referrer"
            className="animate-ken-burns absolute inset-0 h-full w-full object-cover"
          />
          <CanvasSceneFX mode="dusk" />
          <div className="cinema-vignette pointer-events-none absolute inset-0" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0A0B0E]/88 via-[#0A0B0E]/45 to-transparent" />

          {/* Anamorphic Cinema Bars */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-10 sm:h-12 bg-[#050608] border-b border-white/10" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 sm:h-12 bg-[#050608] border-t border-white/10" />

          {/* Title Lockup Positioned Over Upper-Left Negative Space */}
          <div className="relative z-20 flex h-full max-w-2xl flex-col justify-center px-8 sm:px-16">
            <svg
              viewBox="0 0 540 132"
              className="w-full max-w-[480px] h-auto"
              role="img"
              aria-label="ONE WORLD: FILM & SYNDICATE ENGINE"
            >
              <text
                x="0"
                y="24"
                fill="#E5A93C"
                fontFamily="JetBrains Mono, monospace"
                fontSize="13"
                letterSpacing="4"
              >
                LAGOS · ABUJA · GLOBAL CORRIDOR
              </text>
              <text
                x="0"
                y="84"
                fill="#F4F1EA"
                fontFamily="Oswald, sans-serif"
                fontWeight="700"
                fontSize="68"
                letterSpacing="2"
              >
                ONE WORLD
              </text>
              <line x1="0" y1="98" x2="210" y2="98" stroke="#E5A93C" strokeWidth="2.5" />
              <text
                x="0"
                y="122"
                fill="#C7C2B8"
                fontFamily="Plus Jakarta Sans, sans-serif"
                fontWeight="500"
                fontSize="16"
                letterSpacing="1.5"
              >
                FILM &amp; SYNDICATE ENGINE
              </text>
            </svg>

            <p className="mt-4 max-w-md text-sm sm:text-base text-[#F4F1EA]/80 leading-relaxed">
              Six interactive widescreen chapters uniting Surulere street roots, Apapa port heists,
              Ikoyi legal power, 36-state aviation, and curated Lagos culture.
            </p>

            <div className="mt-7 flex items-center gap-4">
              <button
                type="button"
                onClick={startGame}
                className="inline-flex items-center gap-2.5 rounded-md bg-[#E5A93C] px-7 py-3 text-sm font-bold text-[#0A0B0E] shadow-lg transition-transform duration-150 hover:bg-[#f0b84d] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-white"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>Start Film</span>
              </button>

              <button
                type="button"
                onClick={handleToggleMute}
                aria-label={muted ? 'Unmute audio' : 'Mute audio'}
                className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-[#0D1017]/80 px-4 py-3 text-xs font-medium text-[#F4F1EA] hover:border-[#E5A93C] transition-colors"
              >
                {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                <span>{muted ? 'Audio Muted' : 'Audio On'}</span>
              </button>
            </div>

            <p className="mt-6 font-mono-tabular text-xs text-white/55">
              Enter / Space Start · Tab Crew Wheel · Q Quarters · M 36-State Atlas · F Flight Sim · Esc Pause
            </p>
          </div>
        </div>
      )}

      {/* ACTIVE CINEMA ENGINE */}
      {phase !== 'TITLE_MENU' && (
        <div className="relative h-full w-full">
          {/* Active Widescreen Stage */}
          {stageMode === 'FILM' && (
            <FilmStoryStage
              chapters={FILM_CHAPTERS}
              activeChapterIndex={chapterIndex}
              activeBeatIndex={beatIndex}
              activeProtagonist={activeProtagonist}
              inventory={inventory}
              vitals={vitals}
              activeSponsor={activeSponsor}
              onSelectChapter={(idx) => {
                soundEngine.playFilmShutter();
                triggerShutter();
                setChapterIndex(idx);
                setBeatIndex(0);
                setActiveProtagonist(FILM_CHAPTERS[idx].protagonistId);
              }}
              onAdvanceBeat={() => {
                soundEngine.playTone(340, 0.08, 'triangle', 0.05);
                const ch = FILM_CHAPTERS[chapterIndex];
                if (beatIndex < ch.beats.length - 1) {
                  setBeatIndex((b) => b + 1);
                } else if (chapterIndex < FILM_CHAPTERS.length - 1) {
                  triggerShutter();
                  const next = chapterIndex + 1;
                  setChapterIndex(next);
                  setBeatIndex(0);
                  setActiveProtagonist(FILM_CHAPTERS[next].protagonistId);
                }
              }}
              onResolveChoice={handleResolveChoice}
              onOpenSponsors={() => handleSelectStageMode('SPONSORS')}
              onFinishFilm={() => setPhase('FINALE')}
            />
          )}

          {stageMode === 'QUARTERS' && (
            <SurulereQuartersStage
              quarters={quarters}
              vitals={vitals}
              onSoakGarri={handleSoakGarri}
              onToggleStove={handleToggleStove}
              onCookWarmMeal={handleCookWarmMeal}
              onPourWater={handlePourWater}
              onTogglePowerSource={handleTogglePowerSource}
              onRefuelGenerator={handleRefuelGenerator}
              onRestOnMattress={handleRestOnMattress}
              onGrabBlackStallion={handleGrabBlackStallion}
            />
          )}

          {(stageMode === 'ATLAS' || stageMode === 'FLIGHT') && (
            <DioramaAtlasStage
              mode={stageMode}
              currentLocationId={currentLocationId}
              onSelectMode={(m) => handleSelectStageMode(m)}
              onArriveLocation={handleArriveLocation}
              onPassengerPerk={handlePassengerPerk}
            />
          )}

          {stageMode === 'SPONSORS' && (
            <SponsorPortalStage
              activeSponsor={activeSponsor}
              onDeploySponsor={(banner) => {
                soundEngine.playChoiceLock();
                setActiveSponsor(banner);
              }}
            />
          )}

          {/* Top Anamorphic Letterbox Perimeter HUD (Zero Occlusion on Playfield) */}
          <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex h-12 items-center justify-between gap-4 bg-[#050608]/95 border-b border-white/10 px-4">
            {/* Protagonist + Vitals */}
            <div className="pointer-events-auto flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setWheelOpen(true)}
                title="Open 3-Character Switch Wheel (Tab)"
                className="flex items-center gap-2 rounded border border-white/15 bg-[#12151E] px-2 py-1 hover:border-[#E5A93C] transition-colors shrink-0"
              >
                <img
                  src={currentProfile.portraitUrl}
                  alt={currentProfile.fullName}
                  referrerPolicy="no-referrer"
                  className="h-6 w-6 rounded-sm object-cover"
                />
                <span className="font-display text-xs font-semibold text-[#F4F1EA] whitespace-nowrap">
                  {currentProfile.codeName}
                </span>
              </button>

              <div className="hidden md:flex items-center gap-3 font-mono-tabular text-[11px] text-white/80">
                <span>HP {vitals.hp}</span>
                <span aria-hidden="true" className="text-white/25">·</span>
                <span>STM {vitals.stamina}</span>
                <span aria-hidden="true" className="text-white/25">·</span>
                <span className="text-emerald-400">LOYALTY {vitals.partnerLoyalty}%</span>
                <span aria-hidden="true" className="text-white/25">·</span>
                <span className="text-[#E5A93C]">₦{vitals.cashNaira.toLocaleString()}</span>
                <span aria-hidden="true" className="text-white/25">·</span>
                <span>HEAT {'★'.repeat(vitals.heatStars) || 'CLEAR'}</span>
              </div>
            </div>

            {/* Film Scene Switcher Tabs */}
            <nav className="pointer-events-auto flex items-center gap-1 overflow-x-auto no-scrollbar">
              {(
                [
                  { id: 'FILM', label: 'Film Cut', icon: Film },
                  { id: 'QUARTERS', label: 'Surulere Quarters', icon: Home },
                  { id: 'ATLAS', label: '36-State Atlas', icon: Compass },
                  { id: 'FLIGHT', label: 'Flight Sim', icon: Plane },
                  { id: 'SPONSORS', label: 'Sponsors', icon: Megaphone },
                ] as const
              ).map(({ id, label, icon: Icon }) => {
                const active = stageMode === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleSelectStageMode(id)}
                    className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-[#E5A93C] text-[#0A0B0E] font-semibold'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Audio + Pause */}
            <div className="pointer-events-auto flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleToggleMute}
                aria-label={muted ? 'Unmute audio' : 'Mute audio'}
                className="flex h-8 w-8 items-center justify-center rounded border border-white/10 bg-[#12151E] text-white/75 hover:text-white hover:border-white/30"
              >
                {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => setPhase('PAUSED')}
                aria-label="Pause film"
                className="flex h-8 w-8 items-center justify-center rounded border border-white/10 bg-[#12151E] text-white/75 hover:text-white hover:border-white/30"
              >
                <Pause className="h-3.5 w-3.5" />
              </button>
            </div>
          </header>

          {/* Bottom Anamorphic Letterbox Perimeter HUD: 6-Slot Inventory + Crew Wheel Trigger */}
          <footer className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex h-16 items-center justify-between gap-3 bg-[#050608]/95 border-t border-white/10 px-4">
            <div className="hidden xl:flex items-center gap-2 text-[11px] text-white/55 font-mono-tabular">
              <span>SLOT 1-6 HARDWARE</span>
            </div>

            <div className="mx-auto">
              <InventoryDock
                items={inventory}
                onUseItem={handleUseInventoryItem}
                activeNotice={inventoryNotice}
              />
            </div>

            <button
              type="button"
              onClick={() => setWheelOpen(true)}
              className="pointer-events-auto inline-flex items-center gap-1.5 rounded-md border border-[#E5A93C]/40 bg-[#141720] px-3 py-2 text-xs font-semibold text-[#E5A93C] hover:bg-[#1B1F2B] transition-colors whitespace-nowrap shrink-0"
            >
              <Users className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Crew Wheel</span>
            </button>
          </footer>

          {/* Cross-Cut Shutter Flash Overlay */}
          {shutterFlashKey > 0 && (
            <div
              key={shutterFlashKey}
              className="animate-shutter-flash pointer-events-none fixed inset-0 z-40 bg-[#050608]"
            />
          )}

          {/* 3-Character Radial Switch Wheel */}
          <CharacterSwitchWheel
            open={wheelOpen}
            activeId={activeProtagonist}
            vitals={vitals}
            onSelect={handleSwitchProtagonist}
            onClose={() => setWheelOpen(false)}
          />

          {/* PAUSE MODAL */}
          {phase === 'PAUSED' && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
              role="dialog"
              aria-modal="true"
              aria-label="Film Paused"
            >
              <div className="w-full max-w-md rounded-lg border border-white/15 bg-[#0D1017] p-6 shadow-2xl">
                <span className="font-mono-tabular text-[11px] tracking-widest text-[#E5A93C]">
                  REEL PAUSED
                </span>
                <h2 className="font-display text-2xl font-bold text-[#F4F1EA] mt-1">
                  ONE WORLD: SYNDICATE
                </h2>
                <p className="mt-2 text-xs text-white/70 leading-relaxed">
                  Switch seamlessly between Film Storyline, Surulere Living Quarters, 36-State Diorama
                  Atlas, Flight Simulator, and the Verified Business Ad Portal.
                </p>

                <div className="mt-5 flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPhase('PLAYING')}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-[#E5A93C] px-4 py-2.5 text-xs font-bold text-[#0A0B0E] hover:bg-[#f0b84d]"
                  >
                    <Play className="h-4 w-4 fill-current" />
                    <span>Resume Film</span>
                  </button>
                  <button
                    type="button"
                    onClick={resetCampaign}
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-white/15 bg-[#151924] px-4 py-2.5 text-xs font-medium text-[#F4F1EA] hover:border-[#E5A93C]"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Restart From Chapter 01</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* FINALE CREDITS CUT MODAL */}
          {phase === 'FINALE' && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-4"
              role="dialog"
              aria-modal="true"
              aria-label="Season Finale Cut"
            >
              <div className="w-full max-w-lg rounded-lg border border-[#E5A93C]/40 bg-[#0D1017] p-6 shadow-2xl">
                <span className="font-mono-tabular text-[11px] tracking-widest text-[#E5A93C]">
                  END OF FEATURE · ACT VI COMPLETE
                </span>
                <h2 className="font-display text-3xl font-bold text-[#F4F1EA] mt-1">
                  THE SYNDICATE STANDS AS ONE
                </h2>
                <p className="mt-2 text-sm text-white/75 leading-relaxed">
                  From Surulere’s camp-gas safehouse to Apapa Port and Ikoyi’s chambers, all three
                  crews locked down the 36-state corridor and global Eko Skyways routes.
                </p>

                <div className="mt-5 grid grid-cols-3 gap-3 font-mono-tabular text-center">
                  <div className="rounded border border-white/10 bg-[#151924] p-3">
                    <span className="block text-[10px] text-white/50">TREASURY</span>
                    <span className="text-sm font-semibold text-[#E5A93C]">
                      ₦{vitals.cashNaira.toLocaleString()}
                    </span>
                  </div>
                  <div className="rounded border border-white/10 bg-[#151924] p-3">
                    <span className="block text-[10px] text-white/50">LOYALTY</span>
                    <span className="text-sm font-semibold text-emerald-400">
                      {vitals.partnerLoyalty}%
                    </span>
                  </div>
                  <div className="rounded border border-white/10 bg-[#151924] p-3">
                    <span className="block text-[10px] text-white/50">HEAT</span>
                    <span className="text-sm font-semibold text-[#F4F1EA]">
                      {vitals.heatStars} ★
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={resetCampaign}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-[#E5A93C] px-4 py-2.5 text-xs font-bold text-[#0A0B0E] hover:bg-[#f0b84d]"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Play Again</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPhase('PLAYING');
                      setStageMode('ATLAS');
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-md border border-white/15 bg-[#151924] px-4 py-2.5 text-xs font-medium text-[#F4F1EA] hover:border-[#E5A93C]"
                  >
                    <Compass className="h-4 w-4 text-[#E5A93C]" />
                    <span>Free Roam Atlas</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
