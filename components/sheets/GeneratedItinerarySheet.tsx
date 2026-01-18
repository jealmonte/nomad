import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { Modal, View, Text, ScrollView, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence, 
  Easing,
  FadeIn,
  FadeOut
} from 'react-native-reanimated';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface GeneratedItinerarySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  destination: string;
  startDate: string;
  endDate: string;
  interests: string[];
  onSave: () => void; // <--- ADDED THIS PROP
}

const generatedItinerary = [
  {
    day: 1,
    title: "Arrival & Culture",
    activities: [
      { time: "10:00 AM", spot: "Senso-ji Temple", type: "temples", desc: "Ancient Buddhist temple", duration: "2h", cost: "Free" },
      { time: "1:00 PM", spot: "Nakamise St.", type: "shopping", desc: "Shopping street", duration: "1.5h", cost: "$$" },
      { time: "7:00 PM", spot: "Izakaya Dinner", type: "food", desc: "Local pub food", duration: "2h", cost: "$$" },
    ]
  },
  {
    day: 2,
    title: "Modern Vibes",
    activities: [
      { time: "11:00 AM", spot: "TeamLab Planets", type: "art", desc: "Digital art museum", duration: "3h", cost: "$$$" },
      { time: "3:00 PM", spot: "Shibuya Crossing", type: "sightseeing", desc: "Famous crossing", duration: "1h", cost: "Free" },
    ]
  },
  {
    day: 3,
    title: "Nature & Chill",
    activities: [
      { time: "10:00 AM", spot: "Yoyogi Park", type: "nature", desc: "Large city park", duration: "2h", cost: "Free" },
      { time: "1:00 PM", spot: "Harajuku", type: "shopping", desc: "Youth fashion", duration: "3h", cost: "$$" },
    ]
  }
];

const loadingSteps = [
  "Analyzing your interests...",
  "Finding top-rated spots...",
  "Optimizing travel routes...",
  "Finalizing your itinerary..."
];

// --- 1. Cool Animation Component ---
function ThinkingAnimation({ color }: { color: string }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.5);
  const iconY = useSharedValue(0);

  useEffect(() => {
    // Pulse Effect (Ring)
    scale.value = withRepeat(
      withTiming(1.5, { duration: 1500, easing: Easing.out(Easing.ease) }),
      -1,
      false
    );
    opacity.value = withRepeat(
      withTiming(0, { duration: 1500, easing: Easing.out(Easing.ease) }),
      -1,
      false
    );

    // Floating Icon Effect
    iconY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );
  }, []);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: iconY.value }],
  }));

  return (
    <View className="items-center justify-center h-40 w-40">
      {/* Pulsing Ring 1 */}
      <Animated.View 
        style={[ringStyle, { borderColor: color }]} 
        className="absolute w-24 h-24 rounded-full border-4" 
      />
       {/* Pulsing Ring 2 (Delayed) */}
       <Animated.View 
        style={[ringStyle, { borderColor: color, transform: [{scale: scale.value * 0.8}] }]} 
        className="absolute w-24 h-24 rounded-full border-2 opacity-30" 
      />
      
      {/* Floating Icon */}
      <Animated.View style={iconStyle} className="w-20 h-20 bg-background rounded-full items-center justify-center shadow-lg z-10">
        <MaterialIcons name="auto-awesome" size={40} color={color} />
      </Animated.View>
    </View>
  );
}

