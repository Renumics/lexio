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

export interface PartialTheme {
  colors: Partial<Colors>;
  typography: Partial<Typography>;
  spacing: Partial<Spacing>;
  borderRadius: Partial<BorderRadius>;
}