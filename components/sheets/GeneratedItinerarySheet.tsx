import { Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { Modal, View, Text, ScrollView, Image, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence, 
  Easing,
  FadeIn,
  FadeOut,
  cancelAnimation
} from 'react-native-reanimated';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { generateItinerary, ItineraryDay } from '@/services/woodwide';

const HEADER_IMAGE_URL = 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80';

interface GeneratedItinerarySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  destination: string;
  startDate: string;
  endDate: string;
  interests: string[];
  onSave: () => void;
}

const loadingSteps = [
  "Analyzing your travel history...",
  "Matching with your interests...",
  "Calculating compatibility scores...",
  "Finalizing your personalized plan..."
];

// --- 1. Thinking Animation ---
function ThinkingAnimation({ color }: { color: string }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.5);
  const iconY = useSharedValue(0);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.5, { duration: 1500, easing: Easing.out(Easing.ease) }), -1, false
    );
    opacity.value = withRepeat(
      withTiming(0, { duration: 1500, easing: Easing.out(Easing.ease) }), -1, false
    );
    iconY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.quad) })
      ), -1, true
    );
  }, []);

  const ringStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], opacity: opacity.value }));
  const ringStyleSmall = useAnimatedStyle(() => ({ transform: [{ scale: scale.value * 0.8 }], opacity: opacity.value }));
  const iconStyle = useAnimatedStyle(() => ({ transform: [{ translateY: iconY.value }] }));

  return (
    <View className="items-center justify-center h-32 w-32 mb-4">
      <Animated.View style={[ringStyle, { borderColor: color }]} className="absolute w-24 h-24 rounded-full border-4" />
      <Animated.View style={[ringStyleSmall, { borderColor: color }]} className="absolute w-24 h-24 rounded-full border-2 opacity-30" />
      <Animated.View style={iconStyle} className="w-20 h-20 bg-background rounded-full items-center justify-center shadow-lg z-10 border border-muted/20">
        <MaterialIcons name="auto-awesome" size={32} color={color} />
      </Animated.View>
    </View>
  );
}

// --- 2. Airplane Progress Bar ---
function AirplaneProgressBar({ progress, color, isComplete }: { progress: number, color: string, isComplete: boolean }) {
  const planeY = useSharedValue(0);
  const planeLeft = useSharedValue(0);

  // Handle the "Wobble" animation (Up and Down)
  useEffect(() => {
    if (isComplete) {
      // FREEZE: Stop the wobble and return to Y=0 (Vertical Center)
      cancelAnimation(planeY);
      planeY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) });
    } else {
      // WOBBLE: Bob up and down while loading
      planeY.value = withRepeat(
        withSequence(
          withTiming(-3, { duration: 800, easing: Easing.inOut(Easing.quad) }),
          withTiming(3, { duration: 800, easing: Easing.inOut(Easing.quad) })
        ), -1, true
      );
    }
  }, [isComplete]);

  // Handle the horizontal movement
  useEffect(() => {
    // Simply follow the progress value (0 -> 100)
    planeLeft.value = progress;
  }, [progress]);

  const planeStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: -12 }, // Offset X to center icon on the tip of the line
      { translateY: planeY.value }, 
      { rotate: '0deg' } 
    ],
    left: `${planeLeft.value}%`,
    top: '50%', // Center in container
    marginTop: -12 // Half of size (24/2) to perfectly center
  }));

  return (
    <View className="w-full h-12 justify-center mt-6">
      <View className="w-full h-1 bg-muted/30 rounded-full overflow-visible">
        <View 
            className="h-full rounded-l-full shadow-sm transition-colors duration-300" 
            style={{ width: `${progress}%`, backgroundColor: color, opacity: 0.8 }} 
        />
      </View>
      <Animated.View className="absolute" style={planeStyle}>
        <Ionicons name="airplane" size={24} color={color} />
      </Animated.View>
    </View>
  );
}

