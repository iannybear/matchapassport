import { useState } from 'react';
import { Star } from 'lucide-react';

type Props = {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: number;
  allowHalf?: boolean;
  label?: string;
};

export default function StarRating({
  value,
  onChange,
  readOnly = false,
  size = 20,
  allowHalf = false,
  label,
}: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value;

  const handleClick = (star: number, isHalf: boolean) => {
    if (readOnly || !onChange) return;
    const v = allowHalf && isHalf ? star - 0.5 : star;
    onChange(v);
  };

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = display >= star;
        const half = allowHalf && !filled && display >= star - 0.5;
        return (
          <div key={star} className="relative">
            {allowHalf && !readOnly && (
              <button
                type="button"
                onClick={() => handleClick(star, true)}
                onMouseEnter={() => setHover(star - 0.5)}
                onMouseLeave={() => setHover(null)}
                className="absolute left-0 top-0 z-10 h-full w-1/2 cursor-pointer"
                aria-label={`${star - 0.5} stars${label ? ` ${label}` : ''}`}
                tabIndex={-1}
              />
            )}
            <button
              type="button"
              disabled={readOnly}
              onClick={() => handleClick(star, false)}
              onMouseEnter={() => !readOnly && setHover(star)}
              onMouseLeave={() => !readOnly && setHover(null)}
              className={`${readOnly ? 'cursor-default' : 'cursor-pointer'} transition-transform ${
                !readOnly ? 'hover:scale-110' : ''
              }`}
              aria-label={`${star} star${star > 1 ? 's' : ''}${label ? ` ${label}` : ''}`}
            >
              <Star
                size={size}
                strokeWidth={1.5}
                className={
                  filled
                    ? 'fill-clay-400 text-clay-400'
                    : half
                      ? 'fill-clay-400/50 text-clay-400'
                      : 'fill-none text-cream-400'
                }
              />
            </button>
          </div>
        );
      })}
    </div>
  );
}
