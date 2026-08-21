import type {
  Stamp,
  StampWithAnalytics,
  Bracket,
  Badge,
  Persona,
  ColorGrade,
} from '@/types';

function quantile(sorted: number[], q: number): number {
  if (sorted.length === 0) return 0;
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  return sorted[base + 1] !== undefined
    ? sorted[base] + rest * (sorted[base + 1] - sorted[base])
    : sorted[base];
}

export function computeAnalytics(stamps: Stamp[]): StampWithAnalytics[] {
  // Only paid, non-treat cups define the price brackets
  const bracketPrices = stamps
    .filter((s) => s.amount > 0 && !s.is_treat)
    .map((s) => s.amount)
    .sort((a, b) => a - b);
  const q1 = quantile(bracketPrices, 1 / 3);
  const q2 = quantile(bracketPrices, 2 / 3);

  const bracketOf = (s: Stamp): Bracket => {
    if (s.amount === 0 || s.is_treat) return 'Free';
    if (s.amount <= q1) return 'Budget';
    if (s.amount <= q2) return 'Mid';
    return 'Premium';
  };

  const withBracket = stamps.map((s) => ({ ...s, bracket: bracketOf(s) }));

  const avg: Record<Bracket, number | null> = {
    Free: null,
    Budget: null,
    Mid: null,
    Premium: null,
  };
  (['Free', 'Budget', 'Mid', 'Premium'] as Bracket[]).forEach((b) => {
    const items = withBracket.filter((s) => s.bracket === b);
    avg[b] = items.length ? items.reduce((sum, s) => sum + s.rating, 0) / items.length : null;
  });

  return withBracket.map((s) => ({
    ...s,
    index:
      avg[s.bracket] !== null
        ? Math.round((s.rating - (avg[s.bracket] as number)) * 100) / 100
        : 0,
  }));
}

export function computeBadges(stamps: StampWithAnalytics[]): Badge[] {
  const brandCounts: Record<string, number> = {};
  const brandSpend: Record<string, number> = {};
  stamps.forEach((s) => {
    brandCounts[s.brand] = (brandCounts[s.brand] ?? 0) + 1;
    if (!s.is_treat) brandSpend[s.brand] = (brandSpend[s.brand] ?? 0) + Number(s.amount);
  });

  const maxVisits = Math.max(0, ...Object.values(brandCounts));
  const loyalistCandidates = Object.keys(brandCounts).filter(
    (b) => brandCounts[b] === maxVisits,
  );
  const loyalistBrand = loyalistCandidates.sort(
    (a, b) => brandSpend[b] - brandSpend[a],
  )[0];
  const bigSpenderBrand = Object.keys(brandSpend).sort(
    (a, b) => brandSpend[b] - brandSpend[a],
  )[0];

  const nonZero = stamps
    .filter((s) => s.amount > 0 && !s.is_treat)
    .map((s) => s.amount)
    .sort((a, b) => a - b);
  const q1 = nonZero.length ? nonZero[Math.floor((nonZero.length - 1) / 3)] : 0;
  const valueHunterHits = stamps.filter(
    (s) => s.amount > 0 && !s.is_treat && s.amount <= q1 && s.rating >= 4,
  );
  const freebieCount = stamps.filter((s) => s.amount === 0 || s.is_treat).length;
  const hojichaCount = stamps.filter((s) => s.type === 'Hojicha').length;
  const bigBrandBrands = new Set(
    stamps.filter((s) => s.store_type === 'Commercial Chain').map((s) => s.brand),
  );
  const bestSurprise = stamps
    .filter((s) => s.bracket !== 'Free')
    .sort((a, b) => b.index - a.index)[0];

  // consistency streak
  function isoWeekKey(d: Date): number {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const day = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const wk = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7));
    return date.getUTCFullYear() * 52 + wk;
  }
  const weekNums = [
    ...new Set(stamps.map((s) => isoWeekKey(new Date(s.created_at)))),
  ].sort((a, b) => a - b);
  let longest = weekNums.length ? 1 : 0;
  let cur = 1;
  for (let i = 1; i < weekNums.length; i++) {
    if (weekNums[i] === weekNums[i - 1] + 1) {
      cur++;
      longest = Math.max(longest, cur);
    } else {
      cur = 1;
    }
  }

  // flavor explorer: 6+ distinct flavor profiles across cups
  const flavors = new Set(stamps.flatMap((s) => s.flavor_profiles ?? []));

  // color connoisseur: logged color on 5+ cups
  const colorLogged = stamps.filter((s) => s.color).length;

  return [
    {
      name: 'Punch-Above Champion',
      icon: '★',
      desc: 'Highest Worth-It Index in the ledger.',
      proof: bestSurprise ? `${bestSurprise.brand} · +${bestSurprise.index} vs bracket` : '',
      earned: stamps.length >= 6 && !!bestSurprise,
    },
    {
      name: 'Loyalist',
      icon: 'L',
      desc: 'Returned to one brand more than any other.',
      proof: loyalistBrand ? `${loyalistBrand} · ${maxVisits} visits` : '',
      earned: maxVisits >= 2,
    },
    {
      name: 'Big Spender',
      icon: '₱',
      desc: 'Highest cumulative spend on one brand.',
      proof: bigSpenderBrand
        ? `${bigSpenderBrand} · ₱${brandSpend[bigSpenderBrand].toLocaleString()}`
        : '',
      earned: !!bigSpenderBrand,
    },
    {
      name: 'Value Hunter',
      icon: 'V',
      desc: '3+ Budget-bracket drinks rated 4 or higher.',
      proof: `${valueHunterHits.length} qualifying cups`,
      earned: valueHunterHits.length >= 3,
    },
    {
      name: 'Freebie Finder',
      icon: 'F',
      desc: 'Logged 8+ drinks that cost nothing (free or treated).',
      proof: `${freebieCount} free cups`,
      earned: freebieCount >= 8,
    },
    {
      name: 'Hojicha Explorer',
      icon: 'H',
      desc: 'Branched into 4+ hojicha drinks.',
      proof: `${hojichaCount} hojicha entries`,
      earned: hojichaCount >= 4,
    },
    {
      name: 'Chain Hopper',
      icon: 'C',
      desc: 'Tried 6+ different commercial chains.',
      proof: `${bigBrandBrands.size} unique chains`,
      earned: bigBrandBrands.size >= 6,
    },
    {
      name: 'Consistency Streak',
      icon: 'S',
      desc: '3+ consecutive weeks with a cup logged.',
      proof: `${longest} week${longest === 1 ? '' : 's'} in a row`,
      earned: longest >= 3,
    },
    {
      name: 'Flavor Explorer',
      icon: '§',
      desc: 'Logged 6+ distinct flavor profiles.',
      proof: `${flavors.size} unique flavors`,
      earned: flavors.size >= 6,
    },
    {
      name: 'Color Connoisseur',
      icon: '◐',
      desc: 'Recorded the color grade on 5+ cups.',
      proof: `${colorLogged} cups with color`,
      earned: colorLogged >= 5,
    },
  ];
}

