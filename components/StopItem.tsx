// components/StopItem.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type StopItemProps = {
  stop: {
    seq: number;
    name_tc: string;
    name_en: string;
    lat: string;
    long: string;
  };
};

const StopItem: React.FC<StopItemProps> = ({ stop }) => {
  return (
    <View style={styles.container}>
      <View style={styles.sequenceContainer}>
        <Text style={styles.sequenceNumber}>{stop.seq}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.stopNameChinese}>{stop.name_tc}</Text>
        <Text style={styles.stopNameEnglish}>{stop.name_en}</Text>
      </View>
    </View>
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
  sequenceContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0066cc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  sequenceNumber: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  infoContainer: {
    flex: 1,
  },
  stopNameChinese: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  stopNameEnglish: {
    fontSize: 14,
    color: '#666',
  },
});

export default StopItem;