import { Pencil, Trash2, MapPin, Gift, Coffee } from 'lucide-react';
import type { StampWithAnalytics, Bracket, Tier, ColorGrade } from '@/types';
import { formatMoney, formatDate, colorHex, colorLabel } from '@/lib/analytics';
import { StampFlavorRadar } from './FlavorRadar';

type Props = {
  stamp: StampWithAnalytics;
  onEdit: (s: StampWithAnalytics) => void;
  onDelete: (s: StampWithAnalytics) => void;
  index: number;
};

const BRACKET_STYLES: Record<Bracket, string> = {
  Free: 'border-matcha-300 bg-matcha-50 text-matcha-700',
  Budget: 'border-matcha-400 bg-matcha-100 text-matcha-700',
  Mid: 'border-clay-400 bg-clay-400/15 text-clay-600',
  Premium: 'border-hanko-400 bg-hanko-400/10 text-hanko-600',
};

const TIER_STYLES: Record<Tier, string> = {
  'must-try': 'bg-matcha-600 text-white',
  repeat: 'bg-matcha-400 text-ink-800',
  maybe: 'bg-clay-400 text-white',
  pass: 'bg-hanko-500 text-white',
};

const TIER_LABEL: Record<Tier, string> = {
  'must-try': 'Must try',
  repeat: 'Would repeat',
  maybe: 'Maybe',
  pass: 'Pass',
};

