import { Flame, KeyRound, Lock, Phone, Ticket, Zap } from 'lucide-react';
import { InventoryItem } from '../engine/types';

interface InventoryDockProps {
  items: InventoryItem[];
  onUseItem: (item: InventoryItem) => void;
  activeNotice?: string | null;
}

function ItemGlyph({ id }: { id: InventoryItem['id'] }) {
  switch (id) {
    case 'black_stallion':
      return <Zap className="h-4 w-4 text-[#E5A93C]" />;
    case 'torch_phone':
      return <Phone className="h-4 w-4 text-sky-400" />;
    case 'vehicle_key':
      return <KeyRound className="h-4 w-4 text-amber-300" />;
    case 'danfo_pass':
      return <Ticket className="h-4 w-4 text-yellow-400" />;
    case 'newspaper_suya':
      return <Flame className="h-4 w-4 text-orange-400" />;
    case 'lock_picks':
      return <Lock className="h-4 w-4 text-emerald-400" />;
  }
}

export function InventoryDock({ items, onUseItem, activeNotice }: InventoryDockProps) {
  return (
    <div className="pointer-events-auto flex flex-col items-center gap-1.5">
      {activeNotice && (
        <div className="bg-[#0A0B0E]/90 px-3 py-1 text-xs font-medium text-[#E5A93C] border border-[#E5A93C]/30 rounded">
          {activeNotice}
        </div>
      )}
      <div
        className="flex items-center gap-1.5 bg-[#0A0B0E]/88 border border-white/10 px-2 py-1.5 rounded-lg"
        role="region"
        aria-label="6-Slot Street Hardware Inventory"
      >
        {items.map((item) => {
          const depleted = item.quantity <= 0;
          const consumable = Boolean(item.staminaDelta || item.hpDelta);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onUseItem(item)}
              disabled={depleted}
              title={`${item.name} — ${item.effectText}`}
              className={`group relative flex items-center gap-2 px-2.5 py-1.5 rounded-md border text-left transition-all duration-150 min-h-[40px] focus-visible:outline-2 focus-visible:outline-[#E5A93C] ${
                depleted
                  ? 'border-white/5 bg-white/[0.02] opacity-40 cursor-not-allowed'
                  : 'border-white/10 bg-[#141720] hover:border-[#E5A93C]/60 hover:bg-[#1B1F2B] active:scale-[0.98]'
              }`}
            >
              <span className="font-mono-tabular text-[10px] text-white/40">{item.slot}</span>
              <ItemGlyph id={item.id} />
              <div className="hidden lg:flex flex-col leading-tight">
                <span className="text-[11px] font-semibold text-[#F4F1EA] whitespace-nowrap">
                  {item.shortLabel}
                </span>
                <span className="text-[10px] text-white/50 whitespace-nowrap font-mono-tabular">
                  {consumable ? (item.staminaDelta ? `+${item.staminaDelta} STM` : `+${item.hpDelta} HP`) : item.tacticalTag}
                </span>
              </div>
              <span className="font-mono-tabular text-[11px] font-semibold text-[#E5A93C] pl-1">
                ×{item.quantity}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
