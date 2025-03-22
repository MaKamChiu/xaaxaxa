// components/ListItem.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Define the navigation stack parameter list type
type RootStackParamList = {
  RouteDetail: {
    route: string;
    bound: string;
    serviceType: string;
    origTC: string;
    destTC: string;
  };
};

// Define the navigation prop type
type ListItemNavigationProp = StackNavigationProp<RootStackParamList, 'RouteDetail'>;

type ListItemProps = {
  item: {
    route: string;
    bound: string;
    service_type: string;
    orig_tc: string;
    dest_tc: string;
    orig_en?: string; // Optional for backward compatibility
    dest_en?: string; // Optional for backward compatibility
  };
};

const ListItem: React.FC<ListItemProps> = ({ item }) => {
  const navigation = useNavigation<ListItemNavigationProp>();

  const handlePress = () => {
    console.log('Navigating to route details with params:', {
      route: item.route,
      bound: item.bound,
      serviceType: item.service_type,
      origTC: item.orig_tc,
      destTC: item.dest_tc,
    });
    
    navigation.navigate('RouteDetail', {
      route: item.route,
      bound: item.bound,
      serviceType: item.service_type,
      origTC: item.orig_tc,
      destTC: item.dest_tc,
    });
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.routeNumberContainer}>
        <Text style={styles.routeNumber}>{item.route}</Text>
      </View>
      <View style={styles.routeInfoContainer}>
        <Text style={styles.routeDirection}>
          {item.orig_tc} → {item.dest_tc}
        </Text>
        {item.orig_en && item.dest_en && (
          <Text style={styles.routeDirectionEn}>
            {item.orig_en} → {item.dest_en}
          </Text>
        )}
      </View>
      <View style={styles.arrowContainer}>
        <Text style={styles.arrow}>›</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
  },
  routeNumberContainer: {
    backgroundColor: '#0066cc',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  routeNumber: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  routeInfoContainer: {
    flex: 1,
  },
  routeDirection: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  routeDirectionEn: {
    fontSize: 14,
    color: '#666',
  },
  arrowContainer: {
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  arrow: {
    fontSize: 20,
    color: '#999',
  },
});

export default ListItem;