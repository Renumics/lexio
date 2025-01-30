import type { Preview } from "@storybook/react";
import * as DocBlocks from "@storybook/blocks";

const preview: Preview = {
  parameters: {
    layout: 'padded',
      backgrounds: {
          values: [
            // 👇 Default values
            { name: 'Dark', value: '#333' },
            { name: 'Light', value: 'rgba(217,230,232,0.55)' },
            // 👇 Add your own
            { name: 'Grid', grid: {
                cellSize: 20,
                opacity: 1.0,
                cellAmount: 5,
                offsetX: 16, // Default is 0 if story has 'fullscreen' layout, 16 if layout is 'padded'
                offsetY: 16, // Default is 0 if story has 'fullscreen' layout, 16 if layout is 'padded'
              },},
          ],
          // 👇 Specify which background is shown by default
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
