import { ChangeEvent, useState } from 'react';
import { Check, ImagePlus, RotateCcw, ShieldCheck } from 'lucide-react';
import { SponsorBillboardBanner } from '../engine/types';
import { FLAGSHIP_SPONSOR, SCENE_ART } from '../engine/worldData';
import { CanvasSceneFX } from './CanvasSceneFX';

interface SponsorPortalStageProps {
  activeSponsor: SponsorBillboardBanner;
  onDeploySponsor: (banner: SponsorBillboardBanner) => void;
}

const DESIGNATED_ZONES = [
  'Third Mainland Gantry North',
  'Oshodi Transport Interchange',
  'Surulere Depot Cooler',
  'Lekki Toll Plaza Arch',
];

export function SponsorPortalStage({ activeSponsor, onDeploySponsor }: SponsorPortalStageProps) {
  const [brandName, setBrandName] = useState(activeSponsor.brandName);
  const [headline, setHeadline] = useState(activeSponsor.headline);
  const [subheadline, setSubheadline] = useState(activeSponsor.subheadline);
  const [previewImage, setPreviewImage] = useState(activeSponsor.imageUrl);
  const [zone, setZone] = useState(activeSponsor.placementZones[0] || DESIGNATED_ZONES[0]);
  const [deployedMsg, setDeployedMsg] = useState<string | null>(null);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPreviewImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeploy = () => {
    onDeploySponsor({
      id: 'verified-custom-banner',
      brandName: brandName.trim() || 'Verified Syndicate Partner',
      headline: headline.trim() || 'DESIGNATED CORRIDOR',
      subheadline: subheadline.trim() || 'APPROVED ROADSIDE FRAME',
      imageUrl: previewImage || SCENE_ART.blackStallionCan,
      accentColor: '#E5A93C',
      isFlagship: brandName.toLowerCase().includes('stallion'),
      verified: true,
      placementZones: [zone],
    });
    setDeployedMsg(`Deployed cleanly to ${zone} — visible inside film skyline scenes.`);
  };

  const handleRestoreFlagship = () => {
    setBrandName(FLAGSHIP_SPONSOR.brandName);
    setHeadline(FLAGSHIP_SPONSOR.headline);
    setSubheadline(FLAGSHIP_SPONSOR.subheadline);
    setPreviewImage(FLAGSHIP_SPONSOR.imageUrl);
    setZone(FLAGSHIP_SPONSOR.placementZones[0]);
    onDeploySponsor(FLAGSHIP_SPONSOR);
    setDeployedMsg('Black Stallion flagship campaign restored across city gantries.');
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0A0B0E]">
      <img
        src={SCENE_ART.lagosSkyline}
        alt="Lagos Highway Gantry Preview"
        referrerPolicy="no-referrer"
        className="animate-ken-burns absolute inset-0 h-full w-full object-cover opacity-55"
      />
      <CanvasSceneFX mode="dusk" />
      <div className="cinema-vignette pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0A0B0E] via-[#0A0B0E]/60 to-[#0A0B0E]/60" />

      <div className="relative z-20 mx-auto flex h-full max-w-6xl flex-col justify-center px-4 sm:px-8 pb-16 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Live Highway Billboard Gantry & Black Stallion Cooler Preview */}
          <div className="lg:col-span-7 flex flex-col justify-between rounded-lg border border-white/12 bg-[#0D1017]/92 p-5 shadow-2xl">
            <div>
              <div className="flex items-center justify-between text-xs text-white/60">
                <span className="font-semibold text-[#E5A93C]">
                  Designated Highway Gantry Preview
                </span>
                <span>{zone}</span>
              </div>

              <div className="mt-4 relative h-64 sm:h-72 w-full overflow-hidden rounded-md border border-[#E5A93C]/50 bg-[#0A0B0E]">
                <img
                  src={previewImage}
                  alt={brandName}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent" />
                <div className="absolute inset-y-0 left-0 flex flex-col justify-center p-6 max-w-md">
                  <span className="font-mono-tabular text-[11px] tracking-widest text-[#E5A93C]">
                    {brandName.toUpperCase()}
                  </span>
                  <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#F4F1EA] leading-tight mt-1">
                    {headline}
                  </h2>
                  <p className="text-xs sm:text-sm text-white/80 mt-2">{subheadline}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-white/65 border-t border-white/10 pt-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Curated frames only — keeps Lagos skyline uncluttered & realistic.</span>
              </div>
              <span className="font-mono-tabular text-[#E5A93C]">BLACK STALLION DEPOT READY</span>
            </div>
          </div>

          {/* Verified Business Ad Portal Controls */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-lg border border-white/12 bg-[#0D1017]/94 p-5 shadow-2xl">
            <div className="space-y-3">
              <div>
                <h3 className="font-display text-xl font-semibold text-[#F4F1EA]">
                  Verified Business Ad Portal
                </h3>
                <p className="text-xs text-white/65 mt-0.5">
                  Upload a brand banner into designated highway gantries and supermarket depot coolers.
                </p>
              </div>

              <label className="block text-xs text-white/75">
                <span className="block mb-1">Brand Name</span>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full rounded-md border border-white/15 bg-[#151924] px-3 py-2 text-xs text-[#F4F1EA] focus:border-[#E5A93C] focus:outline-none"
                />
              </label>

              <label className="block text-xs text-white/75">
                <span className="block mb-1">Billboard Headline</span>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full rounded-md border border-white/15 bg-[#151924] px-3 py-2 text-xs text-[#F4F1EA] focus:border-[#E5A93C] focus:outline-none"
                />
              </label>

              <label className="block text-xs text-white/75">
                <span className="block mb-1">Subheadline / Depot Callout</span>
                <input
                  type="text"
                  value={subheadline}
                  onChange={(e) => setSubheadline(e.target.value)}
                  className="w-full rounded-md border border-white/15 bg-[#151924] px-3 py-2 text-xs text-[#F4F1EA] focus:border-[#E5A93C] focus:outline-none"
                />
              </label>

              <label className="block text-xs text-white/75">
                <span className="block mb-1">Designated Frame Zone</span>
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full rounded-md border border-white/15 bg-[#151924] px-3 py-2 text-xs text-[#F4F1EA] focus:border-[#E5A93C] focus:outline-none"
                >
                  {DESIGNATED_ZONES.map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-white/25 bg-[#141822] px-3 py-2.5 text-xs text-white/80 hover:border-[#E5A93C] transition-colors">
                <ImagePlus className="h-4 w-4 text-[#E5A93C]" />
                <span>Upload Verified Banner Artwork</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>

              {deployedMsg && (
                <p className="text-xs text-emerald-400">{deployedMsg}</p>
              )}
            </div>

            <div className="mt-4 flex items-center gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={handleDeploy}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md bg-[#E5A93C] px-4 py-2 text-xs font-semibold text-[#0A0B0E] hover:bg-[#f0b84d] transition-colors whitespace-nowrap"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Deploy To Gantry</span>
              </button>
              <button
                type="button"
                onClick={handleRestoreFlagship}
                title="Restore Black Stallion Flagship"
                className="inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-[#161A26] px-3 py-2 text-xs font-medium text-[#F4F1EA] hover:border-[#E5A93C] transition-colors whitespace-nowrap"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Black Stallion</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
