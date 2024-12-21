import { Theme } from './types';

export const lightTheme: Theme = {
  // 基本カラー
  background: '#F2F2F7',
  card: '#FFFFFF',
  text: '#000000',
  subText: '#666666',
  border: '#E0E0E0',

  // プライマリカラー
  primary: '#007AFF',
  primaryText: '#FFFFFF',

  // アクセントカラー
  success: '#34C759',
  warning: '#FF9500',
  danger: '#FF3B30',
  info: '#5856D6',

  // UI要素
  button: {
    background: '#F2F2F7',
    text: '#000000',
    disabled: '#999999',
  },
  input: {
    background: '#F2F2F7',
    text: '#000000',
    placeholder: '#999999',
    border: '#E0E0E0',
  },
  modal: {
    background: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  divider: '#E0E0E0',
};

export const darkTheme: Theme = {
  // 基本カラー
  background: '#000000',
  card: '#1C1C1E',
  text: '#FFFFFF',
  subText: '#999999',
  border: '#38383A',

  // プライマリカラー
  primary: '#0A84FF',
  primaryText: '#FFFFFF',

  // アクセントカラー
  success: '#30D158',
  warning: '#FF9F0A',
  danger: '#FF453A',
  info: '#5E5CE6',

  // UI要素
  button: {
    background: '#2C2C2E',
    text: '#FFFFFF',
    disabled: '#666666',
  },
  input: {
    background: '#2C2C2E',
    text: '#FFFFFF',
    placeholder: '#666666',
    border: '#38383A',
  },
  modal: {
    background: '#2C2C2E',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
  divider: '#38383A',
}; 