import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Plus,
  Loader2,
  Search,
  BookOpenText,
  Sparkles,
  Award,
  Brain,
  MapPin,
} from 'lucide-react';
import { fetchStamps, deleteStamp } from './lib/db';
import type { Stamp, StampWithAnalytics } from './types';
import { computeAnalytics, computeBadges, computePersona } from './lib/analytics';
import StampForm from './components/StampForm';
import StampCard from './components/StampCard';
import CoverStats from './components/CoverStats';
import SurprisesTab from './components/SurprisesTab';
import BadgesTab from './components/BadgesTab';
import InsightsTab from './components/InsightsTab';
import MapTab from './components/MapTab';

type Tab = 'passport' | 'surprises' | 'badges' | 'insights' | 'map';
type SortKey = 'recent' | 'rating' | 'price-high' | 'price-low';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'passport', label: 'Passport', icon: BookOpenText },
  // { id: 'surprises', label: 'Surprises', icon: Sparkles },
  { id: 'map', label: 'Map', icon: MapPin },
  { id: 'badges', label: 'Badges', icon: Award },
  { id: 'insights', label: 'Insights', icon: Brain },
];

export default function App() {
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Stamp | null>(null);
  const [tab, setTab] = useState<Tab>('passport');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('recent');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const fetchStampsCallback = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchStamps();
      setStamps(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStampsCallback();
  }, [fetchStampsCallback]);

  const handleDelete = async (s: StampWithAnalytics) => {
    try {
      await deleteStamp(s.id);
    } catch (err) {
      console.error(err);
      return;
    }
    setStamps((prev) => prev.filter((x) => x.id !== s.id));
  };

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (s: StampWithAnalytics) => {
    const { bracket: _b, index: _i, ...rest } = s;
    void _b;
    void _i;
    setEditing(rest);
    setFormOpen(true);
  };

  const analyzed = useMemo(() => computeAnalytics(stamps), [stamps]);
  const badges = useMemo(() => computeBadges(analyzed), [analyzed]);
  const persona = useMemo(() => computePersona(stamps), [stamps]);
  const earnedCount = badges.filter((b) => b.earned).length;

  const filtered = useMemo(() => {
    let list = analyzed;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.brand?.toLowerCase().includes(q) ||
          s.drink?.toLowerCase().includes(q) ||
          s.location?.toLowerCase().includes(q) ||
          (s.type?.toLowerCase().includes(q) ?? false),
      );
    }
    if (typeFilter !== 'all') {
      list = list.filter((s) => s.type === typeFilter);
    }
    const sorted = [...list];
    switch (sort) {
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'price-high':
        sorted.sort((a, b) => Number(b.amount) - Number(a.amount));
        break;
      case 'price-low':
        sorted.sort((a, b) => Number(a.amount) - Number(b.amount));
        break;
      default:
        sorted.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
    }
    return sorted;
  }, [analyzed, search, sort, typeFilter]);

  return (
    <div className="min-h-screen bg-cream-100 paper-texture">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-cream-300 bg-cream-100/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-matcha-600 text-matcha-50 shadow-soft">
              <BookOpenText size={18} />
            </span>
            <div className="leading-tight">
              <h1 className="font-display text-lg font-semibold text-ink-800">
                Matcha Passport
              </h1>
              <p className="hidden text-xs text-matcha-600 sm:block">
                Log every cup, earn every stamp
              </p>
            </div>
          </div>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-1.5 rounded-xl bg-matcha-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-matcha-700 active:scale-95"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span className="hidden sm:inline">Add cup</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

        {/* Tabs */}
        <nav className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto pb-2">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
                    active
                      ? 'bg-matcha-600 text-white shadow-soft'
                      : 'text-matcha-700 hover:bg-matcha-100'
                  }`}
                >
                  <Icon size={15} />
                  {t.label}
                  {t.id === 'badges' && earnedCount > 0 && (
                    <span
                      className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                        active ? 'bg-white/20 text-white' : 'bg-clay-400/20 text-clay-600'
                      }`}
                    >
                      {earnedCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Cover stats */}
        <section className="mb-8">
          <CoverStats stamps={analyzed} />
        </section>

        {/* Passport tab */}
        {tab === 'passport' && (
          <>
            <section className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 sm:max-w-xs">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-cream-400"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search brand, drink, location…"
                  className="w-full rounded-xl border border-cream-300 bg-cream-50 py-2.5 pl-9 pr-3 text-sm text-ink-800 placeholder:text-cream-400 focus:border-matcha-500 focus:outline-none focus:ring-2 focus:ring-matcha-200"
                />
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="rounded-xl border border-cream-300 bg-cream-50 px-3 py-2.5 text-sm text-ink-800 focus:border-matcha-500 focus:outline-none focus:ring-2 focus:ring-matcha-200"
                >
                  <option value="all">All bases</option>
                  <option value="Matcha">Matcha</option>
                  <option value="Hojicha">Hojicha</option>
                </select>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="rounded-xl border border-cream-300 bg-cream-50 px-3 py-2.5 text-sm text-ink-800 focus:border-matcha-500 focus:outline-none focus:ring-2 focus:ring-matcha-200"
                >
                  <option value="recent">Most recent</option>
                  <option value="rating">Top rated</option>
                  <option value="price-high">Price: high to low</option>
                  <option value="price-low">Price: low to high</option>
                </select>
              </div>
            </section>

            {loading ? (
              <div className="flex items-center justify-center py-24 text-matcha-600">
                <Loader2 size={24} className="animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-cream-400 bg-cream-50 py-20 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-matcha-100 text-matcha-600">
                  <BookOpenText size={28} />
                </span>
                <h3 className="mt-4 font-display text-xl font-semibold text-ink-800">
                  {stamps.length === 0 ? 'Your passport is empty' : 'No matches'}
                </h3>
                <p className="mt-1 max-w-xs text-sm text-matcha-600">
                  {stamps.length === 0
                    ? 'Add your first cup of matcha to start collecting stamps.'
                    : 'Try a different search or filter.'}
                </p>
                {stamps.length === 0 && (
                  <button
                    onClick={openAdd}
                    className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-matcha-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-matcha-700"
                  >
                    <Plus size={16} strokeWidth={2.5} />
                    Add your first cup
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((s, i) => (
                  <StampCard
                    key={s.id}
                    stamp={s}
                    index={i}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Surprises tab — hidden for now; code retained for later */}
        {/* {tab === 'surprises' && <SurprisesTab stamps={analyzed} />} */}

        {/* Map tab */}
        {tab === 'map' && <MapTab stamps={analyzed} />}

        {/* Badges tab */}
        {tab === 'badges' && <BadgesTab badges={badges} />}

        {/* Insights tab */}
        {tab === 'insights' && (
          <InsightsTab stamps={analyzed} persona={persona} badges={badges} />
        )}
      </main>

      <footer className="border-t border-cream-300 py-6 text-center text-xs text-matcha-600">
        Matcha Passport · keep sipping, keep stamping
      </footer>

      <StampForm
        open={formOpen}
        editing={editing}
        onClose={() => setFormOpen(false)}
        onSaved={fetchStampsCallback}
      />
    </div>
  );
}
