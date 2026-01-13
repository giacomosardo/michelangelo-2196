import { Stack } from "expo-router";
import React from "react";
import { StatusBar } from "react-native";
import "react-native-reanimated";

export default function RootLayout() {
  return (
    <>
      <StatusBar barStyle="light-content" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#181C32",
          },
          headerTintColor: "#FEFF28",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false, title: "Home" }}
        />
        <Stack.Screen
          name="game"
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="leaderboard"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="shop"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="[id]" />
      </Stack>
    </>
  );
}
