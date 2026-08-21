import { Wallet, Coffee, TrendingUp, Trophy } from 'lucide-react';
import type { StampWithAnalytics } from '@/types';
import { formatMoney } from '@/lib/analytics';

type Props = {
  stamps: StampWithAnalytics[];
};

export default function CoverStats({ stamps }: Props) {
  // Treat cups are deducted from expenses
  const paidStamps = stamps.filter((s) => !s.is_treat);
  const totalSpend = paidStamps.reduce((s, e) => s + Number(e.amount), 0);
  const currency = stamps[0]?.currency ?? 'PHP';
  const avgSpend = paidStamps.length ? totalSpend / paidStamps.length : 0;
  const mustTryCount = stamps.filter((e) => e.tier === 'must-try').length;
  const mustTryPct = stamps.length ? Math.round((mustTryCount / stamps.length) * 100) : 0;
  const treatCount = stamps.filter((s) => s.is_treat).length;

  const stats = [
    {
      label: 'Total spent',
      value: paidStamps.length ? formatMoney(totalSpend, currency) : '—',
      sub: `${paidStamps.length} paid ${paidStamps.length === 1 ? 'cup' : 'cups'}${
        treatCount > 0 ? ` · ${treatCount} treat${treatCount === 1 ? '' : 's'}` : ''
      }`,
      icon: Wallet,
      tone: 'bg-matcha-600 text-white',
    },
    {
      label: 'Cups logged',
      value: stamps.length.toString(),
      sub: 'stamped so far',
      icon: Coffee,
      tone: 'bg-matcha-400 text-ink-800',
    },
    {
      label: 'Average / cup',
      value: paidStamps.length ? formatMoney(avgSpend, currency) : '—',
      sub: 'across paid cups',
      icon: TrendingUp,
      tone: 'bg-clay-500 text-white',
    },
    {
      label: 'Must-try rate',
      value: stamps.length ? `${mustTryPct}%` : '—',
      sub: `${mustTryCount} must-try ${mustTryCount === 1 ? 'cup' : 'cups'}`,
      icon: Trophy,
      tone: 'bg-ink-700 text-matcha-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div
            key={s.label}
            className="flex flex-col justify-between rounded-2xl border border-cream-300 bg-cream-50 p-4 shadow-soft"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-matcha-600">
                {s.label}
              </span>
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.tone}`}>
                <Icon size={16} />
              </span>
            </div>
            <div className="mt-3">
              <p className="font-display text-2xl font-semibold text-ink-800">{s.value}</p>
              <p className="mt-0.5 text-xs text-matcha-600">{s.sub}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
