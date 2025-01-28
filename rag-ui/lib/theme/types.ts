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

export interface ComponentDefaults {
  borderRadius: string;
  padding: string;
}

export interface Theme {
  colors: Colors;
  typography: Typography;
  componentDefaults: ComponentDefaults;
}

export interface PartialTheme {
  colors: Partial<Colors>;
  typography: Partial<Typography>;
  componentDefaults: Partial<ComponentDefaults>;
}