export function GeneratedItinerarySheet({ open, onOpenChange, destination, startDate, endDate, interests, onSave }: GeneratedItinerarySheetProps) {
  const theme = useColorScheme() ?? 'light';
  
  const [isGenerating, setIsGenerating] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [itineraryData, setItineraryData] = useState<ItineraryDay[]>([]);
  const [selectedDay, setSelectedDay] = useState(1);

  const isComplete = progress >= 100;
  const activeColor = isComplete ? '#22c55e' : Colors[theme].tint; 

  useEffect(() => {
    if (open) {
      setIsGenerating(true);
      setProgress(0);
      setCurrentStep(0);
      setItineraryData([]);
      Image.prefetch(HEADER_IMAGE_URL);

      const fetchData = async () => {
        try {
            const data = await generateItinerary(destination, interests, 3);
            setItineraryData(data);
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Failed to generate itinerary");
            onOpenChange(false);
        }
      };
      fetchData();

      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 0.8; 
          const stepIndex = Math.floor((newProgress / 100) * loadingSteps.length);
          setCurrentStep(Math.min(stepIndex, loadingSteps.length - 1));

          if (newProgress >= 100) {
            clearInterval(interval);
            setTimeout(() => setIsGenerating(false), 1500); 
            return 100;
          }
          return newProgress;
        });
      }, 30);

      return () => clearInterval(interval);
    }
  }, [open]);

  const currentDayData = itineraryData.find(d => d.day === selectedDay);

  return (
    <Modal visible={open} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-background">
        
        <Pressable 
            onPress={() => onOpenChange(false)} 
            className="absolute top-4 right-4 z-50 w-9 h-9 bg-black/30 rounded-full items-center justify-center"
        >
            <Feather name="x" size={20} color="#fff" />
        </Pressable>

        {isGenerating ? (
          <Animated.View entering={FadeIn} exiting={FadeOut} className="flex-1 items-center justify-center px-8">
            <ThinkingAnimation color={activeColor} />
            
            <Text className="text-2xl font-bold text-center mt-4 mb-2 text-foreground">
                {isComplete ? "Trip Ready!" : "Creating Your Trip"}
            </Text>
            <Text className="text-muted-foreground mb-4 text-center text-lg">To {destination || "Destination"}</Text>
            
            <View className="w-full max-w-sm">
                <AirplaneProgressBar progress={progress} color={activeColor} isComplete={isComplete} />
            </View>
            
            <Animated.Text key={currentStep} entering={FadeIn.duration(300)} className="text-sm font-medium text-primary text-center mt-4 h-6">
              {isComplete ? "Finalizing details..." : loadingSteps[currentStep]}
            </Animated.Text>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn.duration(500)} className="flex-1">
            {/* Header */}
            <View className="h-48 relative bg-muted">
              <Image source={{ uri: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf' }} className="w-full h-full" resizeMode="cover" />
              <View className="absolute inset-0 bg-black/40 p-6 justify-end">
                <View className="flex-row items-center gap-2 mb-1">
                    <MaterialIcons name="auto-awesome" size={16} color="#33d6b3" />
                    <Text className="text-white/90 text-xs font-bold uppercase tracking-wider">AI Generated</Text>
                </View>
                <Text className="text-3xl font-bold text-white mb-1">{destination || "Tokyo"}</Text>
                <Text className="text-white/90 text-sm">{startDate ? `${startDate} - ${endDate}` : "3 Days • $1,200 Est."}</Text>
              </View>
            </View>

            {/* Day Selector */}
            <View className="py-4 border-b border-border bg-background z-10">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
                    {itineraryData.map(day => (
                        <Pressable 
                            key={day.day}
                            onPress={() => setSelectedDay(day.day)}
                            className={`px-5 py-2 rounded-full border ${selectedDay === day.day ? 'bg-primary border-primary' : 'bg-transparent border-border'}`}
                        >
                            <Text className={`text-sm ${selectedDay === day.day ? 'text-primary-foreground font-semibold' : 'text-muted-foreground'}`}>
                                Day {day.day}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>

            {/* Content */}
            <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40 }}>
                <Text className="text-xl font-bold text-foreground mb-6">{currentDayData?.title}</Text>
                
                <View className="gap-6">
                    {currentDayData?.activities.map((item, index) => (
                        <View key={index} className="flex-row">
                            {/* Time & Score Column */}
                            <View className="items-center w-16 mr-3 pt-1">
                                <Text className="text-xs font-bold text-muted-foreground mb-1">{item.time}</Text>
                                <View className="bg-green-100 dark:bg-green-900 px-1.5 py-0.5 rounded mb-2">
                                    <Text className="text-[10px] font-bold text-green-700 dark:text-green-300">
                                        {item.aiScore}
                                    </Text>
                                </View>
                                <View className="w-[2px] flex-1 bg-border/60 rounded-full" />
                            </View>

                            {/* Card */}
                            <View className="flex-1 bg-card p-4 rounded-2xl border border-border/60 shadow-sm mb-2">
                                <View className="flex-row justify-between items-start mb-2">
                                    <Text className="font-bold text-base text-foreground flex-1 mr-2">{item.spot}</Text>
                                    <View className="bg-muted px-2 py-1 rounded-md">
                                        <Text className="text-[10px] text-muted-foreground font-bold uppercase">{item.type}</Text>
                                    </View>
                                </View>
                                <Text className="text-muted-foreground text-sm mb-4 leading-relaxed">{item.desc}</Text>
                                <View className="flex-row gap-4 border-t border-border/40 pt-3">
                                    <View className="flex-row items-center gap-1.5">
                                        <Feather name="clock" size={14} color={Colors[theme].icon} />
                                        <Text className="text-xs text-muted-foreground font-medium">{item.duration}</Text>
                                    </View>
                                    <View className="flex-row items-center gap-1.5">
                                        <Feather name="dollar-sign" size={14} color={Colors[theme].icon} />
                                        <Text className="text-xs text-muted-foreground font-medium">{item.cost}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Footer */}
            <SafeAreaView edges={['bottom']} className="px-4 py-4 border-t border-border bg-background shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <Pressable onPress={onSave} className="w-full bg-primary h-14 rounded-2xl items-center justify-center flex-row gap-2 active:opacity-90">
                    <Feather name="check" size={20} color="#fff" />
                    <Text className="text-white font-bold text-base">Save to Trips</Text>
                </Pressable>
            </SafeAreaView>
          </Animated.View>
        )}
      </View>
    </Modal>
  );
}