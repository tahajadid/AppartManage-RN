import { LoadingProps } from '@/constants/types';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

const Loading = ({
  sizeLoading = "large",
  colorLoader
}: LoadingProps) => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size={sizeLoading} color={colorLoader} />
    </View>
  )
}

export default Loading;

const styles = StyleSheet.create({});