// App.tsx
import "./i18n";
import React, { createContext, useEffect, useState } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import RoutesScreen from "./screens/RoutesScreen";
import FavoritesScreen from "./screens/FavoritesScreen";
import RouteDetailScreen from "./screens/RouteDetailScreen";
import NearbyScreen from "./screens/NearbyScreen";
// You'd typically import icons from a library like @expo/vector-icons
import { MaterialIcons } from "@expo/vector-icons";

export const BusDataContext = createContext<{
  busData: any[];
  refreshing: boolean;
  onRefresh: () => Promise<void>;
  setBusData: (data: any[]) => void;
}>({
  busData: [],
  refreshing: false,
  onRefresh: async () => {},
  setBusData: () => {},
});

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const fetchBusData = async () => {
  try {
    const response = await fetch(
      "https://data.etabus.gov.hk/v1/transport/kmb/route/"
    );
    const data = await response.json();
    return data.data; // Assumes data structure is { data: [...] }
  } catch (error) {
    console.error("Failed to fetch bus data:", error);
    return [];
  }
};

// Create a stack navigator for each tab
const RoutesStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="RoutesHome"
        component={RoutesScreen}
        options={{ title: "全部路線" }}
      />
      <Stack.Screen
        name="RouteDetail"
        component={RouteDetailScreen}
        options={({ route }) => ({
          title: `${route.params.route}號線`,
        })}
      />
    </Stack.Navigator>
  );
};

const FavoritesStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="FavoritesHome"
        component={FavoritesScreen}
        options={{ title: "收藏" }}
      />
      <Stack.Screen
        name="RouteDetail"
        getComponent={RouteDetailScreen}
        options={({ route }) => ({
          title: `${route.params.route}號線`,
        })}
      />
    </Stack.Navigator>
  );
};

const NearbyStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="NearbyHome"
        component={NearbyScreen}
        options={{ title: "附近站點" }}
      />
      <Stack.Screen
        name="RouteDetail"
        getComponent={RouteDetailScreen}
        options={({ route }) => ({
          title: `${route.params.route}號線`,
        })}
      />
    </Stack.Navigator>
  );
};

export default function App() {
  const [busData, setBusData] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    const data = await fetchBusData();
    setBusData(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    const data = await fetchBusData();
    setBusData(data);
    setRefreshing(false);
  };

  if (!busData.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <BusDataContext.Provider
      value={{ busData, refreshing, onRefresh, setBusData }}
    >
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === "Routes") {
                iconName = "directions-bus";
              } else if (route.name === "Favorites") {
                iconName = "star";
              } else if (route.name === "Nearby") {
                iconName = "near-me";
              }

              return (
                <MaterialIcons name={iconName} size={size} color={color} />
              );
            },
            tabBarActiveTintColor: "#0066cc",
            tabBarInactiveTintColor: "gray",
          })}
        >
          <Tab.Screen
            name="Routes"
            component={RoutesStack}
            options={{
              headerShown: false,
              title: t("navigation.allRoutes"),
            }}
          />
          <Tab.Screen
            name="Favorites"
            component={FavoritesStack}
            options={{
              headerShown: false,
              title: t("navigation.favorites"),
            }}
          />
          <Tab.Screen
            name="Nearby"
            component={NearbyStack}
            options={{
              headerShown: false,
              title: t("navigation.nearby"),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </BusDataContext.Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
