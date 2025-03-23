// 更新 RouteDetailScreen 的導入部分
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import { RouteProp, ParamListBase } from '@react-navigation/native';
import StopItem from '../components/StopItem';

// 定義路由參數的類型
type RouteDetailParams = {
  RouteDetail: {
    route: string;
    bound: string;
    serviceType: string;
    origTC: string;
    destTC: string;
  };
};

// 定義路由屬性的類型
type RouteDetailScreenRouteProp = RouteProp<RouteDetailParams, 'RouteDetail'>;

// 定義組件的屬性類型
type RouteDetailScreenProps = {
  route: RouteDetailScreenRouteProp;
};

// 定義站點數據的類型
// ... rest of the component remains the same ...