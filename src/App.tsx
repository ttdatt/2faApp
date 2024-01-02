import React, {memo, useCallback, useEffect, useRef, useState} from 'react';
import {FlatList, Text, View, TouchableOpacity, TextInput, StyleSheet} from 'react-native-macos';
import {getToken} from './utils';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {MyClipboardModule as Clipboard, eventEmitter, open_file} from './module';
import debouce from 'lodash/debounce';
import {ProgressCircleComponent} from './AnimatedProgressCircle';
import {DataInterface, OtpItemInterface} from './types';
import {ToastProvider, useToast} from 'react-native-toast-notifications';
import {compressToUTF16, decompressFromUTF16} from 'lz-string';
import RNFS from 'react-native-fs';

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
    backgroundColor: Colors.lighter,
  },
});

const ListItem = memo(({x}: {x: OtpItemInterface}) => {
  const [otp, setOtp] = useState<string>(getToken(x.secret, new Date().getTime()));
  const toast = useToast();

  const onFinishStep = useCallback(() => {
    const currentTimestamp = new Date().getTime();
    setOtp(getToken(x.secret, currentTimestamp));
  }, [x.secret]);

  const onPress = useCallback(async () => {
    const result = await Clipboard.setString(otp);
    toast.hideAll();
    toast.show(result);
  }, [otp, toast]);

  return (
    <TouchableOpacity activeOpacity={0.5} style={styles.itemContainer} onPress={onPress}>
      <View>
        <Text style={{fontSize: 18}}>{x.name}</Text>
        <Text style={{fontSize: 32}}>{otp}</Text>
        <Text style={{fontSize: 18}}>{x.otp.account}</Text>
      </View>
      <ProgressCircleComponent onFinishStep={onFinishStep} />
    </TouchableOpacity>
  );
});

const App = () => {
  const originData = useRef<DataInterface>();
  const [items, setItems] = useState<OtpItemInterface[]>([]);

  useEffect(() => {
    const openFileListener = eventEmitter.addListener(open_file, async path => {
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onChangeText = useCallback(
    debouce(text => {
      if (!originData.current) return;

      if (text?.length > 0) {
        setItems(
          originData.current?.services?.filter(
            y =>
              y.name.toLowerCase().includes(text.toLowerCase()) ||
              y.otp.account?.toLowerCase().includes(text.toLowerCase()),
          ),
        );
      } else setItems(originData.current?.services);
    }, 300),
    [items],
  );

  return (
    <ToastProvider>
      <View style={{flex: 1, backgroundColor: Colors.lighter}}>
        <TextInput autoFocus style={styles.input} onChangeText={onChangeText} />
        <FlatList
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyExtractor={item => item.name + item.otp.account}
          data={items}
          renderItem={({item}) => {
            return <ListItem x={item} />;
          }}
        />
      </View>
    </ToastProvider>
  );
};

export default App;
