/**
 * Defines the color palette used throughout the application.
 * These colors are used for various UI elements like buttons, backgrounds, and text.
 * 
 * @interface Colors
 * @property {string} primary - Primary brand color for main actions and important UI elements. This is also the default button color.
 * @property {string} secondary - Secondary brand color for less prominent actions.
 * @property {string} background - Main application background color.
 * @property {string} secondaryBackground - Background for cards and secondary containers.
 * @property {string} toolbarBackground - Specific background color for toolbar of the Viewers.
 * @property {string} text - Primary text color for high contrast content.
 * @property {string} secondaryText - Secondary text color for less important content.
 * @property {string} lightText - Light text color for use on dark backgrounds
 * @property {string} success - Color indicating successful operations.
 * @property {string} warning - Color indicating warnings or cautionary states.
 * @property {string} error - Color indicating errors or destructive states and ErrorDisplay.
 */
export interface Colors {
  primary: string;
  secondary: string;
  background: string;
  secondaryBackground: string;
  toolbarBackground: string;
  text: string;
  secondaryText: string;
  lightText: string;
  success: string;
  warning: string;
  error: string;
}

/**
 * Defines the typography settings used throughout the application.
 * Controls the font family, base size, and line height for consistent text rendering.
 * 
 * @interface Typography
 * @property {string} fontFamily - Main font family stack for the application. The font should be imported in the global styles.
 * @property {string} fontSizeBase - Base font size from which other sizes are calculated.
 * @property {string} lineHeight - Default line height for optimal readability
 */
export interface Typography {
  fontFamily: string;
  /**
   * Base font size from which other sizes are calculated.
   * @remarks This value is used to calculate other font sizes in the application using a relative scale.
   * @alpha This feature is not yet fully implemented and may change in future versions.
   */
  fontSizeBase: string;
  lineHeight: string;
}

/**
 * Defines the spacing scale used for margins, padding, and layout gaps.
 * Provides consistent spacing values throughout the application.
 * 
 * @interface Spacing
 * @property {string} none - No spacing (0px)
 * @property {string} xs - Extra small spacing (6px)
 * @property {string} sm - Small spacing (12px)
 * @property {string} md - Medium spacing (20px)
 * @property {string} lg - Large spacing (32px)
 * @property {string} xl - Extra large spacing (48px)
 */
export interface Spacing {
  none: string;
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

/**
 * Defines the border radius scale used for rounding corners of UI elements.
 * Provides consistent border radius values throughout the application.
 * 
 * @interface BorderRadius
 * @property {string} none - No border radius (0px)
 * @property {string} sm - Small border radius (6px)
 * @property {string} md - Medium border radius (12px)
 * @property {string} lg - Large border radius (24px)
 * @property {string} xl - Extra large border radius (40px)
 */
export interface BorderRadius {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

/**
 * Main theme interface that combines all theme-related configurations.
 * Used to provide consistent styling throughout the application via ThemeProvider.
 * 
 * @interface Theme
 * @property {Colors} colors - Color palette configuration for the application.
 * @property {Typography} typography - Typography settings for consistent text rendering.
 * @property {Spacing} spacing - Spacing scale for layout consistency.
 * @property {BorderRadius} borderRadius - Border radius scale for consistent corner rounding.
 * 
 * @remarks
 * The theme is provided to the application via the RAGProvider component, which wraps the entire application.
 *
 * @example
 * ```tsx
 * import { defaultTheme, RAGProvider } from 'lexio';
 *
 * ... your code here ...
 *
 * <RAGProvider theme={defaultTheme}>
 *     ... your app components ...
 * <RAGProvider />
 * ```
 */
export interface Theme {
  colors: Colors;
  typography: Typography;
  spacing: Spacing;
  borderRadius: BorderRadius;
}
