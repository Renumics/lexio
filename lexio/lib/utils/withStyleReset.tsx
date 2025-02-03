import React, { useContext } from 'react';
import { ThemeContext } from '../theme/ThemeContext';

interface ResetWrapperProps {
  wrapperStyle?: React.CSSProperties;
  className?: string;
}

/**
 * Higher-Order Component that wraps any component with style reset
 */
export function withStyleReset<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P & ResetWrapperProps> {
  return function ResetWrapper({ wrapperStyle, className, ...props }: P & ResetWrapperProps) {
    const themeContext = useContext(ThemeContext);
    if (!themeContext) {
      throw new Error('ThemeContext is undefined');
    }
    const { typography } = themeContext.theme;

    return (
      <div 
        className={`w-full h-full ${className || ''}`} 
        style={{
          // Base reset styles
          all: 'initial',
          display: 'block',
          boxSizing: 'border-box',
          width: '100%',
          height: '100%',
          // Theme defaults
          fontFamily: typography.fontFamily,
          fontSize: typography.fontSizeBase,
          lineHeight: typography.lineHeight,
          // Text resets
          textDecoration: 'none',
          textDecorationLine: 'none',
          textDecorationColor: 'inherit',
          textDecorationThickness: '0',
          textUnderlineOffset: '0',
          textTransform: 'none',
          letterSpacing: 'normal',
          wordSpacing: 'normal',
          textAlign: 'left',
          textShadow: 'none',
          // Webkit specific resets
          WebkitTextDecorationLine: 'none',
          WebkitTextFillColor: 'currentColor',
          WebkitTextStrokeWidth: '0',
          WebkitTapHighlightColor: 'transparent',
          WebkitFontSmoothing: 'antialiased',
          // Additional resets
          border: 'none',
          borderStyle: 'none',
          borderWidth: '0',
          borderColor: 'transparent',
          // Allow style overrides
          ...wrapperStyle,
        }}
      >
        <WrappedComponent {...(props as P)} />
      </div>
    );
  };
}