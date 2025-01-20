export interface Colors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
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
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface Theme {
  colors: Colors;
  typography: Typography;
  spacing: Spacing;
}