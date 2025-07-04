import React from 'react';
import { IconButton, useColorMode, useColorModeValue } from '@chakra-ui/react';
import { LuMoon, LuSun } from 'react-icons/lu';

// Hook to toggle and return color mode
export function useColorModeUtils() {
  const { colorMode, toggleColorMode } = useColorMode();
  return {
    colorMode,
    toggleColorMode,
    colorValue: useColorModeValue('light', 'dark'),
  };
}

// Color mode toggle icon component
export function ColorModeIcon() {
  const { colorMode } = useColorMode();
  return colorMode === 'dark' ? <LuMoon /> : <LuSun />;
}

// Toggle button with icon
export const ColorModeButton = React.forwardRef((props, ref) => {
  const { toggleColorMode } = useColorMode();
  return (
    <IconButton
      onClick={toggleColorMode}
      aria-label="Toggle color mode"
      icon={<ColorModeIcon />}
      variant="ghost"
      size="sm"
      ref={ref}
      {...props}
    />
  );
});
