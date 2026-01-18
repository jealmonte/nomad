import { Image, Text, View, type ImageSourcePropType } from 'react-native';

export type RankedSpotCardProps = {
  rank: number;
  name: string;
  location: string;
  image?: ImageSourcePropType | string;
  aiScore: number;
  tag: string;
};

export function RankedSpotCard({ rank, name, location, image, aiScore, tag }: RankedSpotCardProps) {
  const imageSource = typeof image === 'string' ? { uri: image } : image;

  const rankStyle =
    rank === 1
      ? 'bg-yellow-500/20 text-yellow-500'
      : rank === 2
      ? 'bg-gray-400/20 text-gray-400'
      : rank === 3
      ? 'bg-orange-600/20 text-orange-600'
      : 'bg-muted text-muted-foreground';

  return (
    <View className="flex-row items-center gap-3 p-3 bg-card rounded-xl border border-border">
      <View className={`h-8 w-8 rounded-full items-center justify-center ${rankStyle}`}>
        <Text className="text-sm font-bold">{rank}</Text>
      </View>

      {imageSource ? (
        <Image source={imageSource} className="h-12 w-12 rounded-lg" resizeMode="cover" />
      ) : (
        <View className="h-12 w-12 rounded-lg bg-muted" />
      )}

      <View className="flex-1 min-w-0">
        <Text className="text-sm font-medium text-foreground" numberOfLines={1}>
          {name}
        </Text>
        <Text className="text-xs text-muted-foreground" numberOfLines={1}>
          {location}
        </Text>
      </View>

      <View className="items-end gap-1">
        <Text className="text-primary font-bold text-sm">{aiScore}</Text>
        <View className="bg-secondary rounded-full px-2 py-0.5">
          <Text className="text-xs text-secondary-foreground">{tag}</Text>
        </View>
      </View>
    </View>
  );
}
