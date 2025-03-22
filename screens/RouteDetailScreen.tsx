// screens/RouteDetailScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import StopItem from '../components/StopItem';

// Define the type for our route parameters
type RouteDetailParams = {
  RouteDetail: {
    route: string;
    bound: string;
    serviceType: string;
    origTC: string;
    destTC: string;
  };
};

// Define the type for our route prop
type RouteDetailScreenRouteProp = RouteProp<RouteDetailParams, 'RouteDetail'>;

// Define the type for our navigation prop
type RouteDetailScreenProps = {
  route: RouteDetailScreenRouteProp;
};

// Define the type for our stop data
type Stop = {
  stop: string; 
  name_tc: string; 
  name_en: string; 
  lat: string; 
  long: string;
};

// Define the type for our route stop data
type RouteStop = {
  route: string;
  bound: string;
  service_type: string;
  seq: number;
  stop: string;
};

// Define the type for combined stop display data
type StopDisplayData = {
  stop: string;
  name_tc: string;
  name_en: string;
  lat: string;
  long: string;
  seq: number;
};

const RouteDetailScreen: React.FC<RouteDetailScreenProps> = ({ route }) => {
  const { route: routeNumber, bound, serviceType, origTC, destTC } = route.params;
  const [routeStops, setRouteStops] = useState<StopDisplayData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRouteStopsData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Log the parameters we're using to help debug
        console.log('Route parameters:', {
          routeNumber, 
          bound, 
          serviceType,
          origTC,
          destTC
        });
        
        // Fix: Normalize parameter types to what the API expects
        // The API likely expects numeric routes without spaces and specific formats for bound
        const cleanRoute = encodeURIComponent(routeNumber.trim());
        // Ensure bound is uppercase "I" or "O"
        const cleanBound = bound.toUpperCase().trim() === 'I' ? 'I' : 'O';
        // Service type should be a number (convert to string)
        const cleanServiceType = encodeURIComponent(serviceType.trim());
        
        console.log('Cleaned parameters:', { cleanRoute, cleanBound, cleanServiceType });
        
        // Step 1: Get the sequence of stops for this route
        // Try multiple formats to find what works
        let routeStopUrl = `https://data.etabus.gov.hk/v1/transport/kmb/route-stop/${cleanRoute}/${cleanBound}/${cleanServiceType}`;
        console.log(`Fetching route stops from: ${routeStopUrl}`);
        
        let routeStopResponse = await fetch(routeStopUrl);
        
        // If first attempt fails, try alternate parameter formats
        if (!routeStopResponse.ok) {
          console.log(`First attempt failed with status: ${routeStopResponse.status}. Trying alternate format...`);
          
          // Try alternate format (some APIs use 'inbound'/'outbound' instead of 'I'/'O')
          const alternateBound = cleanBound === 'I' ? 'inbound' : 'outbound';
          routeStopUrl = `https://data.etabus.gov.hk/v1/transport/kmb/route-stop/${cleanRoute}/${alternateBound}/${cleanServiceType}`;
          console.log(`Trying alternate URL: ${routeStopUrl}`);
          
          routeStopResponse = await fetch(routeStopUrl);
          
          if (!routeStopResponse.ok) {
            // If that fails too, try with service type as "1" which is often the default
            console.log(`Second attempt failed with status: ${routeStopResponse.status}. Trying with default service type...`);
            
            routeStopUrl = `https://data.etabus.gov.hk/v1/transport/kmb/route-stop/${cleanRoute}/${cleanBound}/1`;
            console.log(`Trying with default service type: ${routeStopUrl}`);
            
            routeStopResponse = await fetch(routeStopUrl);
            
            if (!routeStopResponse.ok) {
              throw new Error(`All attempts failed. Last status: ${routeStopResponse.status}`);
            }
          }
        }
        
        const routeStopData = await routeStopResponse.json();
        console.log(`Route stop data received. Data count: ${routeStopData.data ? routeStopData.data.length : 0}`);
        
        if (!routeStopData.data || routeStopData.data.length === 0) {
          setError('No stops found for this route');
          setLoading(false);
          return;
        }
        
        // Step 2: Get all stops data at once to improve performance
        const allStopsUrl = 'https://data.etabus.gov.hk/v1/transport/kmb/stop/';
        console.log(`Fetching all stops from: ${allStopsUrl}`);
        
        const allStopsResponse = await fetch(allStopsUrl);
        
        if (!allStopsResponse.ok) {
          const errorText = `Failed to fetch stop details: ${allStopsResponse.status}`;
          console.error(errorText);
          setError(errorText);
          setLoading(false);
          return;
        }
        
        const allStopsData = await allStopsResponse.json();
        console.log(`All stops data received. Stop count: ${allStopsData.data ? allStopsData.data.length : 0}`);
        
        if (!allStopsData.data || allStopsData.data.length === 0) {
          setError('Failed to load stop information');
          setLoading(false);
          return;
        }
        
        // Create a map of all stops for quick lookup
        const stopsMap = new Map();
        allStopsData.data.forEach((stop: Stop) => {
          stopsMap.set(stop.stop, stop);
        });
        
        // Process each route stop and look up its details
        const stopsWithDetails: StopDisplayData[] = [];
        
        for (const routeStop of routeStopData.data) {
          const stopDetails = stopsMap.get(routeStop.stop);
          
          if (stopDetails) {
            // Combine route stop sequence with stop details
            stopsWithDetails.push({
              ...stopDetails,
              seq: routeStop.seq
            });
          } else {
            console.warn(`Could not find details for stop ${routeStop.stop}`);
          }
        }
        
        // Sort stops by sequence number
        stopsWithDetails.sort((a, b) => a.seq - b.seq);
        console.log(`Processed ${stopsWithDetails.length} stops with details`);
        
        setRouteStops(stopsWithDetails);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Error fetching stops:', errorMessage);
        setError(`Failed to load bus stops. Error: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchRouteStopsData();
  }, [routeNumber, bound, serviceType]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading bus stops...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.debugText}>
          Debug info: Route={routeNumber}, Bound={bound}, ServiceType={serviceType}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.routeNumber}>{routeNumber}</Text>
        <View style={styles.routeInfo}>
          <Text style={styles.routeDirection}>{origTC} → {destTC}</Text>
        </View>
      </View>
      
      <FlatList
        data={routeStops}
        keyExtractor={(item) => `${item.stop}-${item.seq}`}
        renderItem={({ item }) => <StopItem stop={item} />}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={() => (
          <View style={styles.listHeader}>
            <Text style={styles.stopsCount}>{routeStops.length} 個巴士站</Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>沒有巴士站資料</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  routeNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  routeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  routeDirection: {
    fontSize: 16,
    color: '#555',
  },
  debugText: {
    fontSize: 12,
    color: '#888',
  },
  listContainer: {
    paddingBottom: 20,
  },
  listHeader: {
    padding: 16,
    backgroundColor: '#f0f0f0',
  },
  stopsCount: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default RouteDetailScreen;