export function computePersona(stamps: Stamp[]): Persona {
  if (stamps.length === 0) {
    return { tag: 'THE BLANK PASSPORT', desc: 'Log your first cup to discover your archetype.' };
  }
  const total = stamps.length;
  const spend = stamps
    .filter((s) => !s.is_treat)
    .reduce((s, e) => s + Number(e.amount), 0);
  const mustTryN = stamps.filter((e) => e.tier === 'must-try').length;
  const passSpend = stamps
    .filter((e) => e.tier === 'pass' && !e.is_treat)
    .reduce((s, e) => s + Number(e.amount), 0);
  const mustTryRatio = Math.round((mustTryN / total) * 100);
  const passPct = spend ? (passSpend / spend) * 100 : 0;
  const locations = new Set(stamps.map((e) => e.location)).size;

  if (mustTryRatio >= 50) {
    return {
      tag: 'THE CURATOR',
      desc: `${mustTryRatio}% of your cups are "must try" — you have a sharp eye for quality matcha.`,
    };
  }
  if (passPct >= 25) {
    return {
      tag: 'THE HYPE CHASER',
      desc: `₱${passSpend.toLocaleString()} went to "pass" cups — worth being pickier about hyped spots.`,
    };
  }
  return {
    tag: 'THE BALANCED EXPLORER',
    desc: `You're actively exploring across ${locations} location${locations === 1 ? '' : 's'}.`,
  };
}

export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function colorHex(grade: ColorGrade | null): string {
  const map: Record<ColorGrade, string> = {
    brownish: '#8a8f6b',
    olive: '#9ca864',
    'dull-green': '#7ba05b',
    'bright-green': '#5fa84e',
    'vibrant-jade': '#3fa53a',
  };
  return grade ? map[grade] : '#d8d1bd';
}

export function colorLabel(grade: ColorGrade | null): string {
  const map: Record<ColorGrade, string> = {
    brownish: 'Brownish',
    olive: 'Olive',
    'dull-green': 'Dull green',
    'bright-green': 'Bright green',
    'vibrant-jade': 'Vibrant jade',
  };
  return grade ? map[grade] : '—';
}
