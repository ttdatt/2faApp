import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Svg, Circle, Text} from 'react-native-svg';
import {useAuthStore} from './store';

export const ProgressCircleComponent = () => {
  const remainingSeconds = useAuthStore(s => s.remainingSeconds);

  const radius = 20;
  const origin = 40;
  const circumference = 2 * Math.PI * radius;
  const progress = remainingSeconds / 30;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={styles.container}>
      <Svg width={80} height={80}>
        <Circle
          cx={origin}
          cy={origin}
          r={radius}
          fill="transparent"
          stroke="#00b300"
          strokeWidth={3}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          rotation="-90"
          origin={`${origin},${origin}`}
        />
        <Text fontSize="16" fontWeight="600" x={origin} y={origin + 5} textAnchor="middle">
          {remainingSeconds}
        </Text>
      </Svg>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
