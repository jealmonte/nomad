import { decode, encode } from 'base-64';

// Polyfill btoa/atob for React Native
if (!global.btoa) { global.btoa = encode; }
if (!global.atob) { global.atob = decode; }

// --- Types based on your Supabase Schema ---
export type SupabaseSpot = {
  id: string;
  user_id: string;
  name: string;
  category: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  price_range: number;
  visit_date: string;
  reflection: string;
  auto_score: number;
  reasoning: string | null;
  created_at?: string;
};

export interface ItineraryActivity {
  time: string;
  spot: string;
  type: string;
  desc: string;
  duration: string;
  cost: string;
  aiScore: number;
  image?: any;
}

export interface ItineraryDay {
  day: number;
  title: string;
  activities: ItineraryActivity[];
}

// Helper: Safe Base64
const safeBase64 = (str: string) => {
  return btoa(unescape(encodeURIComponent(str)));
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const NYC_SPOTS = [
  { name: "The Cloisters", type: "museums", desc: "Medieval art in fort garden", duration: "3h", cost: "$$", baseScore: 9.1 },
  { name: "Green-Wood Cemetery", type: "nature", desc: "Historic cemetery park with views", duration: "2.5h", cost: "Free", baseScore: 8.7 },
  { name: "City Island", type: "food", desc: "Nautical village with seafood", duration: "4h", cost: "$$", baseScore: 8.5 },
  { name: "Governor's Island", type: "nature", desc: "Car-free island retreat", duration: "3h", cost: "$", baseScore: 8.9 },
  { name: "Brooklyn Bridge", type: "sightseeing", desc: "Iconic suspension bridge walk", duration: "2h", cost: "Free", baseScore: 9.3 },
  { name: "Statue of Liberty", type: "sightseeing", desc: "National monument symbol", duration: "4h", cost: "$$", baseScore: 9.4 },
  { name: "Arthur Avenue", type: "food", desc: "Real Little Italy in the Bronx", duration: "2.5h", cost: "$$", baseScore: 8.8 },
  { name: "Wave Hill", type: "nature", desc: "Botanical garden with Hudson views", duration: "2h", cost: "$", baseScore: 8.6 },
  { name: "Roosevelt Island Tramway", type: "sightseeing", desc: "Aerial tram with skyline views", duration: "1.5h", cost: "$", baseScore: 8.4 },
  { name: "Grand Central Terminal", type: "sightseeing", desc: "Beaux-Arts train station landmark", duration: "1.5h", cost: "Free", baseScore: 9.0 },
  { name: "Noguchi Museum", type: "museums", desc: "Sculptor's peaceful studio garden", duration: "2h", cost: "$$", baseScore: 8.3 },
  { name: "Queens Night Market", type: "food", desc: "Global street food festival", duration: "3h", cost: "$$", baseScore: 8.9 },
  { name: "Fort Tilden Beach", type: "nature", desc: "Secluded urban beach escape", duration: "3h", cost: "Free", baseScore: 8.2 },
  { name: "Ellis Island", type: "museums", desc: "Immigration history museum", duration: "3h", cost: "$$", baseScore: 9.2 },
  { name: "Brooklyn Grange Rooftop Farm", type: "nature", desc: "Urban farm with Manhattan views", duration: "1.5h", cost: "$", baseScore: 8.1 },
];


// Helper: CSV Generator
const arrayToCsv = (data: any[], columns: string[]) => {
  const header = columns.join(',') + '\n';
  const body = data.map(row => {
    return columns.map(col => {
      let value = row[col];
      if (Array.isArray(value)) value = value.join(';'); 
      if (typeof value === 'string' && value.includes(',')) return `"${value}"`;
      return value;
    }).join(',');
  }).join('\n');
  return header + body;
};

// Helper: Haversine Distance (Lat/Lon -> Km)
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c; 
}

