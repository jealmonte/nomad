import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isWithinInterval } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface SimpleCalendarProps {
  onDateSelect: (date: Date) => void;
  startDate: Date | null;
  endDate: Date | null;
  onDone?: () => void;
}

export function SimpleCalendar({ onDateSelect, startDate, endDate, onDone }: SimpleCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(startDate || new Date());
  const theme = useColorScheme() ?? 'light';

  // --- Theme Colors ---
  const backgroundColor = Colors[theme].background;
  const textColor = Colors[theme].text;
  const iconColor = Colors[theme].icon;
  // This hex code is green.
  const primaryColor = '#46bd74'; 
  
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const weekStartDate = startOfWeek(monthStart);
  const weekEndDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: weekStartDate, end: weekEndDate });
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const getDayTextStyle = (day: Date) => {
    const isSelected = (startDate && isSameDay(day, startDate)) || (endDate && isSameDay(day, endDate));
    
    if (isSelected) {
        return [styles.dayText, styles.dayTextSelected];
    }

    const stylesToApply: any[] = [styles.dayText, { color: textColor }];
    
    if (!isSameMonth(day, monthStart)) {
        stylesToApply.push({ color: iconColor, opacity: 0.5 }); // Muted color for outside month
    }
    
    return stylesToApply;
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={prevMonth} hitSlop={10}>
          <ChevronLeft size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerText, { color: textColor }]}>
            {format(currentMonth, 'MMMM yyyy')}
        </Text>
        <TouchableOpacity onPress={nextMonth} hitSlop={10}>
          <ChevronRight size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      {/* Weekday Labels */}
      <View style={styles.weekdaysContainer}>
        {weekdays.map(day => (
          <Text key={day} style={[styles.weekdayText, { color: iconColor }]}>{day}</Text>
        ))}
      </View>

      {/* Days Grid */}
      <View style={styles.daysContainer}>
        {days.map((day, index) => {
          const isStartDate = startDate && isSameDay(day, startDate);
          const isEndDate = endDate && isSameDay(day, endDate);
          const isInRange = startDate && endDate && isWithinInterval(day, { start: startDate, end: endDate });

          return (
            <View key={index} style={styles.dayContainer}>
              {isInRange && (
                <View
                  style={[
                    styles.rangeHighlight,
                    // CHANGED: Used RGBA version of #46bd74 for light green highlight
                    { backgroundColor: 'rgba(70, 189, 116, 0.15)' }, 
                    isStartDate && !isEndDate && styles.rangeStart,
                    isEndDate && !isStartDate && styles.rangeEnd,
                    !isStartDate && !isEndDate && styles.rangeMiddle,
                  ]}
                />
              )}
              <TouchableOpacity
                style={[
                    styles.day, 
                    (isStartDate || isEndDate) && { backgroundColor: primaryColor, borderRadius: 9999 }
                ]}
                onPress={() => onDateSelect(day)}
                // Optional: Disable interaction with days outside month?
                // disabled={!isSameMonth(day, monthStart)} 
              >
                  <Text style={getDayTextStyle(day)}>
                      {format(day, 'd')}
                  </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      {/* Done Button */}
      {onDone && (
        <TouchableOpacity 
            style={[styles.doneButton, { backgroundColor: primaryColor }]} 
            onPress={onDone}
        >
            <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16, // Matching rounded-xl
    padding: 16,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  weekdaysContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayText: {
    fontSize: 13,
    fontWeight: '500',
    width: '14.28%',
    textAlign: 'center',
    textTransform: 'uppercase', // Optional style choice
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  day: {
    width: 36, // Fixed size for perfect circles
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  dayContainer: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 2,
  },
  rangeHighlight: {
    position: 'absolute',
    top: 2, // Small offset to not touch edges
    bottom: 2,
    left: 0,
    right: 0,
  },
  rangeStart: {
    left: '50%',
    borderTopLeftRadius: 999,
    borderBottomLeftRadius: 999,
  },
  rangeEnd: {
    right: '50%',
    borderTopRightRadius: 999,
    borderBottomRightRadius: 999,
  },
  rangeMiddle: {
    left: 0,
    right: 0,
  },
  dayText: {
    fontSize: 15,
    fontWeight: '500',
  },
  dayTextSelected: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  doneButton: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 12, // Matching rounded-xl
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});