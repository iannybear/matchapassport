import { Award, Lock } from 'lucide-react';
import type { Badge } from '@/types';

type Props = {
  badges: Badge[];
};

export default function BadgesTab({ badges }: Props) {
  const earned = badges.filter((b) => b.earned);
  const locked = badges.filter((b) => !b.earned);

  if (badges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-cream-400 bg-cream-50 py-20 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-matcha-100 text-matcha-600">
          <Award size={28} />
        </span>
        <h3 className="mt-4 font-display text-xl font-semibold text-ink-800">No badges yet</h3>
        <p className="mt-1 max-w-xs text-sm text-matcha-600">
          Log cups to start earning medals for your drinking habits.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {earned.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Award size={18} className="text-clay-500" />
            <h3 className="font-display text-lg font-semibold text-ink-800">
              Earned medals
            </h3>
            <span className="rounded-full bg-clay-400/20 px-2 py-0.5 text-xs font-semibold text-clay-600">
              {earned.length}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {earned.map((b) => (
              <div
                key={b.name}
                className="flex items-start gap-3 rounded-2xl border border-clay-400/40 bg-gradient-to-br from-clay-400/10 to-matcha-50 p-4 shadow-soft scale-in"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-clay-500 font-display text-xl font-bold text-white shadow-stamp">
                  {b.icon}
                </span>
                <div className="min-w-0">
                  <p className="font-display text-base font-semibold text-ink-800">{b.name}</p>
                  <p className="text-xs text-matcha-600">{b.desc}</p>
                  {b.proof && (
                    <p className="mt-1.5 font-mono text-[11px] text-clay-600">{b.proof}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {locked.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Lock size={18} className="text-matcha-600" />
            <h3 className="font-display text-lg font-semibold text-ink-800">Locked</h3>
            <span className="rounded-full bg-cream-200 px-2 py-0.5 text-xs font-semibold text-matcha-700">
              {locked.length}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {locked.map((b) => (
              <div
                key={b.name}
                className="flex items-start gap-3 rounded-2xl border border-dashed border-cream-400 bg-cream-50 p-4 opacity-70"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cream-300 font-display text-xl font-bold text-cream-400">
                  {b.icon}
                </span>
                <div className="min-w-0">
                  <p className="font-display text-base font-semibold text-ink-700">{b.name}</p>
                  <p className="text-xs text-matcha-600">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