// Helper: Map DB Row to AI Training Format
function mapSupabaseToAiFormat(rows: SupabaseSpot[]) {
  const CURRENT_LAT = 40.7580;
  const CURRENT_LON = -73.9855;

  return rows.map(row => {
    // Combine category + keywords from reflection for "tags"
    // We filter out common words to keep tags clean
    const reflectionKeywords = row.reflection
      .toLowerCase()
      .replace(/[.,]/g, '')
      .split(' ')
      .filter(w => w.length > 4); // basic filter
      
    const tags = [row.category, ...reflectionKeywords].slice(0, 5); // Take top 5 tags

    const dist = getDistanceFromLatLonInKm(CURRENT_LAT, CURRENT_LON, row.latitude, row.longitude);

    // AI Logic: If you rated it >= 7.5, you "liked" it (1), otherwise (0)
    const liked = row.auto_score >= 7.5 ? 1 : 0;

    return {
      id: row.id,
      name: row.name,
      location: `${row.city}, ${row.country}`,
      aiScore: row.auto_score, // Map auto_score -> aiScore
      distance: parseFloat(dist.toFixed(1)),
      tags: tags,
      liked: liked
    };
  });
}

const WOODWIDE_API_KEY = "sk_C8g5D7x9E5YR_TIVaMAC3jNKTMw122duFFF7Hl4syk8"; 
const BASE_URL = "https://beta.woodwide.ai";

