import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ScrollView, Text, View, TouchableOpacity, TextInput, StyleSheet} from 'react-native-macos';
import {getToken} from './utils';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {MyClipboardModule as Clipboard, eventEmitter, open_file} from './module';
import debouce from 'lodash/debounce';
import {ProgressCircleComponent} from './AnimatedProgressCircle';
import {useAuthStore} from './store';
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

const ListItem = ({x}: {x: OtpItemInterface}) => {
  const currentTimestamp = useAuthStore(s => s.currentTimestamp);
  const toast = useToast();

  const otp = useMemo(() => {
    return getToken(x.secret, currentTimestamp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Math.floor(currentTimestamp / 1000 / 30), x.secret]);

  return (
    <TouchableOpacity
      activeOpacity={0.5}
      style={styles.itemContainer}
      onPress={async () => {
        const result = await Clipboard.setString(otp);
        toast.hideAll();
        toast.show(result);
      }}>
      <>
        <View>
          <Text style={{fontSize: 18}}>{x.name}</Text>
          <Text style={{fontSize: 32}}>{otp}</Text>
          <Text style={{fontSize: 18}}>{x.otp.account}</Text>
        </View>
        <ProgressCircleComponent />
      </>
    </TouchableOpacity>
  );
};

const App = () => {
  const originData = useRef<DataInterface>();
  const [items, setItems] = useState<OtpItemInterface[]>([]);
  const init = useAuthStore(s => s.init);

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

  useEffect(() => {
    init();
  }, [init]);

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
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={styles.scroll}>
          {items?.map(x => {
            return <ListItem key={x.name + x.otp.account} x={x} />;
          })}
        </ScrollView>
      </View>
    </ToastProvider>
  );
};

export default App;
