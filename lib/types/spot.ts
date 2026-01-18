export interface SpotMetadata {
  name: string;
  category: string;
  location: {
    city: string;
    country: string;
    lat?: number;
    lng?: number;
  };
  priceRange?: number;
  visitDate: string;
}

export interface Spot {
  id: string;
  userId: string;
  metadata: SpotMetadata;
  reflection: string;
  autoScore: number;
  reasoning?: string;
  createdAt: string;
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