export async function getLucky() {
  if (!WOODWIDE_API_KEY || !BASE_URL) {
    throw new Error('API key or base URL is not configured.');
  }

  // --- 1. HISTORY DATA (TRAINING) ---
  // Structured exactly like your Supabase Table
const mockDbHistory: SupabaseSpot[] = [
    { id: "1", user_id: "u1", name: "Arthur Avenue", category: "food", city: "Bronx", country: "USA", latitude: 40.8551, longitude: -73.8876, price_range: 2, visit_date: "2025-11-15", reflection: "Authentic Italian cannoli fresh markets", auto_score: 8.8, reasoning: null },
    { id: "2", user_id: "u1", name: "Dead Rabbit", category: "nightlife", city: "Manhattan", country: "USA", latitude: 40.7033, longitude: -74.0115, price_range: 3, visit_date: "2025-11-16", reflection: "Historic Irish pub craft cocktails cozy", auto_score: 8.6, reasoning: null },
    { id: "3", user_id: "u1", name: "The Cloisters", category: "museums", city: "Manhattan", country: "USA", latitude: 40.8649, longitude: -73.9318, price_range: 2, visit_date: "2025-11-17", reflection: "Peaceful medieval art stunning gardens", auto_score: 9.1, reasoning: null },
    { id: "4", user_id: "u1", name: "Ripley's Times Square", category: "entertainment", city: "Manhattan", country: "USA", latitude: 40.7580, longitude: -73.9855, price_range: 4, visit_date: "2025-11-18", reflection: "Tourist trap overpriced cheesy exhibits", auto_score: 6.3, reasoning: null },
    { id: "5", user_id: "u1", name: "Brooklyn Bridge", category: "sightseeing", city: "Brooklyn", country: "USA", latitude: 40.7061, longitude: -73.9969, price_range: 1, visit_date: "2025-11-19", reflection: "Iconic views sunrise beautiful walkway", auto_score: 9.3, reasoning: null },
];


  // --- 2. CANDIDATE DATA (INFERENCE) ---
  // New places structured like Supabase Table
const mockDbCandidates: SupabaseSpot[] = [
    { id: "101", user_id: "u1", name: "Governor's Island", category: "nature", city: "Manhattan", country: "USA", latitude: 40.6890, longitude: -74.0200, price_range: 1, visit_date: "", reflection: "peaceful biking carfree historic", auto_score: 8.9, reasoning: null },
    { id: "102", user_id: "u1", name: "Green-Wood Cemetery", category: "nature", city: "Brooklyn", country: "USA", latitude: 40.6565, longitude: -73.9947, price_range: 1, visit_date: "", reflection: "historic sculptures panoramic peaceful", auto_score: 8.7, reasoning: null },
    { id: "103", user_id: "u1", name: "Queens Night Market", category: "food", city: "Queens", country: "USA", latitude: 40.7460, longitude: -73.8467, price_range: 2, visit_date: "", reflection: "diverse vendors global flavors crowded", auto_score: 8.9, reasoning: null },
    { id: "104", user_id: "u1", name: "Noguchi Museum", category: "museums", city: "Queens", country: "USA", latitude: 40.7677, longitude: -73.9398, price_range: 2, visit_date: "", reflection: "tranquil sculptures garden minimalist", auto_score: 8.3, reasoning: null },
    { id: "105", user_id: "u1", name: "Statue of Liberty", category: "sightseeing", city: "Manhattan", country: "USA", latitude: 40.6892, longitude: -74.0445, price_range: 2, visit_date: "", reflection: "iconic monument ferry views historic", auto_score: 9.4, reasoning: null },
];


  // Convert to AI Format
  const historyFormatted = mapSupabaseToAiFormat(mockDbHistory);
  const candidatesFormatted = mapSupabaseToAiFormat(mockDbCandidates);

  // Duplicate training data for stability
  let trainingData: any[] = [];
  for (let i = 0; i < 5; i++) {
    trainingData = [...trainingData, ...historyFormatted];
  }

  const featureColumns = ['aiScore', 'distance', 'tags'];
  const trainingColumns = [...featureColumns, 'liked'];
  
  const trainingCsv = arrayToCsv(trainingData, trainingColumns);
  const inferenceCsv = arrayToCsv(candidatesFormatted, featureColumns);

  try {
    // ---------------------------------------------------------
    // 1. Upload Training Data
    // ---------------------------------------------------------
    const trainFormData = new FormData();
    trainFormData.append('file', {
      uri: `data:text/csv;base64,${safeBase64(trainingCsv)}`, 
      type: 'text/csv',
      name: 'train.csv',
    } as any);
    trainFormData.append('name', `nomad_training_${Date.now()}`);
    trainFormData.append('overwrite', 'true');

    console.log(`Uploading history data (${trainingData.length} rows)...`);
    const trainUploadResponse = await fetch(`${BASE_URL}/api/datasets`, { 
      method: 'POST', 
      headers: { 'Authorization': `Bearer ${WOODWIDE_API_KEY}`, 'Accept': 'application/json' }, 
      body: trainFormData 
    });
    
    if (!trainUploadResponse.ok) throw new Error(`Training upload failed: ${await trainUploadResponse.text()}`);
    const trainUploadResult = await trainUploadResponse.json();
    console.log("Training Data ID:", trainUploadResult.id);

    // ---------------------------------------------------------
    // 2. Start Training
    // ---------------------------------------------------------
    const modelName = `nomad_model_${Date.now()}`;
    const trainUrl = `${BASE_URL}/api/models/prediction/train?dataset_id=${trainUploadResult.id}`;

    console.log("Starting training...");
    
    const trainBody = [
        `model_name=${encodeURIComponent(modelName)}`,
        `label_column=liked`,
        `overwrite=true`
    ].join('&');

    const trainResponse = await fetch(trainUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WOODWIDE_API_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: trainBody,
    });

    if (!trainResponse.ok) throw new Error(`Training init failed: ${await trainResponse.text()}`);
    const trainResult = await trainResponse.json();
    const modelId = trainResult.id;

    // ---------------------------------------------------------
    // 3. Poll for Completion
    // ---------------------------------------------------------
    let trainingStatus = '';
    const timeout = 120000;
    const startTime = Date.now();
    
    console.log(`Polling model ${modelId}...`);
    while (Date.now() - startTime < timeout) {
      const statusResponse = await fetch(`${BASE_URL}/api/models/${modelId}`, { 
        headers: { 'Authorization': `Bearer ${WOODWIDE_API_KEY}` } 
      });
      if (!statusResponse.ok) throw new Error(`Polling failed: ${await statusResponse.text()}`);
      const statusResult = await statusResponse.json();
      trainingStatus = statusResult.training_status;
      
      console.log(`Status: ${trainingStatus}`);
      if (trainingStatus === 'COMPLETE') break;
      if (trainingStatus === 'FAILED') {
        const errorMsg = statusResult.error || statusResult.message || 'Unknown server error';
        throw new Error(`Model training failed: ${errorMsg}`);
      }
      await sleep(2000); 
    }

    if (trainingStatus !== 'COMPLETE') throw new Error('Model training timed out.');

    // ---------------------------------------------------------
    // 4. Upload Inference Data
    // ---------------------------------------------------------
    const inferFormData = new FormData();
    inferFormData.append('file', {
      uri: `data:text/csv;base64,${safeBase64(inferenceCsv)}`,
      type: 'text/csv',
      name: 'infer.csv',
    } as any);
    inferFormData.append('name', `nomad_inference_${Date.now()}`);
    inferFormData.append('overwrite', 'true');
    
    console.log("Uploading candidates data...");
    const inferUploadResponse = await fetch(`${BASE_URL}/api/datasets`, { 
      method: 'POST', 
      headers: { 'Authorization': `Bearer ${WOODWIDE_API_KEY}`, 'Accept': 'application/json' }, 
      body: inferFormData 
    });
    if (!inferUploadResponse.ok) throw new Error(`Inference upload failed: ${await inferUploadResponse.text()}`);
    const inferUploadResult = await inferUploadResponse.json();
    
    // ---------------------------------------------------------
    // 5. Run Inference
    // ---------------------------------------------------------
    console.log("Running inference...");
    const inferUrl = `${BASE_URL}/api/models/prediction/${modelId}/infer?dataset_id=${inferUploadResult.id}`;

    const inferResponse = await fetch(inferUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WOODWIDE_API_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: "", 
    });

    if (!inferResponse.ok) throw new Error(`Inference run failed: ${await inferResponse.text()}`);
    const rawInferResult = await inferResponse.json();

    console.log("🔍 Predictions:", JSON.stringify(rawInferResult, null, 2));

    // ---------------------------------------------------------
    // 6. Calculate Best Result
    // ---------------------------------------------------------
    const scoredSpots = candidatesFormatted.map((spot, index) => {
      let score = 0;
      if (rawInferResult.prediction_prob && rawInferResult.prediction_prob[String(index)] !== undefined) {
         score = rawInferResult.prediction_prob[String(index)];
      }
      return { ...spot, compatibilityScore: score };
    });
    
    scoredSpots.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    const bestSpot = scoredSpots[0];
    
    if (!bestSpot) throw new Error("No recommendations could be generated.");

    return { ...bestSpot, id: Math.random() }; 

  } catch (error: any) {
    console.error('Get Lucky Logic Error:', error);
    throw error;
  }
}

