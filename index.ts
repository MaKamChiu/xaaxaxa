import { registerRootComponent } from 'expo';
import './i18n';  // 確保 i18n 在所有組件前引入
import App from './App';

// 註冊根組件
registerRootComponent(App);