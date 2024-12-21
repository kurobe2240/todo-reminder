import { Animated, Easing } from 'react-native';

// テーマ切り替えアニメーション
export const createThemeTransition = (initialValue: number = 0) => {
  const animation = new Animated.Value(initialValue);

  const startAnimation = (toValue: number, duration: number = 300) => {
    Animated.timing(animation, {
      toValue,
      duration,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  return { animation, startAnimation };
};

// リスト項目のフェードインアニメーション
export const createFadeInAnimation = (delay: number = 0) => {
  const opacity = new Animated.Value(0);

  const startAnimation = () => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      delay,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  return { opacity, startAnimation };
};

// スケールアニメーション
export const createScaleAnimation = (initialValue: number = 1) => {
  const scale = new Animated.Value(initialValue);

  const startAnimation = (toValue: number, duration: number = 150) => {
    Animated.spring(scale, {
      toValue,
      speed: 12,
      bounciness: 8,
      useNativeDriver: true,
    }).start();
  };

  return { scale, startAnimation };
};

// スライドアニメーション
export const createSlideAnimation = (initialValue: number = 0) => {
  const translateY = new Animated.Value(initialValue);

  const startAnimation = (toValue: number, duration: number = 300) => {
    Animated.timing(translateY, {
      toValue,
      duration,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  return { translateY, startAnimation };
}; 