import { Sparkles, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import type { StampWithAnalytics } from '@/types';
import { formatMoney } from '@/lib/analytics';

type Props = {
  stamps: StampWithAnalytics[];
};

export default function SurprisesTab({ stamps }: Props) {
  const ranked = [...stamps]
    .filter((s) => s.bracket !== 'Free')
    .sort((a, b) => b.index - a.index);

  const overperformers = ranked.filter((s) => s.index > 0.3);
  const underperformers = ranked.filter((s) => s.index < -0.3).reverse();
  const neutral = ranked.filter((s) => Math.abs(s.index) <= 0.3);

  if (stamps.length === 0) {
    return (
      <EmptyState
        title="No surprises yet"
        desc="Log a few cups and we'll flag the ones that over- or under-delivered for their price."
      />
    );
  }

  if (ranked.length === 0) {
    return (
      <EmptyState
        title="Add priced cups to see surprises"
        desc="The Worth-It Index compares each cup's rating to its price bracket. Log a few paid drinks to populate this tab."
      />
    );
  }

  return (
    <div className="space-y-8">
      <Section
        title="Overperformers"
        icon={ArrowUpRight}
        tone="text-matcha-600"
        desc="Cups that punched above their price bracket."
        items={overperformers}
        empty="Nothing overperforming yet — log more cups to find hidden gems."
      />
      <Section
        title="Underperformers"
        icon={ArrowDownRight}
        tone="text-hanko-500"
        desc="Cups that didn't justify their price."
        items={underperformers}
        empty="No disappointments — every paid cup landed near its bracket average."
      />
      {neutral.length > 0 && (
        <Section
          title="On par"
          icon={Minus}
          tone="text-ink-700"
          desc="Cups that matched expectations for their price."
          items={neutral}
          empty=""
        />
      )}
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  tone,
  desc,
  items,
  empty,
}: {
  title: string;
  icon: React.ElementType;
  tone: string;
  desc: string;
  items: StampWithAnalytics[];
  empty: string;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <Icon size={18} className={tone} />
        <h3 className="font-display text-lg font-semibold text-ink-800">{title}</h3>
        <span className="rounded-full bg-cream-200 px-2 py-0.5 text-xs font-semibold text-matcha-700">
          {items.length}
        </span>
      </div>
      <p className="mb-4 text-sm text-matcha-600">{desc}</p>
      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-cream-400 bg-cream-50 px-4 py-6 text-center text-sm text-matcha-600">
          {empty}
        </p>
      ) : (
        <div className="space-y-2">
          {items.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-xl border border-cream-300 bg-cream-50 px-4 py-3 shadow-soft transition hover:shadow-card"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-ink-800">
                  {s.brand} · {s.drink}
                </p>
                <p className="text-xs text-matcha-600">
                  {s.bracket} · {formatMoney(Number(s.amount), s.currency)} · {s.rating.toFixed(1)}★
                </p>
              </div>
              <span
                className={`ml-3 shrink-0 font-mono text-sm font-bold ${
                  s.index > 0.3
                    ? 'text-matcha-600'
                    : s.index < -0.3
                      ? 'text-hanko-500'
                      : 'text-ink-700'
                }`}
              >
                {s.index > 0 ? '+' : ''}
                {s.index.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function EmptyState({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-cream-400 bg-cream-50 py-20 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-matcha-100 text-matcha-600">
        <Sparkles size={28} />
      </span>
      <h3 className="mt-4 font-display text-xl font-semibold text-ink-800">{title}</h3>
      <p className="mt-1 max-w-xs text-sm text-matcha-600">{desc}</p>
    </div>
  );
}
