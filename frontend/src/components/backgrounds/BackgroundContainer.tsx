import React from 'react';
import type { BackgroundTheme, BackgroundProps } from './types';
import CherryBlossomBackground from './CherryBlossomBackground';
import StarryNightBackground from './StarryNightBackground';
import RainyDayBackground from './RainyDayBackground';
import CloudyBackground from './CloudyBackground';
import SunnyBackground from './SunnyBackground';
import SnowyBackground from './SnowyBackground';
import CatsBackground from './CatsBackground';

interface BackgroundContainerProps {
  theme?: BackgroundTheme;
  isDark: boolean;
  enablePetals?: boolean;
}

const BackgroundContainer: React.FC<BackgroundContainerProps> = ({ 
  theme = 'cherry-blossom', 
  isDark, 
  enablePetals = true 
}) => {
  const props: BackgroundProps = { theme, isDark, enablePetals };

  // If dark mode is ON, ALWAYS show Starry Night
  if (isDark) {
    return <StarryNightBackground {...props} />;
  }

  // In light mode, show the selected theme
  const backgrounds: Record<BackgroundTheme, React.ReactElement> = {
    'cherry-blossom': <CherryBlossomBackground {...props} />,
    'starry-night': <StarryNightBackground {...props} />,
    'rainy-day': <RainyDayBackground {...props} />,
    'cloudy': <CloudyBackground {...props} />,
    'sunny': <SunnyBackground {...props} />,
    'snowy': <SnowyBackground {...props} />,
    'cats': <CatsBackground {...props} />,
  };

  return backgrounds[theme] || backgrounds['cherry-blossom'];
};

export default BackgroundContainer;