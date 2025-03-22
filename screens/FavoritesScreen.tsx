// screens/FavoritesScreen.tsx
import React, { useContext, useEffect, useState, useCallback } from 'react';
import { View, TextInput, FlatList, StyleSheet, ActivityIndicator, RefreshControl, Text } from 'react-native';
import { BusDataContext } from '../App';
import ListItem from '../components/ListItem';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const FavoritesScreen = () => {
  const { busData, refreshing, onRefresh } = useContext(BusDataContext);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFavorites, setFilteredFavorites] = useState<any[]>([]);

  const loadFavorites = async () => {
    const favs = JSON.parse(await AsyncStorage.getItem('favorites') || '[]');
    setFavorites(favs);
  };

  // 每次進入此頁面時重新讀取收藏
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  useEffect(() => {
    // 從全部 busData 中過濾出收藏項目
    const favData = busData.filter(item => favorites.includes(item.route));
    if (searchQuery === '') {
      setFilteredFavorites(favData);
    } else {
      const filtered = favData.filter(item =>
        item.route.includes(searchQuery) ||
        item.orig_tc.includes(searchQuery) ||
        item.dest_tc.includes(searchQuery)
      );
      setFilteredFavorites(filtered);
    }
  }, [favorites, searchQuery, busData]);

  if (!busData.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="搜尋收藏..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={filteredFavorites}
        contentContainerStyle={{ paddingTop: 40 }}
        keyExtractor={(item) => item.route}
        renderItem={({ item }) => <ListItem item={item} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<View style={styles.emptyContainer}><Text>沒有收藏項目</Text></View>}
      />
    </View>
  );
};

export default FavoritesScreen;

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
  emptyContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
});
