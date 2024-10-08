import { useEffect, useMemo } from 'react';
import {
	Easing,
	runOnJS,
	useDerivedValue,
	useSharedValue,
	withRepeat,
	withTiming,
} from 'react-native-reanimated';
import { TIME_FRAME, circumference } from './constants';

const getRemainingSeconds = () => {
	'worklet';
	return TIME_FRAME - ((new Date().getTime() / 1000) % TIME_FRAME);
};

export const useCircleTimer = (onFinishStep: () => void) => {
	const timer = useSharedValue(getRemainingSeconds());

	useEffect(() => {
		const remainingSeconds = getRemainingSeconds();
		timer.value = remainingSeconds;
		timer.value = withTiming(
			0,
			{ duration: remainingSeconds * 1000, easing: Easing.linear },
			() => {
				runOnJS(onFinishStep)();
				timer.value = getRemainingSeconds();
				timer.value = withRepeat(
					withTiming(0, { duration: TIME_FRAME * 1000, easing: Easing.linear }, () => {
						runOnJS(onFinishStep)();
					}),
					-1,
				);
			},
		);
	}, [onFinishStep, timer]);

	const animatedStrokeDashoffset = useDerivedValue(() => {
		return circumference * (1 - timer.value / TIME_FRAME);
	});

	const text = useDerivedValue(() => {
		return Math.ceil(timer.value).toString();
	});

	return useMemo(() => {
		return { text, animatedStrokeDashoffset };
	}, [text, animatedStrokeDashoffset]);
};
