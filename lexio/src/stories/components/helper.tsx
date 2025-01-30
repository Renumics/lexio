import {extractComponentDescription} from "@storybook/docs-tools";

export const extractComponentDescriptionHelper = (component: any, { notes }: { notes: any }): string => {
    // Use Storybook's default extractor
    let description = extractComponentDescription(component, { notes });

    if (description) {
        // Customize the description by filtering unwanted TSDoc decorators
        description = description
            .split('\n') // Split lines
            .filter(line =>
                !line.startsWith('@param') &&  // Remove @param tags
                !line.startsWith('@component') &&  // Remove @param tags
                !line.startsWith('@remarks') &&  // Remove @param tags
                !line.startsWith('@example') &&  // Remove @param tags
                !line.startsWith('@todo') &&  // Remove @param tags
                !line.startsWith('@returns')   // Remove @returns tags
            )
            .join('\n'); // Rejoin the lines
    }

    return description || ""; // Return modified description
};