export interface Colors {
  primary: string;
  secondary: string;
  background: string;
  secondaryBackground: string;
  toolbarBackground: string;
  text: string;
  secondaryText: string;
  success: string;
  warning: string;
  error: string;
}

export interface Typography {
  fontFamily: string;
  fontSizeBase: string;
  lineHeight: string;
}

export interface Spacing {
  none: string;
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface BorderRadius {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface Theme {
  colors: Colors;
  typography: Typography;
  spacing: Spacing;
  borderRadius: BorderRadius;
}