
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
  contrast: string;
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
   */
  fontSizeBase: string;
  lineHeight: string;
}

/**
 * Defines the default styling for components in the application.
 * These values are used to provide consistent padding and border radius for components.
 *
 * @interface ComponentDefaults
 * @property {string} borderRadius - Default border radius for components.
 * @property {string} padding - Default padding for components.
 */
export interface ComponentDefaults {
  borderRadius: string;
  padding: string;
}

/**
 * Main theme interface that combines all theme-related configurations.
 * Used to provide consistent styling throughout the application via ThemeProvider.
 * 
 * @interface Theme
 * @property {Colors} colors - Color palette configuration for the application.
 * @property {Typography} typography - Typography settings for consistent text rendering.
 * @property {ComponentDefaults} componentDefaults - Component defaults for consistent styling.
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
  componentDefaults: ComponentDefaults;
}

/**
 * Partial theme interface that allows for partial overrides of the main theme configuration.
 *
 * @interface PartialTheme
 * @property {Partial<Colors>} colors - Partial color palette configuration for the application.
 * @property {Partial<Typography>} typography - Partial typography settings for consistent text rendering.
 * @property {Partial<ComponentDefaults>} componentDefaults - Partial component defaults for consistent styling.
 */
export interface PartialTheme {
  colors: Partial<Colors>;
  typography: Partial<Typography>;
  componentDefaults: Partial<ComponentDefaults>;
}
