import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateSpec } from 'tsoa';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting TypeScript to OpenAPI conversion...');

async function generateOpenAPI() {
    try {
        const specOptions = {
            entryFile: path.resolve(__dirname, '../lib/types-controller.ts'),
            noImplicitAdditionalProperties: 'throw-on-extras',
            controllerPathGlobs: [
                '../lib/*-controller.ts',
                '../lib/types.ts'
            ],
            specVersion: 3,
            outputDirectory: path.resolve(__dirname, '../../python/lexio'),
            name: "Lexio API Types",
            description: "API types for the lexio frontend library",
            version: "0.1.0",
            securityDefinitions: {},
            compilerOptions: {
                baseUrl: path.resolve(__dirname, '..'),
                experimentalDecorators: true,
                emitDecoratorMetadata: true,
                paths: {
                    "*": ["*", "lib/*"]
                }
            }
        };

        console.log('Generating OpenAPI spec...');
        const spec = await generateSpec(specOptions);

        // Create a clean OpenAPI spec with only our schemas
        const cleanSpec = {
            openapi: "3.0.0",
            info: {
                title: "Lexio API Types",
                version: "0.1.0",
                description: "API types for the lexio frontend library"
            },
            paths: {},
            components: {
                schemas: spec.components.schemas
            }
        };

        // Write the spec to a file
        const outputPath = path.resolve(__dirname, '../../python/lexio/openapi.json');
        fs.writeFileSync(outputPath, JSON.stringify(cleanSpec, null, 2));
        console.log('OpenAPI spec generated successfully!');

    } catch (error) {
        console.error('Error generating OpenAPI spec:', error);
        process.exit(1);
    }
}

generateOpenAPI(); 