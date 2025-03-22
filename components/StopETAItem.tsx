// screens/NearbyScreen.tsx
import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Platform, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { BusDataContext } from '../App';
import StopETAItem from '../components/StopETAItem';

type NearbyStop = {
  stop: string;
  name_tc: string;
  name_en: string;
  lat: string;
  long: string;
  distance: number; // in meters
  showEta?: boolean; // To toggle ETA visibility
};

const NearbyScreen = () => {
  const { busData } = useContext(BusDataContext);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [nearbyStops, setNearbyStops] = useState<NearbyStop[]>([]);
  
  // Request location permission
  const requestLocationPermission = async () => {
    try {
      const permission = Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

      const result = await check(permission);
      
      if (result === RESULTS.GRANTED) {
        return true;
      }
      
      const requestResult = await request(permission);
      return requestResult === RESULTS.GRANTED;
    } catch (error) {
      console.error('Error checking location permission:', error);
      return false;
    }
  };

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  // Fetch nearby stops
  const fetchNearbyStops = async () => {
    try {
      setLoading(true);
      setLocationError(null);
      
      const hasPermission = await requestLocationPermission();
      
      if (!hasPermission) {
        setLocationError('位置權限被拒絕');
        setLoading(false);
        return;
      }

      Geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Fetch all bus stops
          try {
            const response = await fetch('https://data.etabus.gov.hk/v1/transport/kmb/stop/');
            const result = await response.json();
            
            if (result && result.data && result.data.length > 0) {
              // Calculate distance for each stop
              const stopsWithDistance = result.data.map((stop: any) => ({
                ...stop,
                distance: calculateDistance(
                  latitude, 
                  longitude, 
                  parseFloat(stop.lat), 
                  parseFloat(stop.long)
                ),
                showEta: false // Initially hide all ETAs
              }));
              
              // Sort by distance and limit to closest 30 stops
              const closest = stopsWithDistance
                .sort((a: NearbyStop, b: NearbyStop) => a.distance - b.distance)
                .slice(0, 30);
              
              setNearbyStops(closest);
            }
          } catch (error) {
            console.error('Error fetching stops:', error);
            setLocationError('無法取得附近巴士站');
          }
          
          setLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationError(`無法取得你的位置: ${error.message}`);
          setLoading(false);
        },
        { 
          enableHighAccuracy: true, 
          timeout: 15000, 
          maximumAge: 10000 
        }
      );
    } catch (error) {
      console.error('Error in fetchNearbyStops:', error);
      setLocationError('發生意外錯誤');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNearbyStops();
  }, []);

  const refresh = () => {
    fetchNearbyStops();
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)}米`;
    } else {
      return `${(meters / 1000).toFixed(1)}公里`;
    }
  };

  const toggleEta = (index: number) => {
    const updatedStops = [...nearbyStops];
    updatedStops[index].showEta = !updatedStops[index].showEta;
    setNearbyStops(updatedStops);
  };

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>正在定位...</Text>
      </View>
    );
  }

  if (locationError) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>{locationError}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={refresh}
        >
          <Text style={styles.retryText}>重試</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>附近巴士站</Text>
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={refresh}
        >
          <Text style={styles.refreshText}>更新位置</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={nearbyStops}
        keyExtractor={(item) => item.stop}
        renderItem={({ item, index }) => (
          <TouchableOpacity 
            style={styles.stopItemContainer}
            onPress={() => toggleEta(index)}
          >
            <View style={styles.stopInfoContainer}>
              <Text style={styles.stopName}>{item.name_tc}</Text>
              <Text style={styles.stopNameEn}>{item.name_en}</Text>
              <Text style={styles.distanceText}>距離: {formatDistance(item.distance)}</Text>
              
              {item.showEta && (
                <StopETAItem stopId={item.stop} />
              )}
            </View>
            <Text style={styles.expandCollapseIcon}>
              {item.showEta ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>找不到附近巴士站</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  refreshButton: {
    backgroundColor: '#0066cc',
    padding: 8,
    borderRadius: 8,
  },
  refreshText: {
    color: '#fff',
    fontWeight: '500',
  },
  stopItemContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  stopInfoContainer: {
    flex: 1,
  },
  stopName: {
    fontSize: 16,
    fontWeight: '500',
  },
  stopNameEn: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  distanceText: {
    fontSize: 14,
    color: '#0066cc',
    fontWeight: '500',
  },
  expandCollapseIcon: {
    fontSize: 16,
    color: '#666',
    padding: 4,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#0066cc',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '500',
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

export default NearbyScreen;