export function GeneratedItinerarySheet({ open, onOpenChange, destination, startDate, endDate, interests, onSave }: GeneratedItinerarySheetProps) {
  const theme = useColorScheme() ?? 'light';
  const [isGenerating, setIsGenerating] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDay, setSelectedDay] = useState(1);

  // --- Animation Logic ---
  useEffect(() => {
    if (open) {
      setIsGenerating(true);
      setProgress(0);
      setCurrentStep(0);

      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 1; // Slower progress to enjoy animation
          const stepIndex = Math.floor((newProgress / 100) * loadingSteps.length);
          setCurrentStep(Math.min(stepIndex, loadingSteps.length - 1));

          if (newProgress >= 100) {
            clearInterval(interval);
            setTimeout(() => setIsGenerating(false), 800);
            return 100;
          }
          return newProgress;
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [open]);

  const currentDayData = generatedItinerary.find(d => d.day === selectedDay);

  return (
    <Modal visible={open} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-background">
        
        {/* Close Button */}
        <Pressable 
            onPress={() => onOpenChange(false)} 
            className="absolute top-4 right-4 z-50 w-9 h-9 bg-black/30 rounded-full items-center justify-center"
        >
            <Feather name="x" size={20} color="#fff" />
        </Pressable>

        {isGenerating ? (
          // --- LOADING VIEW ---
          <Animated.View 
            entering={FadeIn} 
            exiting={FadeOut}
            className="flex-1 items-center justify-center px-8"
          >
            {/* 2. Use the new Animation */}
            <ThinkingAnimation color={Colors[theme].tint} />
            
            <Text className="text-2xl font-bold text-center mt-8 mb-2 text-foreground">Creating Your Trip</Text>
            <Text className="text-muted-foreground mb-10 text-center text-lg">To {destination || "Destination"}</Text>
            
            {/* Progress Bar */}
            <View className="w-full max-w-xs h-2 bg-muted rounded-full overflow-hidden mb-4">
              <View style={{ width: `${progress}%` }} className="h-full bg-primary" />
            </View>
            
            {/* Changing Text */}
            <Animated.Text 
                key={currentStep} // Key change triggers animation
                entering={FadeIn.duration(300)} 
                className="text-sm font-medium text-primary text-center h-6"
            >
              {loadingSteps[currentStep]}
            </Animated.Text>
          </Animated.View>
        ) : (
          // --- RESULT VIEW ---
          <Animated.View entering={FadeIn.duration(500)} className="flex-1">
            {/* Header Image Area */}
            <View className="h-48 relative">
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf' }} 
                className="w-full h-full"
                resizeMode="cover"
              />
              <View className="absolute inset-0 bg-black/40 p-6 justify-end">
                <View className="flex-row items-center gap-2 mb-1">
                    <MaterialIcons name="auto-awesome" size={16} color="#33d6b3" />
                    <Text className="text-white/90 text-xs font-bold uppercase tracking-wider">AI Generated</Text>
                </View>
                <Text className="text-3xl font-bold text-white mb-1">{destination || "Tokyo"}</Text>
                <Text className="text-white/90 text-sm">{startDate ? `${startDate} - ${endDate}` : "5 Days • $1,200 Est."}</Text>
              </View>
            </View>

            {/* Day Selector */}
            <View className="py-4 border-b border-border bg-background z-10">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
                    {generatedItinerary.map(day => (
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

            {/* Itinerary Content */}
            <ScrollView 
                className="flex-1" 
                contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40 }}
            >
                <Text className="text-xl font-bold text-foreground mb-6">{currentDayData?.title}</Text>
                
                <View className="gap-6">
                    {currentDayData?.activities.map((item, index) => (
                        <View key={index} className="flex-row">
                            {/* Time Column */}
                            <View className="items-center w-16 mr-3 pt-1">
                                <Text className="text-xs font-bold text-muted-foreground mb-2">{item.time}</Text>
                                {/* Timeline line */}
                                <View className="w-[2px] flex-1 bg-border/60 rounded-full" />
                            </View>

                            {/* Card - Bigger & Better */}
                            <View className="flex-1 bg-card p-4 rounded-2xl border border-border/60 shadow-sm mb-2">
                                <View className="flex-row justify-between items-start mb-2">
                                    <Text className="font-bold text-base text-foreground flex-1 mr-2">{item.spot}</Text>
                                    <View className="bg-muted px-2 py-1 rounded-md">
                                        <Text className="text-[10px] text-muted-foreground font-bold uppercase">{item.type}</Text>
                                    </View>
                                </View>
                                
                                <Text className="text-muted-foreground text-sm mb-4 leading-relaxed">
                                    {item.desc}
                                </Text>
                                
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

            {/* Footer Actions */}
            <SafeAreaView edges={['bottom']} className="px-4 py-4 border-t border-border bg-background shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <Pressable 
                    onPress={onSave} // <--- UPDATED TO CALL onSave
                    className="w-full bg-primary h-14 rounded-2xl items-center justify-center flex-row gap-2 active:opacity-90"
                >
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