function Meter({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div>
      <div className="mb-0.5 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-matcha-600">
        <span>{label}</span>
        <span className="font-mono">{value}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-cream-300">
        <div
          className={`h-full rounded-full ${tone}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function StampCard({ stamp, onEdit, onDelete, index }: Props) {
  const bracketStyle = BRACKET_STYLES[stamp.bracket];
  const tierStyle = TIER_STYLES[stamp.tier];
  const indexColor =
    stamp.index > 0.3
      ? 'text-matcha-600'
      : stamp.index < -0.3
        ? 'text-hanko-500'
        : 'text-ink-700';
  const flavors = stamp.flavor_profiles ?? [];
  const showPowder = stamp.powder_brand || stamp.powder_name || stamp.powder_grade;
  const locationStr = [stamp.location, stamp.branch].filter(Boolean).join(' · ');

  return (
    <article
      className="group relative flex flex-col rounded-2xl border border-cream-300 bg-cream-50 p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift slide-up"
      style={{ animationDelay: `${Math.min(index * 50, 400)}ms` }}
    >
      {/* Hanko stamp corner */}
      <div className="absolute -right-2 -top-2 hanko-rotate">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed text-[9px] font-bold uppercase tracking-wider ${bracketStyle}`}
        >
          {stamp.is_treat ? 'TREAT' : stamp.bracket}
        </div>
      </div>

      {/* Circular photo */}
      {stamp.photo && (
        <div className="mb-3 flex justify-center">
          <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-matcha-400 shadow-soft">
            <img
              src={stamp.photo}
              alt={stamp.drink}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      )}

      <div className="pr-12">
        <h3 className="font-display text-lg font-semibold leading-tight text-ink-800">
          {stamp.drink}
        </h3>
        <p className="text-sm text-matcha-600">{stamp.brand}</p>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-matcha-100 px-2.5 py-0.5 text-[11px] font-semibold text-matcha-700">
          {stamp.type}
        </span>
        {stamp.milk !== 'None' && (
          <span className="rounded-full bg-cream-200 px-2.5 py-0.5 text-[11px] font-semibold text-ink-700">
            {stamp.milk}
          </span>
        )}
        <span className="rounded-full bg-cream-200 px-2.5 py-0.5 text-[11px] font-semibold text-ink-700">
          {stamp.store_type}
        </span>
      </div>

      {/* Color swatch */}
      {stamp.color && (
        <div className="mt-2 flex items-center gap-2">
          <span
            className="h-4 w-4 rounded-full border border-ink-700/20"
            style={{ backgroundColor: colorHex(stamp.color as ColorGrade) }}
          />
          <span className="text-xs text-matcha-600">{colorLabel(stamp.color as ColorGrade)}</span>
        </div>
      )}

      {/* Flavor chips */}
      {flavors.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {flavors.map((f) => (
            <span
              key={f}
              className="rounded bg-matcha-50 px-1.5 py-0.5 text-[10px] font-medium text-matcha-700"
            >
              {f}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center gap-3">
        <span className="font-mono text-sm font-bold text-clay-500">
          {stamp.rating.toFixed(1)}★
        </span>
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${tierStyle}`}>
          {TIER_LABEL[stamp.tier]}
        </span>
      </div>

      {/* Price perception, size, ambiance */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
            stamp.price_perception === 'Great Value'
              ? 'bg-matcha-100 text-matcha-700'
              : stamp.price_perception === 'Overpriced'
                ? 'bg-hanko-400/10 text-hanko-600'
                : 'bg-cream-200 text-ink-700'
          }`}
        >
          {stamp.price_perception}
        </span>
        {stamp.size && stamp.size !== 'Regular' && (
          <span className="inline-flex items-center gap-1 rounded-full bg-cream-200 px-2.5 py-0.5 text-[11px] font-semibold text-ink-700">
            <Coffee size={10} />
            {stamp.size}
          </span>
        )}
        {stamp.size === 'Regular' && (
          <span className="inline-flex items-center gap-1 rounded-full bg-cream-200 px-2.5 py-0.5 text-[11px] font-semibold text-ink-700">
            <Coffee size={10} />
            {stamp.size}
          </span>
        )}
      </div>

      {(stamp.ambiance ?? []).length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {(stamp.ambiance ?? []).map((tag) => (
            <span
              key={tag}
              className="rounded bg-clay-400/10 px-1.5 py-0.5 text-[10px] font-medium text-clay-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Sweetness / bitterness meters */}
      {(stamp.sweetness > 0 || stamp.bitterness > 0) && (
        <div className="mt-3 space-y-2">
          {stamp.sweetness > 0 && (
            <Meter label="Sweetness" value={stamp.sweetness} tone="bg-clay-400" />
          )}
          {stamp.bitterness > 0 && (
            <Meter label="Bitterness" value={stamp.bitterness} tone="bg-hanko-500" />
          )}
        </div>
      )}

      {/* Flavor radar */}
      {(stamp.sweetness > 0 || stamp.bitterness > 0) && (
        <div className="mt-3">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-matcha-600">
            Flavor profile
          </p>
          <StampFlavorRadar stamp={stamp} />
        </div>
      )}

      {locationStr && locationStr !== 'Unspecified' && (
        <p className="mt-2 inline-flex items-center gap-1 text-xs text-matcha-600">
          <MapPin size={12} />
          {locationStr}
        </p>
      )}

      {showPowder && (
        <p className="mt-1 text-xs text-matcha-600">
          {stamp.powder_brand}
          {stamp.powder_name ? ` · ${stamp.powder_name}` : ''}
          {stamp.powder_grade ? ` · ${stamp.powder_grade}` : ''}
        </p>
      )}

      {stamp.notes && (
        <p className="mt-2 rounded-lg bg-matcha-50/60 px-3 py-2 text-xs italic leading-relaxed text-matcha-700">
          "{stamp.notes}"
        </p>
      )}

      {/* Worth-It Index */}
      {stamp.bracket !== 'Free' && !stamp.is_treat && (
        <div className="mt-3 flex items-center justify-between rounded-lg bg-cream-100 px-3 py-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-matcha-600">
            Worth-It Index
          </span>
          <span className={`font-mono text-sm font-bold ${indexColor}`}>
            {stamp.index > 0 ? '+' : ''}
            {stamp.index.toFixed(2)}
          </span>
        </div>
      )}

      <div className="mt-auto pt-4">
        <div className="flex items-end justify-between border-t border-cream-300 pt-3">
          <div className="flex items-center gap-1.5">
            {stamp.is_treat ? (
              <>
                <Gift size={14} className="text-hanko-500" />
                <p className="font-display text-lg font-semibold text-hanko-600">Treat</p>
              </>
            ) : (
              <p className="font-display text-xl font-semibold text-ink-800">
                {stamp.amount === 0 ? 'Free' : formatMoney(Number(stamp.amount), stamp.currency)}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-matcha-600">
              {stamp.purchase_date ? formatDate(stamp.purchase_date) : formatDate(stamp.created_at)}
            </p>
          </div>
        </div>

        <div className="mt-3 flex justify-end gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <button
            onClick={() => onEdit(stamp)}
            className="rounded-lg p-2 text-matcha-600 transition hover:bg-matcha-100 hover:text-matcha-800"
            aria-label="Edit"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onDelete(stamp)}
            className="rounded-lg p-2 text-red-500/70 transition hover:bg-red-50 hover:text-red-600"
            aria-label="Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </article>
  );
}
