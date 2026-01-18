import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isWithinInterval } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

interface SimpleCalendarProps {
  onDateSelect: (date: Date) => void;
  startDate: Date | null;
  endDate: Date | null;
  onDone?: () => void;
}

export function SimpleCalendar({ onDateSelect, startDate, endDate, onDone }: SimpleCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(startDate || new Date());

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

    const stylesToApply = [styles.dayText];
    if (!isSameMonth(day, monthStart)) stylesToApply.push(styles.dayTextOutsideMonth);
    
    return stylesToApply;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={prevMonth}>
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerText}>{format(currentMonth, 'MMMM yyyy')}</Text>
        <TouchableOpacity onPress={nextMonth}>
          <ChevronRight size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.weekdaysContainer}>
        {weekdays.map(day => (
          <Text key={day} style={styles.weekdayText}>{day}</Text>
        ))}
      </View>

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
                    isStartDate && !isEndDate && styles.rangeStart,
                    isEndDate && !isStartDate && styles.rangeEnd,
                    !isStartDate && !isEndDate && styles.rangeMiddle,
                  ]}
                />
              )}
              <TouchableOpacity
                style={[styles.day, (isStartDate || isEndDate) && styles.daySelected]}
                onPress={() => onDateSelect(day)}
                disabled={!isSameMonth(day, monthStart)}
              >
                  <Text style={getDayTextStyle(day)}>
                      {format(day, 'd')}
                  </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      {onDone && (
        <TouchableOpacity style={styles.doneButton} onPress={onDone}>
            <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
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
    fontSize: 14,
    color: '#666',
    width: '14.28%',
    textAlign: 'center',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  day: {
    width: '100%',
    height: '100%',
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
  },
  daySelected: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    backgroundColor: '#8A2BE2',
    borderRadius: 9999,
  },
  rangeHighlight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(138, 43, 226, 0.2)',
  },
  rangeStart: {
    left: '50%',
    right: 0,
  },
  rangeEnd: {
    left: 0,
    right: '50%',
  },
  rangeMiddle: {
    left: 0,
    right: 0,
  },
  dayText: {
    fontSize: 16,
  },
  dayTextOutsideMonth: {
    fontSize: 16,
    color: '#ccc'
  },
  dayTextSelected: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  doneButton: {
    marginTop: 16,
    backgroundColor: '#8A2BE2',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});