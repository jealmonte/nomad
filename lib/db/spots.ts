import { Spot } from '@/lib/types/spot';

// Mock database - just returns empty array for now
export async function getUserSpots(userId: string): Promise<Spot[]> {
  // TODO: Replace with actual database query (Supabase, Prisma, etc.)
  console.log(`Fetching spots for user: ${userId}`);
  
  // Return empty array - no historical data yet
  return [];
}

export async function saveSpot(spot: Spot): Promise<void> {
  // TODO: Replace with actual database insert
  console.log('Mock save - Spot data:', JSON.stringify(spot, null, 2));
  
}