export async function generateItinerary(
  destination: string, 
  interests: string[], 
  days: number = 3
): Promise<ItineraryDay[]> {
  
  // 1. SIMULATE NETWORK DELAY (The "Thinking" Phase)
  await sleep(2500);

  // 2. FILTER & SCORE LOGIC (Simulating AI Personalization)
  // In a real app, this is where we'd send user_id to woodwide.ai 
  const scoredSpots = NYC_SPOTS.map(spot => {
    let score = spot.baseScore;
    
    // Boost score if it matches user interests
    if (interests.includes(spot.type)) {
      score += 0.5; 
    }
    
    // Add some "AI Variance" to make it feel personalized/dynamic
    const variance = (Math.random() * 0.4) - 0.2; 
    
    // Cap at 9.9
    let finalScore = Math.min(9.9, score + variance);
    
    return { ...spot, aiScore: Number(finalScore.toFixed(1)) };
  });

  // Sort by score to get the "best" fit
  scoredSpots.sort((a, b) => b.aiScore - a.aiScore);

  // 3. BUILD SCHEDULE
  const itinerary: ItineraryDay[] = [];
  let spotIndex = 0;

  const dayTitles = ["Hidden Gems & Culture", "Landmarks & History", "Outer Boroughs", "Waterfront Adventures", "Local Favorites"];
  const timeSlots = ["9:00 AM", "1:00 PM", "4:00 PM", "7:00 PM"];

  for (let i = 1; i <= days; i++) {
    const dayActivities: ItineraryActivity[] = [];
    
    // Pick 3-4 activities per day
    for (let j = 0; j < 3; j++) {
      if (spotIndex >= scoredSpots.length) spotIndex = 0; // Loop if running out
      
      const spot = scoredSpots[spotIndex];
      dayActivities.push({
        time: timeSlots[j],
        spot: spot.name,
        type: spot.type,
        desc: spot.desc,
        duration: spot.duration,
        cost: spot.cost,
        aiScore: spot.aiScore
      });
      
      spotIndex++;
    }

    itinerary.push({
      day: i,
      title: dayTitles[i-1] || `Day ${i} Adventure`,
      activities: dayActivities
    });
  }

  return itinerary;
}