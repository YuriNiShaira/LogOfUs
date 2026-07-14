export type BackgroundTheme = 'cherry-blossom' | 'starry-night' | 'rainy-day' | 'cloudy' | 'sunny' | 'snowy' | 'cats';

export interface BackgroundProps {
  theme: BackgroundTheme;
  isDark: boolean;
  enablePetals?: boolean;
}