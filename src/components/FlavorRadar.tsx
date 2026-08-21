import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import type { Stamp, StampWithAnalytics } from '@/types';

type Axis = { key: string; label: string };

const AXES: Axis[] = [
  { key: 'sweetness', label: 'Sweetness' },
  { key: 'bitterness', label: 'Bitterness' },
  { key: 'rating', label: 'Rating' },
];

function toData(s: { sweetness: number; bitterness: number; rating: number }) {
  return AXES.map((a) => ({
    axis: a.label,
    value: a.key === 'rating' ? (s.rating / 5) * 100 : s[a.key as 'sweetness' | 'bitterness'],
  }));
}

export function StampFlavorRadar({ stamp }: { stamp: Stamp | StampWithAnalytics }) {
  const data = toData(stamp);
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="70%">
          <PolarGrid stroke="#c8c0a8" />
          <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10, fill: '#5a6b4a' }} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            dataKey="value"
            stroke="#5a8a4a"
            fill="#5a8a4a"
            fillOpacity={0.35}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AverageFlavorRadar({ stamps }: { stamps: StampWithAnalytics[] }) {
  const withData = stamps.filter((s) => s.sweetness > 0 || s.bitterness > 0);
  if (withData.length === 0) return null;

  const avg = {
    sweetness: Math.round(withData.reduce((sum, s) => sum + s.sweetness, 0) / withData.length),
    bitterness: Math.round(withData.reduce((sum, s) => sum + s.bitterness, 0) / withData.length),
    rating: withData.reduce((sum, s) => sum + s.rating, 0) / withData.length,
  };

  const data = toData(avg);
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="70%">
          <PolarGrid stroke="#c8c0a8" />
          <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11, fill: '#5a6b4a' }} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            dataKey="value"
            stroke="#4a7a3a"
            fill="#5a8a4a"
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
