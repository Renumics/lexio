import { addons } from '@storybook/manager-api';
import yourTheme from './lexio';
 
addons.setConfig({
  theme: yourTheme,
  showPanel: false, // Hides the bottom panel
  showToolbar: false, // Hides the toolbar
  enableShortcuts: false, // Completely disables all keyboard shortcuts
});