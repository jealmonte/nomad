// lib/mockFeed.ts
import { FeedSpot } from './types';

export const mockHomeFeed: FeedSpot[] = [
  {
    id: 1,
    name: 'Senso-Ji',
    location: 'Tokyo, Japan',
    image: require('../public/senso-ji-temple-tokyo.jpg'),
    aiScore: 9.2,
    distance: 'Recently visited',
    tags: ['temples', 'sunrise', 'hike'],
    matchReason: 'Your friend Sarah Chen logged this as a top temple experience.',
    compatibilityScore: 95,
  },
  {
    id: 2,
    name: 'Cafe de Flore',
    location: 'Paris, France',
    image: require('../public/cafe-de-flore-paris.jpg'),
    aiScore: 8.7,
    distance: 'Recently visited',
    tags: ['coffee', 'iconic', 'breakfast'],
    matchReason: 'Classic Parisian vibes. The hot chocolate is legendary but pricey. Perfect for people watching.',
    compatibilityScore: 88,
  },
  // add 3–5 more
];
