export type ThemeType = 'light' | 'dark';

export interface Theme {
  // 基本カラー
  background: string;
  card: string;
  text: string;
  subText: string;
  border: string;

  // プライマリカラー
  primary: string;
  primaryText: string;

  // アクセントカラー
  success: string;
  warning: string;
  danger: string;
  info: string;

  // UI要素
  button: {
    background: string;
    text: string;
    disabled: string;
  };
  input: {
    background: string;
    text: string;
    placeholder: string;
    border: string;
  };
  modal: {
    background: string;
    overlay: string;
  };
  divider: string;
} 