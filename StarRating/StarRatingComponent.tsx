import * as React from 'react';
import { 
  makeStyles
} from '@fluentui/react-components';

export interface IStarRatingProps {
  rating: number;
  maxStars?: number;
  containerWidth?: number;
  containerHeight?: number;
  readOnly?: boolean;
  onChange?: (rating: number) => void;
}

interface StarProps {
  filled: boolean;
  onPointerDown: () => void;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
  index: number;
  readOnly?: boolean;
  size: number;
}

const Star: React.FC<StarProps> = ({ filled, onPointerDown, onPointerEnter, onPointerLeave, index, readOnly, size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    onPointerDown={readOnly ? undefined : onPointerDown}
    onPointerEnter={readOnly ? undefined : onPointerEnter}
    onPointerLeave={readOnly ? undefined : onPointerLeave}
    style={{ cursor: readOnly ? 'default' : 'pointer', transition: 'transform 0.1s ease-in-out', flexShrink: 0, pointerEvents: 'auto' }}
    role={readOnly ? 'img' : 'button'}
    aria-label={readOnly ? `${index} star${index > 1 ? 's' : ''}` : `Rate ${index} star${index > 1 ? 's' : ''}`}
  >
    <path
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      fill={filled ? '#FFD700' : 'transparent'}
      stroke={filled ? '#FFD700' : '#e1e1e1'}
      strokeWidth="1"
      strokeLinejoin="round"
    />
  </svg>
);

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
});

const DEFAULT_STAR_SIZE = 24;
const DEFAULT_STAR_COUNT = 5;
const MIN_STAR_SIZE = 12;

export const StarRating: React.FC<IStarRatingProps> = ({ rating, maxStars, containerWidth, containerHeight, readOnly, onChange }) => {
  const styles = useStyles();
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);
  
  // Use PCF-provided dimensions directly
  const effectiveWidth = containerWidth && containerWidth > 0 ? containerWidth : 0;
  const effectiveHeight = containerHeight && containerHeight > 0 ? containerHeight : 0;
  const starCount = maxStars && maxStars > 0 ? maxStars : DEFAULT_STAR_COUNT;
  
  console.log('[StarRating] Using dimensions - width:', effectiveWidth, 'height:', effectiveHeight);
  
  // Calculate star size based on container dimensions
  const calculateStarSize = (): number => {
    if (!effectiveWidth && !effectiveHeight) {
      return DEFAULT_STAR_SIZE;
    }
    
    // Calculate max star size based on height (stars should fit vertically with some padding)
    const heightBasedSize = effectiveHeight ? effectiveHeight * 0.8 : Infinity;
    
    // Calculate max star size based on width (all stars should fit with gaps)
    // Use proportional gap that scales with star size (estimate first, then refine)
    const estimatedStarSize = effectiveWidth / (starCount + 1); // rough estimate
    const gapSize = Math.max(4, estimatedStarSize * 0.2);
    const totalGapWidth = (starCount - 1) * gapSize;
    const widthBasedSize = effectiveWidth ? (effectiveWidth - totalGapWidth) / starCount : Infinity;
    
    // Use the smaller of the two to ensure stars fit in both dimensions
    let starSize = Math.min(heightBasedSize, widthBasedSize);
    
    // Only apply minimum, no maximum - let it scale fully
    starSize = Math.max(MIN_STAR_SIZE, starSize);
    
    return Math.floor(starSize);
  };
  
  const starSize = calculateStarSize();
  const gap = Math.max(4, Math.floor(starSize * 0.2)); // Dynamic gap based on star size
  
  // Calculate vertical padding to center stars
  const paddingTop = effectiveHeight > 0 ? Math.max(0, (effectiveHeight - starSize) / 2) : 0;
  
  console.log('[StarRating] Calculated starSize:', starSize, 'gap:', gap, 'paddingTop:', paddingTop);
  
  // Clamp rating between 0 and maxStars
  const displayRating = Math.max(0, Math.min(starCount, rating ?? 0));
  const activeRating = hoverRating ?? displayRating;

  const handlePointerDown = (starIndex: number) => {
    if (onChange) {
      onChange(starIndex);
    }
  };

  const handlePointerEnter = (starIndex: number) => {
    setHoverRating(starIndex);
  };

  const handlePointerLeave = () => {
    setHoverRating(null);
  };

  const renderStars = () => {
    const stars: React.ReactNode[] = [];
    for (let i = 1; i <= starCount; i++) {
      const isFilled = i <= activeRating;
      stars.push(
        <Star
          key={i}
          index={i}
          filled={isFilled}
          onPointerDown={() => handlePointerDown(i)}
          onPointerEnter={() => handlePointerEnter(i)}
          onPointerLeave={handlePointerLeave}
          readOnly={readOnly}
          size={starSize}
        />
      );
    }
    return stars;
  };

  return (
    <div 
      className={styles.container} 
      style={{ 
        width: effectiveWidth > 0 ? effectiveWidth : '100%',
        height: effectiveHeight > 0 ? effectiveHeight : '100%',
        gap: `${gap}px`,
        paddingTop: `${paddingTop}px`,
        alignItems: 'flex-start',
        pointerEvents: 'auto'
      }}
    >
      {renderStars()}
    </div>
  );
};
