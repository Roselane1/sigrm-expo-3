import React, { useCallback, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { COLORS } from "./src/theme/colors";
import { useAppFonts } from "./src/theme/fonts";
import { AppStateProvider, useAppState } from "./src/state/AppState";
import LoginScreen from "./src/screens/LoginScreen";
import AppShell from "./src/screens/AppShell";

SplashScreen.preventAutoHideAsync().catch(() => {});

function Root() {
  const { user, restoringSession } = useAppState();

  if (restoringSession) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.ink }}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.paper }} edges={["top", "left", "right"]}>
      <StatusBar style={user ? "dark" : "light"} />
      {user ? <AppShell /> : <LoginScreen />}
    </SafeAreaView>
  );
}

export default function App() {
  const fontsLoaded = useAppFonts();

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.ink }}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AppStateProvider>
        <Root />
      </AppStateProvider>
    </SafeAreaProvider>
  );
}
