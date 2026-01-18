// lib/db/spots.ts
import { supabase } from '@/lib/supabase';
import type { Spot } from '@/lib/types/spot';

// Utility: default to NYC when missing
const DEFAULT_CITY = 'New York';
const DEFAULT_COUNTRY = 'USA';

export async function saveSpot(spot: Spot): Promise<Spot> {
  // 1. Insert into spots
  const { data: spotRows, error: spotError } = await supabase
    .from('spots')
    .insert({
      user_id: spot.userId,
      name: spot.metadata.name,
      category: spot.metadata.category,
      city: spot.metadata.location.city || DEFAULT_CITY,
      country: spot.metadata.location.country || DEFAULT_COUNTRY,
      latitude: spot.metadata.location.lat ?? null,
      longitude: spot.metadata.location.lng ?? null,
      price_range: spot.metadata.priceRange ?? 2,
      visit_date: spot.metadata.visitDate,
      reflection: spot.reflection,
      auto_score: spot.autoScore,
      reasoning: spot.reasoning ?? null,
      image_url: spot.metadata.imageUrl ?? null,
    })
    .select('id, created_at')
    .single();

  if (spotError || !spotRows) {
    console.error('saveSpot: error inserting into spots', spotError);
    throw spotError ?? new Error('Could not insert spot');
  }

  // 2. Insert into posts (the feed item)
  const { error: postError } = await supabase.from('posts').insert({
    user_id: spot.userId,
    spot_id: spotRows.id,
    reflection: spot.reflection,
    auto_score: spot.autoScore,
    photos_count: spot.photosCount ?? 0,
  });

  if (postError) {
    console.error('saveSpot: error inserting into posts', postError);
    throw postError;
  }

  return {
    ...spot,
    id: spotRows.id,
    createdAt: spotRows.created_at ?? spot.createdAt,
  };
}
