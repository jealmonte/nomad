import React, { useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { HomeTab } from "@/components/tabs/home-tab";
import { DiscoverTab } from "@/components/tabs/discover-tab";
import { TripsTab } from "@/components/tabs/trips-tab";
import { ProfileTab } from "@/components/tabs/profile-tab";
import { BottomNav } from "@/components/navigation/bottom-nav";

export default function App() {
  // We removed explicit types like <"home" | ...> to keep it simple for now, 
  // but you can add them back if you are using TypeScript.
  const [activeTab, setActiveTab] = useState<"home" | "discover" | "trips" | "profile">("home");

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* If your app crashes, it's because these components below 
           still have <div> tags inside them. 
           Comment them out temporarily to test if the white screen goes away.
        */}
        {activeTab === "home" && <HomeTab />}
        {activeTab === "discover" && <DiscoverTab />}
        {activeTab === "trips" && <TripsTab />}
        {activeTab === "profile" && <ProfileTab />}
      </View>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // Equivalent to bg-background
  },
  content: {
    flex: 1,
    paddingBottom: 80, // Equivalent to pb-20 (giving space for bottom nav)
  },
});