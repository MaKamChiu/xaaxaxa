import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';

type StopETAItemProps = {
  stopId: string;
};

const StopETAItem: React.FC<StopETAItemProps> = ({ stopId }) => {
  const [etaData, setEtaData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  // 使用 useEffect 內部定義函數避免依賴問題
  useEffect(() => {
    let isMounted = true;

    const fetchETA = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://data.etabus.gov.hk/v1/transport/kmb/stop-eta/${stopId}`);
        const result = await response.json();
        
        if (isMounted) {
          if (result && result.data) {
            setEtaData(result.data);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching ETA:', err);
        if (isMounted) {
          setError(t('stops.etaError'));
          setLoading(false);
        }
      }
    };

    fetchETA();

    // 清理函數
    return () => {
      isMounted = false;
    };
  }, [stopId, t]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#0066cc" />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (etaData.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>{t('stops.noEta')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {etaData.map((eta, index) => (
        <View key={index} style={styles.etaItem}>
          <Text style={styles.routeNumber}>{eta.route}</Text>
          <Text style={styles.destination}>{eta.dest_tc}</Text>
          <Text style={styles.etaTime}>
            {eta.eta_seq === 1 ? t('stops.arriving') : `${eta.eta_min} ${t('stops.minutes')}`}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    color: 'red',
    textAlign: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  etaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  routeNumber: {
    fontWeight: 'bold',
    fontSize: 16,
    width: 60,
  },
  destination: {
    flex: 1,
    fontSize: 14,
  },
  etaTime: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0066cc',
  },
});

export default StopETAItem;