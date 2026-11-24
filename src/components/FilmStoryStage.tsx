import { useEffect, useState } from 'react';
import { ChevronRight, Film, ShieldAlert, Sparkles } from 'lucide-react';
import {
  FilmChapter,
  InventoryItem,
  PlayerVitalMetrics,
  ProtagonistId,
  SponsorBillboardBanner,
  TacticalChoice,
} from '../engine/types';
import { PROTAGONISTS } from '../engine/worldData';
import { CanvasSceneFX } from './CanvasSceneFX';

interface FilmStoryStageProps {
  chapters: FilmChapter[];
  activeChapterIndex: number;
  activeBeatIndex: number;
  activeProtagonist: ProtagonistId;
  inventory: InventoryItem[];
  vitals: PlayerVitalMetrics;
  activeSponsor: SponsorBillboardBanner;
  onSelectChapter: (index: number) => void;
  onAdvanceBeat: () => void;
  onResolveChoice: (choice: TacticalChoice) => void;
  onOpenSponsors: () => void;
  onFinishFilm: () => void;
}

export function FilmStoryStage({
  chapters,
  activeChapterIndex,
  activeBeatIndex,
  activeProtagonist,
  inventory,
  vitals,
  activeSponsor,
  onSelectChapter,
  onAdvanceBeat,
  onResolveChoice,
  onOpenSponsors,
  onFinishFilm,
}: FilmStoryStageProps) {
  const chapter = chapters[activeChapterIndex];
  const beat = chapter.beats[activeBeatIndex] || chapter.beats[0];
  const protagonist = PROTAGONISTS[chapter.protagonistId];

  const [countdown, setCountdown] = useState<number | null>(beat.timedSeconds ?? null);
  const [outcomeLine, setOutcomeLine] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);

  useEffect(() => {
    setOutcomeLine(null);
    setCountdown(beat.timedSeconds ?? null);
  }, [chapter.id, beat.id, beat.timedSeconds]);

  useEffect(() => {
    if (!beat.timedSeconds || outcomeLine || !beat.choices || beat.choices.length === 0) return;

    const timer = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          window.clearInterval(timer);
          // Auto-select fallback choice when timer runs out
          const fallback =
            beat.choices!.find((c) => !c.requiredItemId) || beat.choices![beat.choices!.length - 1];
          if (fallback) {
            setOutcomeLine(fallback.outcomeLine);
            setShakeKey((k) => k + 1);
            onResolveChoice(fallback);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [beat.id, beat.timedSeconds, beat.choices, outcomeLine, onResolveChoice]);

  const handleChoiceClick = (choice: TacticalChoice) => {
    if (outcomeLine) return;
    setOutcomeLine(choice.outcomeLine);
    setShakeKey((k) => k + 1);
    onResolveChoice(choice);
  };

  const hasNextChapter = activeChapterIndex < chapters.length - 1;
  const hasNextBeat = activeBeatIndex < chapter.beats.length - 1;
  const isFinalMoment = !hasNextBeat && !hasNextChapter && Boolean(outcomeLine);

  const hasItemStock = (itemId?: InventoryItem['id']) => {
    if (!itemId) return true;
    const found = inventory.find((i) => i.id === itemId);
    return Boolean(found && found.quantity > 0);
  };

  const timePct =
    beat.timedSeconds && countdown !== null
      ? Math.max(0, Math.min(100, (countdown / beat.timedSeconds) * 100))
      : 0;

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0A0B0E]">
      {/* Full-Bleed Painterly Cinema Frame */}
      <img
        key={beat.sceneImage}
        src={beat.sceneImage}
        alt={chapter.title}
        referrerPolicy="no-referrer"
        className="animate-ken-burns absolute inset-0 h-full w-full object-cover object-center"
      />

      {/* Lightweight 2.5D Canvas Atmospheric FX */}
      <CanvasSceneFX mode={beat.fxMode} shakeKey={shakeKey} />

      {/* Cinema Scrim & Vignette */}
      <div className="cinema-vignette pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0A0B0E] via-[#0A0B0E]/45 to-[#0A0B0E]/35" />

      {/* In-Scene Designated Roadside Highway Gantry Billboard */}
      {beat.showBillboardInScene && (
        <button
          type="button"
          onClick={onOpenSponsors}
          title="Designated Gantry Frame — Open Verified Business Ad Portal"
          className="group absolute right-5 top-16 sm:right-10 sm:top-20 z-20 w-[210px] sm:w-[270px] overflow-hidden rounded border border-[#E5A93C]/50 bg-[#0D1017]/95 text-left shadow-2xl transition-transform duration-200 hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-[#E5A93C]"
        >
          <div className="relative h-24 sm:h-28 w-full overflow-hidden bg-[#151822]">
            <img
              src={activeSponsor.imageUrl}
              alt={activeSponsor.brandName}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover opacity-90 transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent" />
            <div className="absolute inset-y-0 left-0 flex flex-col justify-center px-3">
              <span className="font-mono-tabular text-[9px] tracking-widest text-[#E5A93C]">
                {activeSponsor.isFlagship ? 'DESIGNATED GANTRY · SPONSOR' : 'VERIFIED BRAND SLOT'}
              </span>
              <span className="font-display text-sm sm:text-base font-bold text-[#F4F1EA] leading-tight">
                {activeSponsor.headline}
              </span>
              <span className="text-[10px] text-white/75 line-clamp-1 mt-0.5">
                {activeSponsor.brandName}
              </span>
            </div>
          </div>
          {/* Gantry Steel Trusses */}
          <div className="flex items-center justify-between bg-[#0B0D12] px-2.5 py-1 text-[10px] text-white/60 border-t border-white/10">
            <span className="truncate">{activeSponsor.placementZones[0] || 'Highway Gantry'}</span>
            <span className="text-[#E5A93C] font-medium shrink-0">Edit Ad</span>
          </div>
        </button>
      )}

      {/* Top Chapter Reel Strip (Inside Anamorphic Frame) */}
      <div className="absolute left-4 right-4 top-14 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-1.5 bg-[#0A0B0E]/82 border border-white/10 px-2 py-1 rounded-md">
          <Film className="h-3.5 w-3.5 text-[#E5A93C] mr-1" />
          {chapters.map((ch, idx) => {
            const isCurrent = idx === activeChapterIndex;
            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => onSelectChapter(idx)}
                className={`px-2 py-1 text-[11px] font-mono-tabular rounded transition-colors whitespace-nowrap ${
                  isCurrent
                    ? 'bg-[#E5A93C] text-[#0A0B0E] font-semibold'
                    : 'text-white/65 hover:text-white hover:bg-white/10'
                }`}
              >
                CH {String(ch.number).padStart(2, '0')}
              </button>
            );
          })}
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs text-white/75 bg-[#0A0B0E]/75 border border-white/10 px-3 py-1.5 rounded-md">
          <span>{beat.cameraCue}</span>
        </div>
      </div>

      {/* Protagonist Active Focus Indicator (Subtle Top-Left Crew Lockup) */}
      {chapter.protagonistId !== activeProtagonist && (
        <div className="absolute left-4 top-26 z-20 flex items-center gap-2 bg-[#0A0B0E]/85 border border-[#E5A93C]/35 px-3 py-1.5 rounded text-xs text-[#E5A93C]">
          <Sparkles className="h-3.5 w-3.5" />
          <span>
            Reel Lead: {protagonist.codeName} · Viewing as {PROTAGONISTS[activeProtagonist].codeName}
          </span>
        </div>
      )}

      {/* Widescreen Cinema Dialogue & Tactical Choice Deck */}
      <div className="absolute inset-x-0 bottom-20 z-20 mx-auto max-w-5xl px-4 sm:px-8">
        <div className="overflow-hidden rounded-lg border border-white/12 bg-[#0D1017]/90 shadow-2xl">
          {/* Timed Tactical Countdown Bar */}
          {beat.timedSeconds && !outcomeLine && (
            <div className="h-1 w-full bg-white/10">
              <div
                className="h-full bg-[#E5A93C] transition-[width] duration-1000 ease-linear"
                style={{ width: `${timePct}%` }}
              />
            </div>
          )}

          <div className="p-4 sm:p-5">
            {/* Editorial Metadata Header (Zero-Pill Rule) */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-white/60 mb-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#E5A93C]">
                  Chapter 0{chapter.number}: {chapter.title}
                </span>
                <span aria-hidden="true">·</span>
                <span>{chapter.locationLabel}</span>
                <span aria-hidden="true">·</span>
                <span>{protagonist.archetype}</span>
              </div>
              {beat.timedSeconds && !outcomeLine && countdown !== null && (
                <span className="font-mono-tabular font-semibold text-[#E5A93C]">
                  DECISION WINDOW {countdown}s
                </span>
              )}
            </div>

            {/* Speaker + Dialogue */}
            <div className="flex items-start gap-4">
              {beat.speakerPortrait && (
                <div className="hidden sm:block h-16 w-16 shrink-0 overflow-hidden rounded-md border border-white/15 bg-[#161922]">
                  <img
                    src={beat.speakerPortrait}
                    alt={beat.speaker}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <h2 className="font-display text-lg sm:text-xl font-semibold text-[#F4F1EA]">
                    {beat.speaker}
                  </h2>
                  <span className="text-xs text-white/50">{beat.speakerRole}</span>
                </div>
                <p className="text-sm sm:text-base leading-relaxed text-[#F4F1EA]/90 max-w-3xl">
                  {outcomeLine ? outcomeLine : `“${beat.line}”`}
                </p>
              </div>
            </div>

            {/* Tactical Choices OR Advance Beat */}
            {!outcomeLine && beat.choices && beat.choices.length > 0 ? (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {beat.choices.map((choice) => {
                  const usable = hasItemStock(choice.requiredItemId);
                  return (
                    <button
                      key={choice.id}
                      type="button"
                      disabled={!usable}
                      onClick={() => handleChoiceClick(choice)}
                      className={`flex flex-col justify-between rounded-md border p-3 text-left transition-all duration-150 focus-visible:outline-2 focus-visible:outline-[#E5A93C] ${
                        usable
                          ? 'border-white/15 bg-[#151924] hover:border-[#E5A93C] hover:bg-[#1C2130] active:scale-[0.99]'
                          : 'border-white/5 bg-white/[0.02] opacity-45 cursor-not-allowed'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs sm:text-sm font-semibold text-[#F4F1EA] leading-snug">
                            {choice.label}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-white/65 leading-snug">{choice.subtext}</p>
                      </div>
                      <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono-tabular text-[#E5A93C]">
                        <span>
                          {choice.loyaltyDelta >= 0 ? `+${choice.loyaltyDelta}` : choice.loyaltyDelta} LOYALTY
                        </span>
                        <span>
                          {choice.cashDelta >= 0
                            ? `+₦${(choice.cashDelta / 1000).toFixed(0)}k`
                            : `-₦${(Math.abs(choice.cashDelta) / 1000).toFixed(0)}k`}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
                <span className="text-xs text-white/55">
                  {chapter.stakesSummary}
                </span>
                {isFinalMoment ? (
                  <button
                    type="button"
                    onClick={onFinishFilm}
                    className="inline-flex items-center gap-2 rounded-md bg-[#E5A93C] px-4 py-2 text-xs font-semibold text-[#0A0B0E] hover:bg-[#f0b84d] transition-colors whitespace-nowrap"
                  >
                    <span>Roll Finale Cut</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (outcomeLine && hasNextChapter) {
                        onSelectChapter(activeChapterIndex + 1);
                      } else {
                        onAdvanceBeat();
                      }
                    }}
                    className="inline-flex items-center gap-2 rounded-md bg-[#E5A93C] px-4 py-2 text-xs font-semibold text-[#0A0B0E] hover:bg-[#f0b84d] transition-colors whitespace-nowrap"
                  >
                    <span>{outcomeLine ? 'Next Chapter' : 'Continue Scene'}</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}

            {/* Low Loyalty Warning */}
            {vitals.partnerLoyalty < 45 && (
              <div className="mt-3 flex items-center gap-2 text-xs text-red-400">
                <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                <span>Partner Loyalty is strained — coordinate with Zuri & Dapo or restock in Surulere.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
