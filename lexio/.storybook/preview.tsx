import type { Preview } from "@storybook/react";
import * as DocBlocks from "@storybook/blocks";

const preview: Preview = {
  parameters: {
    layout: 'padded',
    backgrounds: {
      values: [
          // 👇 Default values
          {name: 'Dark', value: '#333'},
          {name: 'Light', value: 'rgba(17,161,197,0.15)'},
      ],
      default: 'Light',
    },
    options: {
      storySort: {
        order: ['Welcome', 'Concepts', 'Components', "*", "Gallery"],
      },
    },
    docs: {
      page: () => (
          <>
            <DocBlocks.Title />
            <DocBlocks.Description />
            <DocBlocks.Subtitle />
            <DocBlocks.Primary />
            <DocBlocks.Controls />
          </>
      ),
      toc: false, // Enables the table of contents on docs pages
      canvas: {
        layout: 'fullscreen',
        sourceState: 'none',
        withToolbar: false,
      },
      controls: {
          sort: 'alpha'
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
