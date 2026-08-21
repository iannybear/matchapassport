export type Coords = { latitude: number; longitude: number };

const cache = new Map<string, Coords | null>();

export async function geocode(city: string, branch?: string | null): Promise<Coords | null> {
  const query = [branch, city].filter(Boolean).join(', ');
  if (!query) return null;

  const key = query.toLowerCase();
  if (cache.has(key)) return cache.get(key)!;

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'en' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      cache.set(key, null);
      return null;
    }
    const coords: Coords = {
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon),
    };
    cache.set(key, coords);
    return coords;
  } catch {
    return null;
  }
}
