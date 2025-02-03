import React, { useContext } from 'react';
import { ThemeContext } from '../theme/ThemeContext';

export interface ResetWrapperProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export const ResetWrapper: React.FC<ResetWrapperProps> = ({ 
  children, 
  style,
  className 
}) => {
  const themeContext = useContext(ThemeContext);
  if (!themeContext) {
    throw new Error('ThemeContext is undefined');
  }
  const { typography } = themeContext.theme;

  return (
    <div 
      className={className}
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
        // Make background transparent
        background: 'transparent',
        backgroundColor: 'transparent',
        // Allow style overrides
        ...style,
      }}
    >
      {children}
    </div>
  );
};