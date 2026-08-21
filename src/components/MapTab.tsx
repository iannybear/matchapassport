import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import type { StampWithAnalytics } from '@/types';

type Props = {
  stamps: StampWithAnalytics[];
};

const greenIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:28px;height:28px;border-radius:50% 50% 50% 0;
    background:#5a8a4a;border:2px solid #fff;
    box-shadow:0 2px 6px rgba(0,0,0,.3);
    transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;
  "><span style="transform:rotate(45deg);font-size:12px;">🍵</span></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

export default function MapTab({ stamps }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const geoStamps = stamps.filter(
    (s) => s.latitude != null && s.longitude != null,
  ) as (StampWithAnalytics & { latitude: number; longitude: number })[];

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.querySelectorAll('.leaflet-popup-content').forEach((el) => {
        (el as HTMLElement).style.margin = '8px 12px';
      });
    }
  }, [stamps]);

  if (geoStamps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-cream-400 bg-cream-50 py-20 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-matcha-100 text-matcha-600">
          <MapPin size={28} />
        </span>
        <h3 className="mt-4 font-display text-xl font-semibold text-ink-800">
          No pins yet
        </h3>
        <p className="mt-1 max-w-xs text-sm text-matcha-600">
          Add or edit stamps with a city to see them plotted on the map. New saves
          will auto-locate coordinates.
        </p>
      </div>
    );
  }

  const lats = geoStamps.map((s) => s.latitude);
  const lons = geoStamps.map((s) => s.longitude);
  const center: [number, number] = [
    lats.reduce((a, b) => a + b, 0) / lats.length,
    lons.reduce((a, b) => a + b, 0) / lons.length,
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MapPin size={18} className="text-matcha-600" />
        <h3 className="font-display text-lg font-semibold text-ink-800">
          Your matcha map · {geoStamps.length} pin{geoStamps.length === 1 ? '' : 's'}
        </h3>
      </div>
      <div
        ref={containerRef}
        className="overflow-hidden rounded-3xl border border-cream-300 shadow-card"
        style={{ height: '500px' }}
      >
        <MapContainer
          center={center}
          zoom={6}
          scrollWheelZoom
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {geoStamps.map((s) => (
            <Marker
              key={s.id}
              position={[s.latitude, s.longitude]}
              icon={greenIcon}
            >
              <Popup>
                <div style={{ minWidth: 160 }}>
                  <p style={{ fontWeight: 700, fontSize: 13, margin: 0 }}>
                    {s.brand}
                  </p>
                  <p style={{ fontSize: 12, margin: '2px 0', color: '#5a6b4a' }}>
                    {s.drink}
                  </p>
                  <p style={{ fontSize: 12, margin: '2px 0' }}>
                    {s.rating.toFixed(1)} ★
                  </p>
                  {s.location && (
                    <p style={{ fontSize: 11, margin: '2px 0', color: '#888' }}>
                      {s.location}
                      {s.branch ? ` · ${s.branch}` : ''}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
