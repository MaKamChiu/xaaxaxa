// screens/RoutesScreen.tsx
import React, { useContext, useEffect, useState } from 'react';
import { View, TextInput, FlatList, StyleSheet, ActivityIndicator, RefreshControl, SafeAreaView } from 'react-native';
import { BusDataContext } from '../App';
import ListItem from '../components/ListItem';

const RoutesScreen = () => {
  const { busData, refreshing, onRefresh } = useContext(BusDataContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredBusData, setFilteredBusData] = useState(busData);

  useEffect(() => {
    if (searchQuery === '') {
      setFilteredBusData(busData);
    } else {
      const filtered = busData.filter(item =>
        item.route.includes(searchQuery) ||
        item.orig_tc.includes(searchQuery) ||
        item.dest_tc.includes(searchQuery)
      );
      setFilteredBusData(filtered);
    }
  }, [searchQuery, busData]);

  if (!busData.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="搜尋路線/起點/終點..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={filteredBusData}
        keyExtractor={(item) => `${item.route}-${item.bound}-${item.service_type}`}
        renderItem={({ item }) => <ListItem item={item} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </SafeAreaView>
  );
};

export default RoutesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchBar: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 8,
    margin: 16,
    borderRadius: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});