import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Image, Pressable, Text, View, type ImageSourcePropType } from 'react-native';

export type SpotCardProps = {
  user: {
    name: string;
    avatar?: ImageSourcePropType | string;
    handle: string;
  };
  spot: {
    name: string;
    location: string;
    image?: ImageSourcePropType | string;
    aiScore: number;
    tags: string[];
  };
  review: string;
  photos: number;
  timestamp: string;
};

export function SpotCard({ user, spot, review, photos, timestamp }: SpotCardProps) {
  const avatarSource =
    typeof user.avatar === 'string' ? { uri: user.avatar } : user.avatar;
  const imageSource =
    typeof spot.image === 'string' ? { uri: spot.image } : spot.image;

  return (
    <View className="bg-card border border-border rounded-xl overflow-hidden mb-4">
      <View className="flex-row items-center gap-3 p-3">
        {avatarSource ? (
          <Image source={avatarSource} className="h-10 w-10 rounded-full bg-muted" />
        ) : (
          <View className="h-10 w-10 rounded-full bg-muted items-center justify-center">
            <Text className="text-foreground font-semibold">{user.name[0]}</Text>
          </View>
        )}

        <View className="flex-1">
          <Text className="font-semibold text-sm text-foreground">{user.name}</Text>
          <Text className="text-xs text-muted-foreground">{timestamp}</Text>
        </View>

        <MaterialCommunityIcons name="bookmark-outline" size={20} color="#a6a6a6" />
      </View>

      <View className="relative">
        {imageSource ? (
          <Image source={imageSource} className="w-full h-48" resizeMode="cover" />
        ) : (
          <View className="w-full h-48 bg-muted" />
        )}
        <View className="absolute top-3 right-3 bg-background/90 rounded-full px-2.5 py-1 flex-row items-center gap-1">
          <Text className="text-primary font-bold text-sm">{spot.aiScore}</Text>
          <Text className="text-xs text-muted-foreground">AI</Text>
        </View>
      </View>

      <View className="p-3">
        <View className="mb-2">
          <Text className="font-semibold text-foreground">{spot.name}</Text>
          <Text className="text-sm text-muted-foreground">{spot.location}</Text>
        </View>

        <View className="flex-row flex-wrap gap-1.5 mb-3">
          {spot.tags.map((tag) => (
            <View key={tag} className="bg-secondary rounded-full px-2 py-0.5">
              <Text className="text-xs text-secondary-foreground">{tag}</Text>
            </View>
          ))}
        </View>

        <Text className="text-sm text-foreground/90 leading-relaxed mb-3">{review}</Text>

        <View className="flex-row items-center gap-4 pt-2 border-t border-border">
          <Pressable className="flex-row items-center gap-1.5">
            <MaterialCommunityIcons name="heart-outline" size={20} color="#a6a6a6" />
            <Text className="text-sm text-muted-foreground">Like</Text>
          </Pressable>
          <Pressable className="flex-row items-center gap-1.5">
            <MaterialCommunityIcons name="message-outline" size={20} color="#a6a6a6" />
            <Text className="text-sm text-muted-foreground">Comment</Text>
          </Pressable>
          {photos > 0 && (
            <Text className="text-xs text-muted-foreground ml-auto">+{photos} photos</Text>
          )}
        </View>
      </View>
    </View>
  );
}
