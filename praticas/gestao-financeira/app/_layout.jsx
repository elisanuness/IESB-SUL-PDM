import { useContext, useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import GlobalState, { MoneyContext } from "../contexts/GlobalState";
import { colors } from "../constants/colors";

function NavController() {
  const { user, authLoading } = useContext(MoneyContext);
  const segments = useSegments();
  const router   = useRouter();

  useEffect(() => {
    if (authLoading) return;
    const inAuthScreen = segments[0] === "login";
    if (!user && !inAuthScreen) {
      router.replace("/login");
    } else if (user && inAuthScreen) {
      router.replace("/(tabs)");
    }
  }, [user, authLoading, segments]);

  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.primary,
          headerTitleStyle: { fontWeight: "700", color: colors.text },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="gerenciar-transacao"
          options={{
            title: "Transação",
            presentation: "modal",
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.primary,
          }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>

      {authLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </>
  );
}

export default function RootLayout() {
  return (
    <GlobalState>
      <StatusBar backgroundColor={colors.background} style="light" />
      <NavController />
    </GlobalState>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
});
