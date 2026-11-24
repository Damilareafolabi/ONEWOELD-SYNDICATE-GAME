export type GamePhase = 'TITLE_MENU' | 'PLAYING' | 'PAUSED' | 'FINALE';

export type FilmStageMode = 'FILM' | 'QUARTERS' | 'ATLAS' | 'FLIGHT' | 'SPONSORS';

export type ProtagonistId = 'kaz' | 'zuri_dapo' | 'folabi';

export interface ProtagonistProfile {
  id: ProtagonistId;
  codeName: string;
  fullName: string;
  archetype: string;
  district: string;
  portraitUrl: string;
  accentHex: string;
  signatureVehicle: string;
  tagline: string;
}

export interface InventoryItem {
  slot: 1 | 2 | 3 | 4 | 5 | 6;
  id:
    | 'black_stallion'
    | 'torch_phone'
    | 'vehicle_key'
    | 'danfo_pass'
    | 'newspaper_suya'
    | 'lock_picks';
  name: string;
  shortLabel: string;
  effectText: string;
  quantity: number;
  maxQuantity: number;
  staminaDelta?: number;
  hpDelta?: number;
  tacticalTag: string;
}

export interface TacticalChoice {
  id: string;
  label: string;
  subtext: string;
  requiredItemId?: InventoryItem['id'];
  loyaltyDelta: number;
  heatDelta: number;
  cashDelta: number;
  staminaCost: number;
  outcomeLine: string;
  nextBeatIndex?: number;
}

export interface StoryBeat {
  id: string;
  speaker: string;
  speakerRole: string;
  speakerPortrait?: string;
  line: string;
  cameraCue: string;
  sceneImage: string;
  fxMode: 'dusk' | 'rain' | 'interior' | 'penthouse' | 'aviation';
  showBillboardInScene?: boolean;
  timedSeconds?: number;
  choices?: TacticalChoice[];
}

export interface FilmChapter {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  protagonistId: ProtagonistId;
  locationLabel: string;
  stakesSummary: string;
  beats: StoryBeat[];
}

export type PowerSource = 'NEPA_GRID' | 'GENERATOR';

export interface DomesticQuartersState {
  powerSource: PowerSource;
  nepaGridActive: boolean;
  generatorFuelLiters: number;
  gasCylinderPct: number;
  garriServings: number;
  milkTins: number;
  groundnutPacks: number;
  waterPitcherPct: number;
  blackStallionFridgeCount: number;
  stoveLit: boolean;
  lastActionLog: string;
}

export interface MapLocationPin {
  id: string;
  name: string;
  capitalOrCity: string;
  region: 'South West' | 'South South' | 'South East' | 'North Central' | 'North West' | 'North East' | 'Global';
  airportCode: string;
  x: number; // Normalized 0..100
  y: number; // Normalized 0..100
  terrain: 'coastal' | 'rainforest' | 'savanna' | 'plateau' | 'metro';
  syndicateStatus: string;
  runwayLengthM: number;
}

export interface FictionalAirline {
  id: 'eko_skyways' | 'atlantic_sovereign';
  name: string;
  aircraftModel: string;
  callsignPrefix: string;
  tier: 'Commercial Flagship' | 'Private Executive Charter';
  cruiseSpeedKts: number;
  cruiseAltFt: number;
  cabinNote: string;
}

export interface CabinPassenger {
  id: string;
  name: string;
  role: string;
  seat: string;
  dialogue: string;
  perkLabel: string;
  perkCash?: number;
  perkLoyalty?: number;
  perkStamina?: number;
}

export interface SponsorBillboardBanner {
  id: string;
  brandName: string;
  headline: string;
  subheadline: string;
  imageUrl: string;
  accentColor: string;
  isFlagship: boolean;
  verified: boolean;
  placementZones: string[];
}

export interface PlayerVitalMetrics {
  hp: number;
  stamina: number;
  partnerLoyalty: number;
  heatStars: number;
  cashNaira: number;
}
