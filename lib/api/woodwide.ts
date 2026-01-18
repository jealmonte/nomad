import { Spot, SpotMetadata, WoodwideTrainingData } from '@/lib/types/spot';

interface WoodwideScoreRequest {
  user_id: string;
  reflection: string;
  metadata: SpotMetadata;
  historical_spots: Spot[];
}

interface WoodwideScoreResponse {
  score: number;
  reasoning: string;
  confidence: number;
}

export class WoodwideClient {
  private apiKey: string;
  private baseUrl = 'https://api.woodwide.ai';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async scoreSpot(request: WoodwideScoreRequest): Promise<WoodwideScoreResponse> {
    console.log('🌲 Calling Woodwide API...');
    
    const trainingData = this.prepareTrainingData(request.historical_spots);
    console.log(`📊 Training data: ${trainingData.length} historical spots`);

    try {
      const response = await fetch(`${this.baseUrl}/predict`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          training_data: trainingData,
          prediction_input: {
            text: request.reflection,
            category: request.metadata.category,
            price_range: request.metadata.priceRange || 2,
            location: request.metadata.location.city,
          },
        }),
      });

      console.log(`📡 Woodwide response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Woodwide API error:', errorText);
        throw new Error(`Woodwide API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Woodwide response:', data);

      return {
        score: data.score || data.prediction || 5.0,
        reasoning: data.reasoning || data.explanation || 'Based on your past preferences',
        confidence: data.confidence || 0.5,
      };
    } catch (error) {
      console.error('❌ Woodwide API call failed:', error);
      // Fallback to simple scoring if Woodwide fails
      console.log('⚠️ Falling back to simple scoring');
      return this.fallbackScore(request.reflection);
    }
  }

  private prepareTrainingData(spots: Spot[]): WoodwideTrainingData[] {
    return spots.map(spot => ({
      features: {
        category: spot.metadata.category,
        priceRange: spot.metadata.priceRange || 2,
        sentimentKeywords: this.extractKeywords(spot.reflection),
        visitMonth: new Date(spot.metadata.visitDate).getMonth(),
      },
      label: spot.autoScore,
    }));
  }

  private extractKeywords(reflection: string): string[] {
    const positive = ['amazing', 'great', 'love', 'perfect', 'excellent', 'fantastic'];
    const negative = ['bad', 'terrible', 'awful', 'disappointing', 'poor', 'worst'];
    
    const lowerReflection = reflection.toLowerCase();
    const found: string[] = [];
    
    positive.forEach(word => {
      if (lowerReflection.includes(word)) found.push(`positive_${word}`);
    });
    negative.forEach(word => {
      if (lowerReflection.includes(word)) found.push(`negative_${word}`);
    });
    
    return found;
  }

  // Fallback scoring if API fails
  private fallbackScore(reflection: string): WoodwideScoreResponse {
    const text = reflection.toLowerCase();
    let score = 5.0;
    
    const positiveWords = ['amazing', 'great', 'love', 'perfect', 'excellent'];
    const negativeWords = ['bad', 'terrible', 'awful', 'disappointing'];
    
    positiveWords.forEach(word => {
      if (text.includes(word)) score += 0.8;
    });
    negativeWords.forEach(word => {
      if (text.includes(word)) score -= 1.2;
    });
    
    return {
      score: Math.max(0, Math.min(10, score)),
      reasoning: 'Score generated using fallback method (Woodwide unavailable)',
      confidence: 0.3,
    };
  }
}
