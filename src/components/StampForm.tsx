import { useState, useEffect, useRef } from 'react';
import { X, Save, Loader2, ChevronDown, Gift, Camera, Trash } from 'lucide-react';
import { insertStamp, updateStamp } from '@/lib/db';
import { geocode } from '@/lib/geocode';
import {
  type Stamp,
  type StampInput,
  type StampType,
  type Milk,
  type StoreType,
  type Tier,
  type ColorGrade,
  type PricePerception,
  type DrinkSize,
  PH_CITIES,
  STORE_TYPES,
  MILKS,
  STAMP_TYPES,
  FLAVOROR_PROFILES,
  COLORS,
  TIERS,
  PRICE_PERCEPTIONS,
  DRINK_SIZES,
  AMBIANCE_TAGS,
} from '@/types';
import StarRating from './StarRating';

type Props = {
  open: boolean;
  editing: Stamp | null;
  onClose: () => void;
  onSaved: () => void;
};

const POWDER_GRADES = ['Ceremonial', 'Premium', 'Culinary', 'Latte'];

const emptyInput: StampInput = {
  brand: '',
  drink: '',
  type: 'Matcha',
  milk: 'Dairy',
  store_type: 'Specialty Cafe',
  amount: 0,
  currency: 'PHP',
  location: 'Quezon City',
  rating: 3,
  tier: 'must-try',
  purchase_date: new Date().toISOString().slice(0, 10),
  branch: '',
  powder_brand: '',
  powder_name: '',
  powder_grade: '',
  powder_origin: '',
  flavor_profiles: [],
  sweetness: 0,
  bitterness: 0,
  color: null,
  price_perception: 'Fair Price',
  size: 'Regular',
  ambiance: [],
  is_treat: false,
  notes: '',
  photo: null,
  latitude: null,
  longitude: null,
};

