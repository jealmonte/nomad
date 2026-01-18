// lib/types/spot.ts

export interface SpotMetadata {
  name: string;
  category: string;
  location: {
    city: string;
    country: string;
    lat?: number;   // used in lib/db/spots.ts
    lng?: number;   // used in lib/db/spots.ts
  };
  priceRange?: number;
  visitDate: string;
  imageUrl?: string;   // used in lib/db/spots.ts
}

export interface Spot {
  id: string;
  userId: string;
  metadata: SpotMetadata;
  reflection: string;
  autoScore: number;
  reasoning?: string;
  createdAt: string;
  photosCount?: number;  // used in lib/db/spots.ts
}

export interface WoodwideTrainingData {
  features: {
    category: string;
    priceRange: number;
    sentimentKeywords: string[];
    visitMonth: number;
  };
  label: number;
}
