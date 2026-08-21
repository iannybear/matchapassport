import { Brain, MapPin, Coffee, Milk, Store, Palette, Gauge } from 'lucide-react';
import type { StampWithAnalytics, Persona, Badge, ColorGrade } from '@/types';
import { formatMoney, colorHex, colorLabel } from '@/lib/analytics';
import { AverageFlavorRadar } from './FlavorRadar';

type Props = {
  stamps: StampWithAnalytics[];
  persona: Persona;
  badges: Badge[];
};

export default function InsightsTab({ stamps, persona, badges }: Props) {
  if (stamps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-cream-400 bg-cream-50 py-20 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-matcha-100 text-matcha-600">
          <Brain size={28} />
        </span>
        <h3 className="mt-4 font-display text-xl font-semibold text-ink-800">
          No insights yet
        </h3>
        <p className="mt-1 max-w-xs text-sm text-matcha-600">
          Log a few cups and your matcha persona will appear here.
        </p>
      </div>
    );
  }

  const earnedBadges = badges.filter((b) => b.earned);

  // top brand
  const brandCounts: Record<string, number> = {};
  stamps.forEach((s) => {
    brandCounts[s.brand] = (brandCounts[s.brand] ?? 0) + 1;
  });
  const topBrand = Object.entries(brandCounts).sort((a, b) => b[1] - a[1])[0];

  // favorite milk
  const milkCounts: Record<string, number> = {};
  stamps.forEach((s) => {
    milkCounts[s.milk] = (milkCounts[s.milk] ?? 0) + 1;
  });
  const topMilk = Object.entries(milkCounts).sort((a, b) => b[1] - a[1])[0];

  // favorite store type
  const storeCounts: Record<string, number> = {};
  stamps.forEach((s) => {
    storeCounts[s.store_type] = (storeCounts[s.store_type] ?? 0) + 1;
  });
  const topStore = Object.entries(storeCounts).sort((a, b) => b[1] - a[1])[0];

  // locations
  const locations = new Set(
    stamps.map((s) => s.location).filter((l) => l && l !== 'Unspecified'),
  );

  // type split
  const matchaCount = stamps.filter((s) => s.type === 'Matcha').length;
  const hojichaCount = stamps.filter((s) => s.type === 'Hojicha').length;

  // best value cup
  const bestValue = [...stamps]
    .filter((s) => s.bracket !== 'Free' && !s.is_treat)
    .sort((a, b) => b.index - a.index)[0];

  // verdict distribution
  const verdictCounts: Record<string, number> = {};
  stamps.forEach((s) => {
    verdictCounts[s.tier] = (verdictCounts[s.tier] ?? 0) + 1;
  });

  // flavor frequency
  const flavorCounts: Record<string, number> = {};
  stamps.forEach((s) => {
    (s.flavor_profiles ?? []).forEach((f) => {
      flavorCounts[f] = (flavorCounts[f] ?? 0) + 1;
    });
  });
  const topFlavors = Object.entries(flavorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // color distribution
  const colorCounts: Record<string, number> = {};
  stamps.forEach((s) => {
    if (s.color) colorCounts[s.color] = (colorCounts[s.color] ?? 0) + 1;
  });
  const colorEntries = Object.entries(colorCounts).sort((a, b) => b[1] - a[1]);

  // avg sweetness / bitterness
  const cupsWithSweet = stamps.filter((s) => s.sweetness > 0);
  const cupsWithBitter = stamps.filter((s) => s.bitterness > 0);
  const avgSweet = cupsWithSweet.length
    ? Math.round(cupsWithSweet.reduce((s, e) => s + e.sweetness, 0) / cupsWithSweet.length)
    : 0;
  const avgBitter = cupsWithBitter.length
    ? Math.round(cupsWithBitter.reduce((s, e) => s + e.bitterness, 0) / cupsWithBitter.length)
    : 0;

  const currency = stamps[0]?.currency ?? 'PHP';

  const facts: { icon: React.ElementType; label: string; value: string }[] = [
    {
      icon: Coffee,
      label: 'Most-visited brand',
      value: topBrand ? `${topBrand[0]} (${topBrand[1]}×)` : '—',
    },
    {
      icon: Milk,
      label: 'Go-to milk',
      value: topMilk ? topMilk[0] : '—',
    },
    {
      icon: Store,
      label: 'Preferred venue',
      value: topStore ? topStore[0] : '—',
    },
    {
      icon: MapPin,
      label: 'Cities visited',
      value: `${locations.size}`,
    },
  ];

  const VERDICT_LABELS: Record<string, string> = {
    'must-try': 'Must try',
    repeat: 'Would repeat',
    maybe: 'Maybe',
    pass: 'Pass',
  };
  const VERDICT_COLORS: Record<string, string> = {
    'must-try': 'bg-matcha-600',
    repeat: 'bg-matcha-400',
    maybe: 'bg-clay-400',
    pass: 'bg-hanko-500',
  };

  return (
    <div className="space-y-8">
      {/* Persona card */}
      <section className="overflow-hidden rounded-3xl border border-cream-300 bg-gradient-to-br from-matcha-700 to-ink-800 p-6 text-matcha-50 shadow-card sm:p-8">
        <div className="flex items-center gap-2 text-matcha-200">
          <Brain size={18} />
          <span className="text-xs font-semibold uppercase tracking-wider">Your archetype</span>
        </div>
        <h3 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">{persona.tag}</h3>
        <p className="mt-2 max-w-lg text-sm text-matcha-100 sm:text-base">{persona.desc}</p>
        {earnedBadges.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {earnedBadges.map((b) => (
              <span
                key={b.name}
                className="inline-flex items-center gap-1.5 rounded-full bg-matcha-50/15 px-3 py-1 text-xs font-semibold text-matcha-50 backdrop-blur"
              >
                <span className="font-display">{b.icon}</span>
                {b.name}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Quick facts */}
      <section>
        <h3 className="mb-4 font-display text-lg font-semibold text-ink-800">Drinking profile</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {facts.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.label}
                className="rounded-2xl border border-cream-300 bg-cream-50 p-4 shadow-soft"
              >
                <Icon size={18} className="text-matcha-600" />
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-matcha-600">
                  {f.label}
                </p>
                <p className="mt-1 font-display text-lg font-semibold text-ink-800">{f.value}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Verdict distribution */}
      <section>
        <h3 className="mb-4 font-display text-lg font-semibold text-ink-800">Verdict breakdown</h3>
        <div className="rounded-2xl border border-cream-300 bg-cream-50 p-5 shadow-soft">
          <div className="flex h-8 overflow-hidden rounded-lg">
            {(['must-try', 'repeat', 'maybe', 'pass'] as const).map((t) => {
              const count = verdictCounts[t] ?? 0;
              if (count === 0) return null;
              return (
                <div
                  key={t}
                  className={`flex items-center justify-center text-xs font-bold text-white ${VERDICT_COLORS[t]}`}
                  style={{ width: `${(count / stamps.length) * 100}%` }}
                  title={`${VERDICT_LABELS[t]}: ${count}`}
                >
                  {count}
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-matcha-600">
            {(['must-try', 'repeat', 'maybe', 'pass'] as const).map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5">
                <span className={`h-2.5 w-2.5 rounded-full ${VERDICT_COLORS[t]}`} />
                {VERDICT_LABELS[t]} ({verdictCounts[t] ?? 0})
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Type split */}
      <section>
        <h3 className="mb-4 font-display text-lg font-semibold text-ink-800">Matcha vs Hojicha</h3>
        <div className="rounded-2xl border border-cream-300 bg-cream-50 p-5 shadow-soft">
          <div className="flex h-8 overflow-hidden rounded-lg">
            {matchaCount > 0 && (
              <div
                className="flex items-center justify-center bg-matcha-500 text-xs font-bold text-white"
                style={{ width: `${(matchaCount / stamps.length) * 100}%` }}
              >
                {matchaCount}
              </div>
            )}
            {hojichaCount > 0 && (
              <div
                className="flex items-center justify-center bg-clay-400 text-xs font-bold text-white"
                style={{ width: `${(hojichaCount / stamps.length) * 100}%` }}
              >
                {hojichaCount}
              </div>
            )}
          </div>
          <div className="mt-3 flex gap-4 text-xs text-matcha-600">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-matcha-500" /> Matcha ({matchaCount})
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-clay-400" /> Hojicha ({hojichaCount})
            </span>
          </div>
        </div>
      </section>

      {/* Flavor profile */}
      {topFlavors.length > 0 && (
        <section>
          <h3 className="mb-4 font-display text-lg font-semibold text-ink-800">
            Top flavor notes
          </h3>
          <div className="flex flex-wrap gap-2">
            {topFlavors.map(([flavor, count]) => (
              <span
                key={flavor}
                className="inline-flex items-center gap-2 rounded-full border border-matcha-200 bg-matcha-50 px-3 py-1.5 text-sm font-semibold text-matcha-700"
              >
                {flavor}
                <span className="rounded-full bg-matcha-200 px-1.5 py-0.5 text-[11px] font-bold text-matcha-800">
                  {count}
                </span>
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Color distribution */}
      {colorEntries.length > 0 && (
        <section>
          <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-ink-800">
            <Palette size={18} className="text-matcha-600" />
            Color grades
          </h3>
          <div className="space-y-2">
            {colorEntries.map(([grade, count]) => (
              <div key={grade} className="flex items-center gap-3">
                <span
                  className="h-5 w-5 shrink-0 rounded-full border border-ink-700/20"
                  style={{ backgroundColor: colorHex(grade as ColorGrade) }}
                />
                <span className="w-28 shrink-0 text-sm text-matcha-700">
                  {colorLabel(grade as ColorGrade)}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-cream-300">
                  <div
                    className="h-full rounded-full bg-matcha-400"
                    style={{ width: `${(count / stamps.length) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right text-xs font-semibold text-matcha-600">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sweetness / bitterness averages */}
      {(cupsWithSweet.length > 0 || cupsWithBitter.length > 0) && (
        <section>
          <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-ink-800">
            <Gauge size={18} className="text-matcha-600" />
            Taste averages
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {cupsWithSweet.length > 0 && (
              <div className="rounded-2xl border border-cream-300 bg-cream-50 p-4 shadow-soft">
                <p className="text-xs font-semibold uppercase tracking-wide text-matcha-600">
                  Avg sweetness
                </p>
                <p className="mt-1 font-display text-2xl font-semibold text-clay-500">
                  {avgSweet}%
                </p>
                <p className="text-xs text-matcha-600">across {cupsWithSweet.length} cups</p>
              </div>
            )}
            {cupsWithBitter.length > 0 && (
              <div className="rounded-2xl border border-cream-300 bg-cream-50 p-4 shadow-soft">
                <p className="text-xs font-semibold uppercase tracking-wide text-matcha-600">
                  Avg bitterness
                </p>
                <p className="mt-1 font-display text-2xl font-semibold text-hanko-500">
                  {avgBitter}%
                </p>
                <p className="text-xs text-matcha-600">across {cupsWithBitter.length} cups</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Average flavor radar */}
      {(cupsWithSweet.length > 0 || cupsWithBitter.length > 0) && (
        <section>
          <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-ink-800">
            <Gauge size={18} className="text-matcha-600" />
            Average flavor profile
          </h3>
          <div className="rounded-2xl border border-cream-300 bg-cream-50 p-5 shadow-soft">
            <AverageFlavorRadar stamps={stamps} />
          </div>
        </section>
      )}

      {/* Best value */}
      {bestValue && (
        <section>
          <h3 className="mb-4 font-display text-lg font-semibold text-ink-800">
            Best value cup
          </h3>
          <div className="flex items-center justify-between rounded-2xl border border-matcha-300 bg-matcha-50 p-5 shadow-soft">
            <div>
              <p className="font-display text-lg font-semibold text-ink-800">
                {bestValue.brand} · {bestValue.drink}
              </p>
              <p className="text-sm text-matcha-600">
                {bestValue.bracket} · {formatMoney(Number(bestValue.amount), currency)} ·{' '}
                {bestValue.rating.toFixed(1)}★
              </p>
            </div>
            <span className="font-mono text-2xl font-bold text-matcha-600">
              +{bestValue.index.toFixed(2)}
            </span>
          </div>
        </section>
      )}
    </div>
  );
}
