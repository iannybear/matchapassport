export type StampType = 'Matcha' | 'Hojicha';
export type Milk = 'Dairy' | 'Oat' | 'Coconut' | 'None';
export type StoreType =
  | 'Specialty Matcha Bar'
  | 'Specialty Cafe'
  | 'Kiosk'
  | 'Commercial Chain'
  | 'Restaurant'
  | 'Home Brew';
export type Tier = 'must-try' | 'repeat' | 'maybe' | 'pass';
export type ColorGrade =
  | 'brownish'
  | 'olive'
  | 'dull-green'
  | 'bright-green'
  | 'vibrant-jade';

export type PricePerception = 'Great Value' | 'Fair Price' | 'Overpriced';
export type DrinkSize = 'Small' | 'Regular' | 'Large';

export type Stamp = {
  id: string;
  brand: string;
  drink: string;
  type: StampType;
  milk: Milk;
  store_type: StoreType;
  amount: number;
  currency: string;
  location: string;
  rating: number;
  tier: Tier;
  purchase_date: string | null;
  branch: string | null;
  powder_brand: string | null;
  powder_name: string | null;
  powder_grade: string | null;
  powder_origin: string | null;
  flavor_profiles: string[] | null;
  sweetness: number;
  bitterness: number;
  color: ColorGrade | null;
  price_perception: PricePerception;
  size: DrinkSize;
  ambiance: string[];
  is_treat: boolean;
  notes: string | null;
  photo: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
};

export type StampInput = Omit<Stamp, 'id' | 'created_at'>;

export type Bracket = 'Free' | 'Budget' | 'Mid' | 'Premium';

export type StampWithAnalytics = Stamp & {
  bracket: Bracket;
  index: number;
};

export type Badge = {
  name: string;
  icon: string;
  desc: string;
  proof: string;
  earned: boolean;
};

export type Persona = {
  tag: string;
  desc: string;
};

export const PH_CITIES = [
  'Quezon City',
  'Manila',
  'Makati',
  'Taguig',
  'Pasig',
  'Mandaluyong',
  'Parañaque',
  'Muntinlupa',
  'Cebu City',
  'Iloilo City',
  'Davao City',
  'Baguio',
  'Cagayan de Oro',
  'Angeles City',
  'Other',
];

export const STORE_TYPES: StoreType[] = [
  'Specialty Matcha Bar',
  'Specialty Cafe',
  'Kiosk',
  'Commercial Chain',
  'Restaurant',
  'Home Brew',
];

export const MILKS: Milk[] = ['Dairy', 'Oat', 'Coconut', 'None'];

export const STAMP_TYPES: StampType[] = ['Matcha', 'Hojicha'];

export const FLAVOROR_PROFILES = [
  'umami',
  'nutty',
  'balanced',
  'grassy',
  'creamy',
  'seaweed',
  'bitter',
  'sweet',
  'earthy',
  'floral',
  'astringent',
  'roasty',
];

export const COLORS: { value: ColorGrade; label: string; hex: string }[] = [
  { value: 'brownish', label: 'Brownish', hex: '#8a8f6b' },
  { value: 'olive', label: 'Olive', hex: '#9ca864' },
  { value: 'dull-green', label: 'Dull green', hex: '#7ba05b' },
  { value: 'bright-green', label: 'Bright green', hex: '#5fa84e' },
  { value: 'vibrant-jade', label: 'Vibrant jade', hex: '#3fa53a' },
];

export const TIERS: { value: Tier; label: string; desc: string }[] = [
  { value: 'must-try', label: 'Must try', desc: 'A standout — go out of your way for it.' },
  { value: 'repeat', label: 'Would repeat', desc: 'Solid and worth ordering again.' },
  { value: 'maybe', label: 'Maybe', desc: 'Decent, but not something you would seek out.' },
  { value: 'pass', label: 'Pass', desc: 'Not worth it — skip next time.' },
];

export const PRICE_PERCEPTIONS: PricePerception[] = ['Great Value', 'Fair Price', 'Overpriced'];

export const DRINK_SIZES: DrinkSize[] = ['Small', 'Regular', 'Large'];

export const AMBIANCE_TAGS: string[] = [
  'Cozy',
  'Study-Friendly',
  'Minimalist',
  'Grab & Go',
  'Aesthetic',
];
