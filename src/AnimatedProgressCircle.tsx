import React, {memo, useEffect} from 'react';
import {View, StyleSheet, TextInput} from 'react-native-macos';
import {Svg, Circle} from 'react-native-svg';
import Animated, {
  useSharedValue,
  withTiming,
  useDerivedValue,
  withRepeat,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

Animated.addWhitelistedNativeProps({text: true});
const AnimatedText = Animated.createAnimatedComponent(TextInput);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const radius = 20;
const origin = 40;
const circumference = 2 * Math.PI * radius;

const TIME_FRAME = 30;

const getRemainingSeconds = () => {
  'worklet';
  return TIME_FRAME - ((new Date().getTime() / 1000) % TIME_FRAME) + 1;
};

export const ProgressCircleComponent = memo(({onFinishStep}: {onFinishStep: () => void}) => {
  const timer = useSharedValue(getRemainingSeconds());

  useEffect(() => {
    const remainingSeconds = getRemainingSeconds();
    timer.value = remainingSeconds;
    timer.value = withTiming(0, {duration: remainingSeconds * 1000, easing: Easing.linear}, () => {
      runOnJS(onFinishStep)();
      timer.value = getRemainingSeconds();
      timer.value = withRepeat(
        withTiming(0, {duration: TIME_FRAME * 1000, easing: Easing.linear}, () => {
          runOnJS(onFinishStep)();
        }),
        -1,
      );
    });
  }, [onFinishStep, timer]);

  const animatedStrokeDashoffset = useDerivedValue(() => {
    return circumference * (1 - timer.value / TIME_FRAME);
  });

  const text = useDerivedValue(() => {
    return Math.floor(timer.value).toString();
  });

  return (
    <View style={styles.container}>
      <Svg width={80} height={80}>
        <AnimatedCircle
          cx={origin}
          cy={origin}
          r={radius}
          fill="transparent"
          stroke="#00b300"
          strokeWidth={3}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={animatedStrokeDashoffset}
          rotation="-90"
          origin={`${origin},${origin}`}
        />
      </Svg>
      <View pointerEvents="none" style={{position: 'absolute'}}>
        <AnimatedText
          underlineColorAndroid="transparent"
          editable={false}
          style={styles.text}
          //@ts-ignore
          text={text}
        />
      </View>
    </View>
  );
});
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    width: 80,
    color: 'black',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
});
