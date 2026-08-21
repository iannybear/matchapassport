import { PGlite } from '@electric-sql/pglite';
import type { Stamp, StampInput, PricePerception, DrinkSize } from '@/types';

const db = new PGlite('idb://matcha-passport');

let ready: Promise<void> | null = null;

function ensureSchema(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      await db.exec(`
        CREATE TABLE IF NOT EXISTS stamps (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          brand text NOT NULL,
          drink text NOT NULL,
          type text NOT NULL,
          milk text NOT NULL,
          store_type text NOT NULL,
          amount numeric NOT NULL DEFAULT 0,
          currency text NOT NULL DEFAULT 'PHP',
          location text NOT NULL,
          rating numeric NOT NULL DEFAULT 3,
          tier text NOT NULL DEFAULT 'maybe',
          purchase_date text,
          branch text,
          powder_brand text,
          powder_name text,
          powder_grade text,
          powder_origin text,
          flavor_profiles text[],
          sweetness numeric NOT NULL DEFAULT 0,
          bitterness numeric NOT NULL DEFAULT 0,
          color text,
          price_perception text NOT NULL DEFAULT 'Fair Price',
          size text NOT NULL DEFAULT 'Regular',
          ambiance text[] NOT NULL DEFAULT '{}',
          is_treat boolean NOT NULL DEFAULT false,
          notes text,
          photo text,
          latitude double precision,
          longitude double precision,
          created_at timestamptz NOT NULL DEFAULT now()
        );
      `);
    })();
  }
  return ready;
}

export async function fetchStamps(): Promise<Stamp[]> {
  await ensureSchema();
  const result = await db.query<Stamp>(
    `SELECT * FROM stamps ORDER BY created_at DESC`,
  );
  return result.rows.map(normalize);
}

export async function insertStamp(input: StampInput): Promise<void> {
  await ensureSchema();
  await db.query(
    `INSERT INTO stamps (
      brand, drink, type, milk, store_type, amount, currency, location,
      rating, tier, purchase_date, branch, powder_brand, powder_name,
      powder_grade, powder_origin, flavor_profiles, sweetness, bitterness,
      color, price_perception, size, ambiance, is_treat, notes, photo, latitude, longitude
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28)`,
    [
      input.brand,
      input.drink,
      input.type,
      input.milk,
      input.store_type,
      input.amount,
      input.currency,
      input.location,
      input.rating,
      input.tier,
      input.purchase_date,
      input.branch,
      input.powder_brand,
      input.powder_name,
      input.powder_grade,
      input.powder_origin,
      input.flavor_profiles ?? [],
      input.sweetness,
      input.bitterness,
      input.color,
      input.price_perception,
      input.size,
      input.ambiance ?? [],
      input.is_treat,
      input.notes ?? null,
      input.photo ?? null,
      input.latitude ?? null,
      input.longitude ?? null,
    ],
  );
}

export async function updateStamp(id: string, input: StampInput): Promise<void> {
  await ensureSchema();
  await db.query(
    `UPDATE stamps SET
      brand=$2, drink=$3, type=$4, milk=$5, store_type=$6, amount=$7,
      currency=$8, location=$9, rating=$10, tier=$11, purchase_date=$12,
      branch=$13, powder_brand=$14, powder_name=$15, powder_grade=$16,
      powder_origin=$17, flavor_profiles=$18, sweetness=$19, bitterness=$20,
      color=$21, price_perception=$22, size=$23, ambiance=$24, is_treat=$25, notes=$26, photo=$27, latitude=$28, longitude=$29
    WHERE id=$1`,
    [
      id,
      input.brand,
      input.drink,
      input.type,
      input.milk,
      input.store_type,
      input.amount,
      input.currency,
      input.location,
      input.rating,
      input.tier,
      input.purchase_date,
      input.branch,
      input.powder_brand,
      input.powder_name,
      input.powder_grade,
      input.powder_origin,
      input.flavor_profiles ?? [],
      input.sweetness,
      input.bitterness,
      input.color,
      input.price_perception,
      input.size,
      input.ambiance ?? [],
      input.is_treat,
      input.notes ?? null,
      input.photo ?? null,
      input.latitude ?? null,
      input.longitude ?? null,
    ],
  );
}

export async function deleteStamp(id: string): Promise<void> {
  await ensureSchema();
  await db.query(`DELETE FROM stamps WHERE id=$1`, [id]);
}

function normalize(row: Stamp): Stamp {
  return {
    ...row,
    amount: Number(row.amount),
    rating: Number(row.rating),
    sweetness: Number(row.sweetness),
    bitterness: Number(row.bitterness),
    flavor_profiles: row.flavor_profiles ?? null,
    price_perception: (row.price_perception as PricePerception) ?? 'Fair Price',
    size: (row.size as DrinkSize) ?? 'Regular',
    ambiance: row.ambiance ?? [],
    photo: row.photo ?? null,
    latitude: row.latitude ?? null,
    longitude: row.longitude ?? null,
  };
}
