import { Spot } from '@/lib/types/spot';

export interface SpotComparison {
  rank: number; // Where this spot ranks (1 = best)
  totalInCategory: number;
  percentile: number; // 0-100
  similarSpots: Spot[]; // Top 3 similar spots
}

export function compareSpotToHistory(
  newSpot: Spot,
  historicalSpots: Spot[]
): SpotComparison {
  // Filter to same category
  const sameCategory = historicalSpots.filter(
    s => s.metadata.category === newSpot.metadata.category
  );

  // Sort by score descending
  const sorted = [...sameCategory, newSpot].sort((a, b) => b.autoScore - a.autoScore);
  
  const rank = sorted.findIndex(s => s.id === newSpot.id) + 1;
  const percentile = ((sorted.length - rank) / sorted.length) * 100;

  // Find similar spots (same category, within 1.0 score difference)
  const similarSpots = sameCategory
    .filter(s => Math.abs(s.autoScore - newSpot.autoScore) <= 1.0)
    .sort((a, b) => b.autoScore - a.autoScore)
    .slice(0, 3);

  return {
    rank,
    totalInCategory: sameCategory.length,
    percentile: Math.round(percentile),
    similarSpots,
  };
}
