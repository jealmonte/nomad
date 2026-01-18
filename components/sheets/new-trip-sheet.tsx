import { Feather, MaterialIcons } from '@expo/vector-icons';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, Text, View, Modal, StyleSheet, Alert } from 'react-native';
import { format, isAfter } from 'date-fns';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SimpleCalendar } from '@/components/ui/simple-calendar';
import { GeneratedItinerarySheet } from './GeneratedItinerarySheet'; // Ensure exact file name match

type NewTripSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const interests = ['temples', 'food', 'nightlife', 'nature', 'museums', 'beaches', 'shopping', 'art'];

export function NewTripSheet({ open, onOpenChange }: NewTripSheetProps) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['85%'], []);
  const theme = useColorScheme() ?? 'light';

  // --- Form State ---
  const [destination, setDestination] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // --- UI State ---
  const [showCalendar, setShowCalendar] = useState(false);
  const [activeDateMode, setActiveDateMode] = useState<'start' | 'end'>('start');
  
  // 2. STATE FOR THE RESULT SHEET
  const [showGeneratedItinerary, setShowGeneratedItinerary] = useState(false);

  // Helper to reset all fields
  const resetForm = () => {
    setDestination('');
    setSelectedInterests([]);
    setStartDate(null);
    setEndDate(null);
  };

  useEffect(() => {
    if (open) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
      const timer = setTimeout(() => {
        resetForm();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const openCalendar = (mode: 'start' | 'end') => {
    setActiveDateMode(mode);
    setShowCalendar(true);
  };

  const handleDateSelect = (date: Date) => {
    if (activeDateMode === 'start') {
      setStartDate(date);
      if (endDate && isAfter(date, endDate)) {
        setEndDate(null);
      }
      setActiveDateMode('end');
    } else {
      if (startDate && isAfter(startDate, date)) {
        setStartDate(date);
        setEndDate(null);
      } else {
        setEndDate(date);
      }
    }
  };

  // 3. HANDLE GENERATE BUTTON CLICK
  const handleGenerateClick = () => {
    if (!destination || !startDate || !endDate) {
        Alert.alert("Missing Info", "Please select a destination and dates first.");
        return;
    }
    setShowGeneratedItinerary(true);
  };

  // 4. HANDLE SAVE (Close everything)
  const handleSaveTrip = () => {
    // Close the generated itinerary modal
    setShowGeneratedItinerary(false);
    
    // Close the New Trip Sheet (the parent bottom sheet)
    onOpenChange(false);
    
    // Optional: Reset form immediately
    resetForm();
  };

  return (
    <>
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        onDismiss={() => onOpenChange(false)}
        backgroundStyle={{ backgroundColor: Colors[theme].background }}
        handleIndicatorStyle={{ backgroundColor: Colors[theme].icon }}
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />
        )}>
        <BottomSheetScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-semibold text-foreground">Plan a New Trip</Text>
            <Pressable
              onPress={() => onOpenChange(false)}
              className="h-9 w-9 items-center justify-center rounded-full bg-secondary">
              <Feather name="x" size={18} color={Colors[theme].text} />
            </Pressable>
          </View>

          {/* Destination Input */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-foreground mb-2">Where to?</Text>
            <View className="justify-center">
              <Feather
                name="map-pin"
                size={16}
                color={Colors[theme].icon}
                style={{ 
                  position: 'absolute', 
                  left: 12, 
                  top: '50%', 
                  marginTop: -8, 
                  zIndex: 10 
                }}
              />
              <BottomSheetTextInput
                value={destination}
                onChangeText={setDestination}
                placeholder="Enter destination"
                placeholderTextColor={Colors[theme].icon}
                className="bg-muted rounded-xl pl-9 pr-4 py-3 text-foreground"
              />
            </View>
          </View>

          {/* Date Inputs */}
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1">
              <Text className="text-sm font-medium text-foreground mb-2">Start Date</Text>
              <Pressable onPress={() => openCalendar('start')}>
                <View className="bg-muted rounded-xl pl-9 pr-4 py-3 justify-center h-[50px]">
                  <Feather
                    name="calendar"
                    size={16}
                    color={Colors[theme].icon}
                    style={{ position: 'absolute', left: 12 }}
                  />
                  <Text style={{ color: startDate ? Colors[theme].text : Colors[theme].icon }}>
                    {startDate ? format(startDate, 'yyyy-MM-dd') : 'Select Date'}
                  </Text>
                </View>
              </Pressable>
            </View>

            <View className="flex-1">
              <Text className="text-sm font-medium text-foreground mb-2">End Date</Text>
              <Pressable onPress={() => openCalendar('end')}>
                <View className="bg-muted rounded-xl pl-9 pr-4 py-3 justify-center h-[50px]">
                  <Feather
                    name="calendar"
                    size={16}
                    color={Colors[theme].icon}
                    style={{ position: 'absolute', left: 12 }}
                  />
                  <Text style={{ color: endDate ? Colors[theme].text : Colors[theme].icon }}>
                    {endDate ? format(endDate, 'yyyy-MM-dd') : 'Select Date'}
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>

          {/* Interests */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-foreground mb-2">What are you interested in?</Text>
            <View className="flex-row flex-wrap gap-2">
              {interests.map((interest) => {
                const active = selectedInterests.includes(interest);
                return (
                  <Pressable
                    key={interest}
                    onPress={() => toggleInterest(interest)}
                    className={`rounded-full px-3 py-1.5 ${active ? 'bg-primary' : 'bg-secondary'}`}>
                    <Text className={active ? 'text-primary-foreground text-xs' : 'text-secondary-foreground text-xs'}>
                      {interest}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* AI Banner */}
          <View className="bg-primary/10 rounded-xl p-4 flex-row items-start gap-3">
            <MaterialIcons name="auto-awesome" size={18} color={Colors[theme].tint} />
            <View className="flex-1">
              <Text className="text-sm font-medium text-foreground">AI-Powered Itinerary</Text>
              <Text className="text-xs text-muted-foreground mt-1">
                We’ll create a day-by-day itinerary based on your interests.
              </Text>
            </View>
          </View>

          {/* Generate Button */}
          <Pressable 
            onPress={handleGenerateClick}
            className="mt-6 h-12 rounded-xl bg-primary items-center justify-center flex-row"
          >
            <MaterialIcons name="auto-awesome" size={18} color="#0f1116" />
            <Text className="ml-2 text-primary-foreground font-semibold">Generate Itinerary</Text>
          </Pressable>
        </BottomSheetScrollView>
      </BottomSheetModal>

      {/* Calendar Modal */}
      <Modal
        visible={showCalendar}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCalendar(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setShowCalendar(false)}
        >
          <Pressable style={styles.calendarContainer} onPress={(e) => e.stopPropagation()}>
            <SimpleCalendar 
                startDate={startDate}
                endDate={endDate}
                onDateSelect={handleDateSelect}
                onDone={() => setShowCalendar(false)}
            />
          </Pressable>
        </Pressable>
      </Modal>

      {/* Generated Itinerary Sheet - Now with onSave handler */}
      <GeneratedItinerarySheet 
        open={showGeneratedItinerary}
        onOpenChange={setShowGeneratedItinerary}
        destination={destination}
        startDate={startDate ? format(startDate, 'MMM d') : ''}
        endDate={endDate ? format(endDate, 'MMM d') : ''}
        interests={selectedInterests}
        onSave={handleSaveTrip}
      />
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  calendarContainer: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: "#000",
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  }
});