export default function StampForm({ open, editing, onClose, onSaved }: Props) {
  const [form, setForm] = useState<StampInput>(emptyInput);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      const { id: _id, created_at: _c, ...rest } = editing;
      void _id;
      void _c;
      setForm({
        ...emptyInput,
        ...rest,
        flavor_profiles: rest.flavor_profiles ?? [],
        powder_grade: rest.powder_grade ?? '',
      });
    } else {
      setForm(emptyInput);
      setPhotoPreview(null);
    }
    setError(null);
  }, [editing, open]);

  useEffect(() => {
    setPhotoPreview(editing?.photo ?? null);
  }, [editing]);

  if (!open) return null;

  const set = <K extends keyof StampInput>(key: K, val: StampInput[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const toggleFlavor = (flavor: string) => {
    setForm((f) => {
      const current = f.flavor_profiles ?? [];
      return {
        ...f,
        flavor_profiles: current.includes(flavor)
          ? current.filter((x) => x !== flavor)
          : [...current, flavor],
      };
    });
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPhotoPreview(result);
      setForm((f) => ({ ...f, photo: result }));
    };
    reader.readAsDataURL(file);
  };

  const clearPhoto = () => {
    setPhotoPreview(null);
    setForm((f) => ({ ...f, photo: null }));
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Geocode if location is set and coords are not already cached
    let latitude = form.latitude;
    let longitude = form.longitude;
    const locationChanged = editing
      ? editing.location !== form.location || editing.branch !== form.branch
      : true;
    if (form.location && form.location !== 'Other' && locationChanged) {
      const coords = await geocode(form.location, form.branch);
      if (coords) {
        latitude = coords.latitude;
        longitude = coords.longitude;
      }
    }

    const payload = {
      ...form,
      amount: Number(form.amount) || 0,
      rating: Number(form.rating),
      sweetness: Number(form.sweetness) || 0,
      bitterness: Number(form.bitterness) || 0,
      flavor_profiles: form.flavor_profiles ?? [],
      branch: form.branch?.trim() || null,
      powder_brand: form.powder_brand?.trim() || null,
      powder_name: form.powder_name?.trim() || null,
      powder_grade: form.powder_grade || null,
      powder_origin: form.powder_origin?.trim() || null,
      color: form.color || null,
      purchase_date: form.purchase_date || null,
      notes: form.notes?.trim() || null,
      photo: form.photo ?? null,
      latitude,
      longitude,
    };

    try {
      if (editing) {
        await updateStamp(editing.id, payload);
      } else {
        await insertStamp(payload);
      }
    } catch (err) {
      setSaving(false);
      setError(err instanceof Error ? err.message : 'Failed to save stamp');
      return;
    }

    setSaving(false);
    onSaved();
    onClose();
  };

  const fieldClass =
    'w-full rounded-xl border border-cream-300 bg-white/70 px-4 py-2.5 text-sm text-ink-800 placeholder:text-cream-400 focus:border-matcha-500 focus:outline-none focus:ring-2 focus:ring-matcha-200 transition';
  const labelClass = 'block text-xs font-semibold uppercase tracking-wide text-matcha-700 mb-1.5';
  const chipClass = (active: boolean) =>
    `cursor-pointer rounded-lg border px-3 py-2 text-xs font-semibold transition ${
      active
        ? 'border-matcha-500 bg-matcha-600 text-white'
        : 'border-cream-300 bg-cream-50 text-matcha-700 hover:border-matcha-300'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/40 backdrop-blur-sm p-0 sm:items-center sm:p-4 fade-in">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-3xl bg-cream-100 shadow-lift slide-up sm:rounded-3xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-cream-300 bg-cream-100/95 px-6 py-4 backdrop-blur">
          <h2 className="font-display text-xl font-semibold text-ink-800">
            {editing ? 'Edit stamp' : 'New stamp'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-matcha-700 transition hover:bg-matcha-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
          {/* Date — required, at top */}
          <div>
            <label className={labelClass}>Date *</label>
            <input
              type="date"
              className={fieldClass}
              value={form.purchase_date ?? ''}
              onChange={(e) => set('purchase_date', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Brand / Cafe *</label>
              <input
                className={fieldClass}
                value={form.brand}
                onChange={(e) => set('brand', e.target.value)}
                placeholder="Lemoncha, Hoshi House, Tsujiri…"
                required
              />
            </div>
            <div>
              <label className={labelClass}>Drink *</label>
              <input
                className={fieldClass}
                value={form.drink}
                onChange={(e) => set('drink', e.target.value)}
                placeholder="Iced Matcha Latte, Banana Pudding Matcha…"
                required
              />
            </div>
          </div>

          {/* Location: city dropdown + optional branch */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>City *</label>
              <div className="relative">
               <select
  className={`${fieldClass} appearance-none pr-10`}
  value={form.location}
  onChange={(e) => set('location', e.target.value)}
  required
>
  <option value="Quezon City">Quezon City</option>
<option value="Manila">Manila</option>
  <option value="San Juan">San Juan</option>
  <option value="Makati">Makati</option>
  <option value="Taguig/BGC">Taguig/BGC</option>
    <option value="Albay">Albay</option>
    <option value="Pampanga">Pampanga</option>
    <option value="Cebu">Cebu</option>
 <option value="Japan">Japan</option>
    <option value="Other">Other</option>
</select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-matcha-600"
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Branch / Area (optional)</label>
              <input
                className={fieldClass}
                value={form.branch ?? ''}
                onChange={(e) => set('branch', e.target.value)}
                placeholder="UP Town Center, BGC High Street…"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Base</label>
              <div className="flex gap-2">
                {STAMP_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set('type', t as StampType)}
                    className={chipClass(form.type === t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>Milk</label>
              <div className="flex flex-wrap gap-2">
                {MILKS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => set('milk', m as Milk)}
                    className={chipClass(form.milk === m)}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass}>Store type</label>
            <div className="flex flex-wrap gap-2">
              {STORE_TYPES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set('store_type', s as StoreType)}
                  className={chipClass(form.store_type === s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Price + currency + treat toggle */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass}>Price (₱) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className={fieldClass}
                value={form.amount}
                onChange={(e) => set('amount', Number(e.target.value))}
                disabled={form.is_treat}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Currency</label>
              <select
                className={fieldClass}
                value={form.currency}
                onChange={(e) => set('currency', e.target.value)}
              >
                {['PHP', 'USD', 'EUR', 'GBP', 'JPY', 'SGD'].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className={labelClass}>Treat / Free cup</label>
              <button
                type="button"
                onClick={() => set('is_treat', !form.is_treat)}
                className={`flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                  form.is_treat
                    ? 'border-hanko-400 bg-hanko-400/10 text-hanko-600'
                    : 'border-cream-300 bg-cream-50 text-matcha-700 hover:border-matcha-300'
                }`}
              >
                <Gift size={15} />
                {form.is_treat ? 'Treated / Free' : 'Mark as treat'}
              </button>
            </div>
          </div>
          {form.is_treat && (
            <p className="-mt-2 text-xs text-hanko-600">
              Treat cups are deducted from your total expenses.
            </p>
          )}

          {/* Flavor profiles — multi-select */}
          <div>
            <label className={labelClass}>Flavor profile (select all that apply)</label>
            <div className="flex flex-wrap gap-2">
              {FLAVOROR_PROFILES.map((f) => {
                const active = (form.flavor_profiles ?? []).includes(f);
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => toggleFlavor(f)}
                    className={chipClass(active)}
                  >
                    {f}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sweetness + Bitterness sliders */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass}>
                Sweetness <span className="font-mono text-matcha-600">{form.sweetness}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={form.sweetness}
                onChange={(e) => set('sweetness', Number(e.target.value))}
                className="w-full accent-matcha-500"
              />
            </div>
            <div>
              <label className={labelClass}>
                Bitterness / Astringent{' '}
                <span className="font-mono text-matcha-600">{form.bitterness}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={form.bitterness}
                onChange={(e) => set('bitterness', Number(e.target.value))}
                className="w-full accent-hanko-500"
              />
            </div>
          </div>

          {/* Price perception — required single select */}
          <div>
            <label className={labelClass}>Price perception *</label>
            <div className="flex flex-wrap gap-2">
              {PRICE_PERCEPTIONS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => set('price_perception', p as PricePerception)}
                  className={chipClass(form.price_perception === p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Size — optional dropdown, default Regular */}
          <div>
            <label className={labelClass}>Size</label>
            <div className="flex flex-wrap gap-2">
              {DRINK_SIZES.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => set('size', sz as DrinkSize)}
                  className={chipClass(form.size === sz)}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Cafe ambiance — multi-select with freeform tag creation */}
          <div>
            <label className={labelClass}>Cafe ambiance (optional)</label>
            <div className="flex flex-wrap gap-2">
              {(form.ambiance ?? []).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-lg border border-matcha-500 bg-matcha-600 px-3 py-2 text-xs font-semibold text-white"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        ambiance: (f.ambiance ?? []).filter((t) => t !== tag),
                      }))
                    }
                    className="text-white/70 transition hover:text-white"
                    aria-label={`Remove ${tag}`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {AMBIANCE_TAGS.filter((t) => !(form.ambiance ?? []).includes(t)).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() =>
                    setForm((f) => ({
                        ...f,
                        ambiance: [...(f.ambiance ?? []), tag],
                      }))
                  }
                  className="cursor-pointer rounded-lg border border-cream-300 bg-cream-50 px-3 py-2 text-xs font-semibold text-matcha-700 transition hover:border-matcha-300"
                >
                  + {tag}
                </button>
              ))}
            </div>
            <input
              type="text"
              className={`${fieldClass} mt-2`}
              placeholder="Add your own tag…"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault();
                  const val = (e.target as HTMLInputElement).value.trim();
                  if (val && !(form.ambiance ?? []).includes(val)) {
                    setForm((f) => ({ ...f, ambiance: [...(f.ambiance ?? []), val] }));
                  }
                  (e.target as HTMLInputElement).value = '';
                }
              }}
            />
          </div>

          {/* Color scale */}
          <div>
            <label className={labelClass}>Color</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => {
                const active = form.color === c.value;
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => set('color', active ? null : c.value)}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                      active
                        ? 'border-matcha-500 bg-matcha-50 text-ink-800 ring-2 ring-matcha-200'
                        : 'border-cream-300 bg-cream-50 text-matcha-700 hover:border-matcha-300'
                    }`}
                  >
                    <span
                      className="h-4 w-4 rounded-full border border-ink-700/20"
                      style={{ backgroundColor: c.hex }}
                    />
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rating + Verdict */}
          <div className="rounded-2xl bg-matcha-50/60 p-5">
            <label className={labelClass}>Rating</label>
            <StarRating
              value={form.rating}
              onChange={(v) => set('rating', v ?? 3)}
              size={28}
              allowHalf
              label="overall"
            />
            <div className="mt-4">
              <label className={labelClass}>Verdict</label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {TIERS.map((t) => {
                  const active = form.tier === t.value;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => set('tier', t.value as Tier)}
                      className={`rounded-xl border px-3 py-2.5 text-left transition ${
                        active
                          ? 'border-matcha-500 bg-matcha-600 text-white'
                          : 'border-cream-300 bg-cream-50 text-matcha-700 hover:border-matcha-300'
                      }`}
                    >
                      <span className="block text-sm font-semibold">{t.label}</span>
                      <span
                        className={`block text-xs ${active ? 'text-matcha-100' : 'text-matcha-600'}`}
                      >
                        {t.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Optional powder details */}
          <details className="rounded-2xl border border-cream-300 bg-cream-50">
            <summary className="cursor-pointer select-none px-5 py-3 text-sm font-semibold text-matcha-700">
              Matcha powder details (optional)
            </summary>
            <div className="space-y-4 px-5 pb-5 pt-1">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Powder brand</label>
                  <input
                    className={fieldClass}
                    value={form.powder_brand ?? ''}
                    onChange={(e) => set('powder_brand', e.target.value)}
                    placeholder="Ippodo, Encha, Mizuba…"
                  />
                </div>
                <div>
                  <label className={labelClass}>Powder name</label>
                  <input
                    className={fieldClass}
                    value={form.powder_name ?? ''}
                    onChange={(e) => set('powder_name', e.target.value)}
                    placeholder="Ummon, Kaoru, Organic Premium"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Powder grade</label>
                  <select
                    className={fieldClass}
                    value={form.powder_grade ?? ''}
                    onChange={(e) => set('powder_grade', e.target.value || null)}
                  >
                    <option value="">—</option>
                    {POWDER_GRADES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Powder origin</label>
                  <input
                    className={fieldClass}
                    value={form.powder_origin ?? ''}
                    onChange={(e) => set('powder_origin', e.target.value)}
                    placeholder="Uji, Yame, Nishio…"
                  />
                </div>
              </div>
            </div>
          </details>

          {/* Photo upload */}
          <div>
            <label className={labelClass}>Photo (optional)</label>
            <div className="flex items-center gap-4">
              <div
                className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-matcha-400 bg-matcha-50"
                style={
                  photoPreview
                    ? { borderStyle: 'solid', borderColor: '#5a8a4a' }
                    : undefined
                }
              >
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Stamp photo"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Camera size={22} className="text-matcha-400" />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-cream-300 bg-cream-50 px-3 py-2 text-xs font-semibold text-matcha-700 transition hover:border-matcha-300"
                >
                  <Camera size={14} />
                  {photoPreview ? 'Change photo' : 'Upload photo'}
                </button>
                {photoPreview && (
                  <button
                    type="button"
                    onClick={clearPhoto}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-cream-300 bg-cream-50 px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-50"
                  >
                    <Trash size={14} />
                    Remove
                  </button>
                )}
              </div>
            </div>
            <p className="mt-1.5 text-xs text-matcha-600">
              Shown as a circular stamp seal on the card.
            </p>
          </div>

          {/* Personal notes */}
          <div>
            <label className={labelClass}>Personal notes (optional)</label>
            <textarea
              className={`${fieldClass} min-h-[80px] resize-y`}
              value={form.notes ?? ''}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="What did you think? Anything memorable about this cup?"
              rows={3}
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-matcha-700 transition hover:bg-matcha-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-matcha-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-matcha-700 disabled:opacity-60"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {editing ? 'Save stamp' : 'Stamp it'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
