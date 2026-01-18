// lib/types.ts
export type FeedSpot = {
    id: number;
    name: string;
    location: string;
    image?: any; // require('...') or { uri: string }
    aiScore: number;
    distance: string | number;
    tags: string[];
    matchReason?: string;
    compatibilityScore?: number;
  };
  