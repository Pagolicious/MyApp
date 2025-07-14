/**
 * @format
 */
globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;

import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
