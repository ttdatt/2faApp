import React, { memo } from 'react';
import { StyleSheet, TextInput, View } from 'react-native-macos';
import Animated, { SharedValue } from 'react-native-reanimated';
import { Circle, Svg } from 'react-native-svg';
import { circumference, origin, radius } from './constants';

Animated.addWhitelistedNativeProps({ text: true });
const AnimatedText = Animated.createAnimatedComponent(TextInput);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const ProgressCircleComponent = memo(
	({
		text,
		animatedStrokeDashoffset,
	}: {
		text: SharedValue<string>;
		animatedStrokeDashoffset: SharedValue<number>;
	}) => {
		return (
			<View style={styles.container}>
				<Svg width={80} height={80}>
					<AnimatedCircle
						cx={origin}
						cy={origin}
						r={radius}
						fill='transparent'
						stroke='#00b300'
						strokeWidth={3}
						strokeDasharray={`${circumference} ${circumference}`}
						strokeDashoffset={animatedStrokeDashoffset}
						rotation='-90'
						origin={`${origin},${origin}`}
					/>
				</Svg>
				<View pointerEvents='none' style={{ position: 'absolute' }}>
					<AnimatedText
						underlineColorAndroid='transparent'
						editable={false}
						style={styles.text}
						//@ts-ignore
						text={text}
					/>
				</View>
			</View>
		);
	},
);
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
