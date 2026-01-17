import { Home, Compass, Map, User } from "lucide-react-native";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface BottomNavProps {
  activeTab: "home" | "discover" | "trips" | "profile";
  setActiveTab: (tab: "home" | "discover" | "trips" | "profile") => void;
}

export function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  const tabs = [
    { id: "home" as const, icon: Home, label: "Home" },
    { id: "discover" as const, icon: Compass, label: "Discover" },
    { id: "trips" as const, icon: Map, label: "Trips" },
    { id: "profile" as const, icon: User, label: "Profile" },
  ];

  return (
    <View style={styles.nav}>
      <View style={styles.container}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          // Using placeholder colors for active/inactive states
          const activeColor = "#007AFF"; // A standard blue
          const inactiveColor = "#8e8e93"; // A standard gray

          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={styles.tabButton}
            >
              <Icon
                size={24}
                strokeWidth={isActive ? 2.5 : 2}
                color={isActive ? activeColor : inactiveColor}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: isActive ? activeColor : inactiveColor },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA', // A light gray for the border
    backgroundColor: '#F8F8F8', // A light background color
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingHorizontal: 16,
    // safe-area-pb is not a standard style, would need react-native-safe-area-context
    // to handle properly, paddingBottom could be used if needed.
  },
  tabButton: {
    alignItems: 'center',
    gap: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
  }
});