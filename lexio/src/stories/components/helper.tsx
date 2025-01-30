import {extractComponentDescription} from "@storybook/docs-tools";
import * as DocBlocks from "@storybook/blocks";

export const renderDocsBlocks = () => {
  return (
    <>
      <DocBlocks.Title/>
      <h2>Description:</h2>
      <DocBlocks.Description/>
      <h2>Component Preview:</h2>
      <DocBlocks.Primary/>
      <h2>Props:</h2>
      <DocBlocks.Controls/>
    </>
  )
}

export const configureDocsRendering = () => {
  return ({
    parameters: {
      docs: {
        page: renderDocsBlocks,
      },
    }
  });
}

export const extractComponentDescriptionHelper = (component: any, { notes }: { notes: any }): string => {
    // Use Storybook's default extractor
    let description = extractComponentDescription(component, { notes });

    if (description) {
        // Customize the description by filtering unwanted TSDoc decorators
        description = description
            .split('\n') // Split lines
            .map(line => 
                line.startsWith('@example') 
                    ? line.replace('@example', '**Example:**') 
                    : line
            )
            .filter(line =>
                !line.startsWith('@param') &&
                !line.startsWith('@component') &&
                !line.startsWith('@remarks') &&
                !line.startsWith('@todo') &&
                !line.startsWith('@returns')
            )
            .join('\n'); // Rejoin the lines
    }

    return description || ""; // Return modified description
};