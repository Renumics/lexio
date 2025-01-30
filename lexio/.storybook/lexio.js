import { create } from '@storybook/theming';
import logo from '../src/stories/assets/lexio logo transparent.png';

export default create({
  base: 'light',
  brandTitle: 'Lexio UI',
  brandUrl: 'https://renumics.com/lexio-ui',
  brandImage: logo,
  brandTarget: '_self',
});