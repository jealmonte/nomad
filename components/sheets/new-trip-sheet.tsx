"use client"

import { useState, useEffect } from "react"
import { View, Text, Modal, StyleSheet, TouchableOpacity, TextInput, ScrollView, Pressable, Keyboard, TouchableWithoutFeedback, Alert } from "react-native"
import { X, MapPin, Calendar, Sparkles, Search } from "lucide-react-native"
import { SimpleCalendar } from "@/components/ui/simple-calendar"
import { format, isAfter } from "date-fns"

interface NewTripSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const initialInterests = ["temples", "food", "nightlife", "nature", "museums", "beaches", "shopping", "art"].map((interest) => ({ name: interest, selected: false }))

export function NewTripSheet({ open, onOpenChange }: NewTripSheetProps) {
  const [destination, setDestination] = useState("")
  const [interests, setInterests] = useState(initialInterests)
  const [newInterest, setNewInterest] = useState("")
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [showCalendar, setShowCalendar] = useState(false)
  const [datePickerFor, setDatePickerFor] = useState<'start' | 'end' | null>(null)

  const clearFields = () => {
    setDestination("")
    setStartDate(null)
    setEndDate(null)
    setInterests(initialInterests)
  }

  useEffect(() => {
    if (!open) {
      setTimeout(clearFields, 300);
    }
  }, [open]);

  const handleClose = () => {
    onOpenChange(false);
  }

  const toggleInterest = (interestName: string) => {
    setInterests((prev) =>
      prev.map((interest) =>
        interest.name === interestName ? { ...interest, selected: !interest.selected } : interest
      )
    )
  }

  const addInterest = () => {
    if (newInterest.trim() !== "" && !interests.find((interest) => interest.name === newInterest.trim())) {
      setInterests((prev) => [...prev, { name: newInterest.trim(), selected: true }])
      setNewInterest("")
    }
  }

  const removeInterest = (interestToRemove: string) => {
    setInterests((prev) => prev.filter((interest) => interest.name !== interestToRemove))
  }

  const handleDateSelect = (date: Date) => {
    if (datePickerFor === 'start') {
      setStartDate(date)
      if (endDate && isAfter(date, endDate)) {
        setEndDate(null);
      }
      setDatePickerFor('end'); // automatically switch to end date selection
    } else if (datePickerFor === 'end') {
      if (startDate && isAfter(date, startDate)) {
        setEndDate(date)
        setDatePickerFor(null)
      } else {
        Alert.alert("Invalid Date", "End date must be after the start date.");
      }
    }
  }

  const openCalendar = (picker: 'start' | 'end') => {
    setDatePickerFor(picker)
    setShowCalendar(true)
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={open}
      onRequestClose={handleClose}
    >
      <Pressable style={styles.modalOverlay} onPress={handleClose}>
        <Pressable style={styles.sheetContainer}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={{flex: 1}}>
                    <View style={styles.sheetHeader}>
                        <Text style={styles.sheetTitle}>Plan a New Trip</Text>
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                        <X size={20} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.scrollView} keyboardDismissMode="on-drag">
                        {/* Destination */}
                        <View style={styles.inputGroup}>
                        <Text style={styles.label}>Where to?</Text>
                        <View style={styles.inputContainer}>
                            <MapPin style={styles.inputIcon} size={16} color="#666" />
                            <TextInput 
                                placeholder="Enter destination" 
                                style={styles.input}
                                value={destination}
                                onChangeText={setDestination}
                                placeholderTextColor="#999"
                            />
                        </View>
                        </View>

                        {/* Dates */}
                        <View style={styles.dateRow}>
                        <View style={[styles.inputGroup, {flex: 1}]}>
                            <Text style={styles.label}>Start Date</Text>
                            <TouchableOpacity onPress={() => openCalendar('start')} style={styles.inputContainer}>
                            <Calendar style={styles.inputIcon} size={16} color="#666" />
                            <Text style={styles.dateText}>{startDate ? format(startDate, 'MMM d, yyyy') : 'Select date'}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.inputGroup, {flex: 1}]}>
                            <Text style={styles.label}>End Date</Text>
                            <TouchableOpacity onPress={() => openCalendar('end')} style={styles.inputContainer}>
                            <Calendar style={styles.inputIcon} size={16} color="#666" />
                            <Text style={styles.dateText}>{endDate ? format(endDate, 'MMM d, yyyy') : 'Select date'}</Text>
                            </TouchableOpacity>
                        </View>
                        </View>
                        
                        {/* Interests */}
                        <View style={styles.inputGroup}>
                        <Text style={styles.label}>What are you interested in?</Text>
                        <View style={styles.inputContainer}>
                            <Search style={styles.inputIcon} size={16} color="#666" />
                            <TextInput
                                style={styles.input}
                                placeholder="More interests"
                                value={newInterest}
                                onChangeText={setNewInterest}
                                onSubmitEditing={addInterest}
                                placeholderTextColor="#999"
                                blurOnSubmit={false}
                            />
                        </View>
                        <View style={styles.badgeContainer}>
                            {interests.map((interest) => (
                            <TouchableOpacity
                                key={interest.name}
                                onPress={() => toggleInterest(interest.name)}
                                style={[
                                styles.badge,
                                interest.selected ? styles.badgeSelected : styles.badgeSecondary,
                                ]}
                            >
                                <Text
                                style={interest.selected ? styles.badgeTextSelected : styles.badgeTextSecondary}
                                >
                                {interest.name}
                                </Text>
                                <TouchableOpacity onPress={() => removeInterest(interest.name)} style={{ marginLeft: 4 }}>
                                  <X size={12} color={interest.selected ? "#fff" : "#000"} />
                                </TouchableOpacity>
                            </TouchableOpacity>
                            ))}
                        </View>
                        </View>

                        {/* AI Generation Info */}
                        <View style={styles.aiInfoBox}>
                        <Sparkles size={20} color="#8A2BE2" style={styles.aiInfoIcon} />
                        <View style={{flex: 1}}>
                            <Text style={styles.aiInfoTitle}>AI-Powered Itinerary</Text>
                            <Text style={styles.aiInfoText}>
                            We'll create a personalized day-by-day itinerary based on your interests and travel style.
                            </Text>
                        </View>
                        </View>

                        {/* Submit */}
                        <TouchableOpacity style={styles.submitButton}>
                        <Sparkles size={16} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.submitButtonText}>Generate Itinerary</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </TouchableWithoutFeedback>
        </Pressable>
      </Pressable>
        <Modal
            animationType="fade"
            transparent={true}
            visible={showCalendar}
            onRequestClose={() => setShowCalendar(false)}
        >
            <Pressable style={styles.calendarModalOverlay} onPress={() => setShowCalendar(false)}>
                <Pressable>
                    <SimpleCalendar 
                        onDateSelect={handleDateSelect}
                        startDate={startDate}
                        endDate={endDate}
                    />
                </Pressable>
            </Pressable>
        </Modal>
    </Modal>
  )
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    sheetContainer: {
        height: '85%',
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 16,
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 16,
    },
    sheetTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 8,
    },
    scrollView: {
        flex: 1,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    inputContainer: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
        height: 48,
        backgroundColor: '#f1f1f1',
        borderRadius: 12,
    },
    inputIcon: {
        position: 'absolute',
        left: 12,
        zIndex: 1,
    },
    input: {
        flex: 1,
        height: 48,
        paddingLeft: 36,
        backgroundColor: '#f1f1f1',
        borderWidth: 0,
        borderRadius: 12,
    },
    dateText: {
        paddingLeft: 36,
        color: '#333'
    },
    dateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12
    },
    badgeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 16,
    },
    badge: {
        borderRadius: 9999,
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    badgeSelected: {
        backgroundColor: '#8A2BE2',
    },
    badgeSecondary: {
        backgroundColor: '#f1f1f1',
    },
    badgeTextSelected: {
        color: '#fff',
        fontSize: 14,
    },
    badgeTextSecondary: {
        color: '#000',
        fontSize: 14,
    },
    aiInfoBox: {
        backgroundColor: 'rgba(138, 43, 226, 0.1)',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        marginBottom: 24,
    },
    aiInfoIcon: {
        marginTop: 2,
    },
    aiInfoTitle: {
        fontWeight: '500',
        fontSize: 14,
    },
    aiInfoText: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    submitButton: {
        height: 48,
        borderRadius: 12,
        backgroundColor: '#8A2BE2',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    calendarModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
});