import {NativeEventEmitter, NativeModules} from 'react-native-macos';

const eventEmitter = new NativeEventEmitter(NativeModules.MyClipboardModule);
const MyClipboardModule = NativeModules.MyClipboardModule;
const {open_file} = MyClipboardModule.getConstants();

export {MyClipboardModule, eventEmitter, open_file};
