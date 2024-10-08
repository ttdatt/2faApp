import debouce from 'lodash/debounce';
import { compressToUTF16, decompressFromUTF16 } from 'lz-string';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import RNFS from 'react-native-fs';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native-macos';
import { SharedValue } from 'react-native-reanimated';
import { ToastProvider, useToast } from 'react-native-toast-notifications';
import { ProgressCircleComponent } from './AnimatedProgressCircle';
import { MyClipboardModule as Clipboard, eventEmitter, open_file } from './module';
import { DataInterface, OtpItemInterface } from './types';
import { useCircleTimer } from './useCircleTimer';
import { getToken } from './utils';

const styles = StyleSheet.create({
	itemContainer: {
		paddingVertical: 12,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	input: {
		marginHorizontal: 20,
		marginTop: 16,
		fontSize: 16,
		paddingVertical: 8,
		textAlignVertical: 'center',
	},
	scroll: {
		padding: 20,
		backgroundColor: 'white',
	},
});

const ListItem = memo(
	({
		x,
		trigger,
		text,
		animatedStrokeDashoffset,
	}: {
		x: OtpItemInterface;
		trigger: number;
		text: SharedValue<string>;
		animatedStrokeDashoffset: SharedValue<number>;
	}) => {
		const [otp, setOtp] = useState<string>(getToken(x.secret, new Date().getTime()));
		const toast = useToast();

		const onFinishStep = useCallback(() => {
			const currentTimestamp = new Date().getTime();
			setOtp(getToken(x.secret, currentTimestamp));
		}, [x.secret]);

		useEffect(() => {
			if (trigger > 0) {
				onFinishStep();
			}
		}, [trigger, onFinishStep]);

		const onPress = useCallback(async () => {
			const result = await Clipboard.setString(otp);
			toast.hideAll();
			toast.show(result);
		}, [otp, toast]);

		return (
			<TouchableOpacity activeOpacity={0.5} style={styles.itemContainer} onPress={onPress}>
				<View>
					<Text style={{ fontSize: 18 }}>{x.name}</Text>
					<Text style={{ fontSize: 32 }}>{otp}</Text>
					<Text style={{ fontSize: 18 }}>{x.otp.account}</Text>
				</View>
				<ProgressCircleComponent text={text} animatedStrokeDashoffset={animatedStrokeDashoffset} />
			</TouchableOpacity>
		);
	},
);

const App = () => {
	const originData = useRef<DataInterface>();
	const [items, setItems] = useState<OtpItemInterface[]>([]);

	useEffect(() => {
		const openFileListener = eventEmitter.addListener(open_file, async (path) => {
			const content = await RNFS.readFile(path, 'utf8');

			await RNFS.writeFile(
				RNFS.MainBundlePath + '/Contents/Resources/data.bin',
				compressToUTF16(content),
				'utf8',
			);
			originData.current = JSON.parse(content);
			if (originData.current) setItems(originData.current.services);
		});

		// load data
		(async () => {
			const path = RNFS.MainBundlePath + '/Contents/Resources/data.bin';
			const exist = await RNFS.exists(path);
			if (!exist) return;

			const content = await RNFS.readFile(path);
			if (content) {
				const data = JSON.parse(decompressFromUTF16(content));
				originData.current = data;
				setItems(data.services);
			}
		})();

		return () => {
			openFileListener.remove();
		};
	}, []);

	const onChangeText = useCallback(
		debouce((text) => {
			if (!originData.current) return;

			if (text?.length > 0) {
				setItems(
					originData.current?.services?.filter(
						(y) =>
							y.name.toLowerCase().includes(text.toLowerCase()) ||
							y.otp.account?.toLowerCase().includes(text.toLowerCase()),
					),
				);
			} else setItems(originData.current?.services);
		}, 300),
		[],
	);

	const [trigger, setTrigger] = useState(0);
	const onFinishStep = useCallback(() => {
		setTrigger((x) => x + 1);
	}, []);
	const { text, animatedStrokeDashoffset } = useCircleTimer(onFinishStep);

	return (
		<ToastProvider>
			<View style={{ flex: 1, backgroundColor: 'white' }}>
				<TextInput autoFocus style={styles.input} onChangeText={onChangeText} />
				<FlatList
					contentInsetAdjustmentBehavior='automatic'
					contentContainerStyle={styles.scroll}
					keyExtractor={(item) => item.name + item.otp.account}
					data={items}
					renderItem={({ item }) => {
						return (
							<ListItem
								trigger={trigger}
								text={text}
								animatedStrokeDashoffset={animatedStrokeDashoffset}
								x={item}
							/>
						);
					}}
				/>
			</View>
		</ToastProvider>
	);
};

export default App;
