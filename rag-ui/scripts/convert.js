import fs from 'fs';
import TJS from 'typescript-json-schema';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const typesTsPath = path.resolve(__dirname, '../lib/types.ts');
const outputJsonPath = path.resolve(__dirname, './openapi-schema.json');

// Settings for TypeScript to JSON Schema conversion
const settings = {
  required: true,
  noExtraProps: true,
  titles: true,
  defaultNumberType: 'integer',
};

// Read TypeScript config
const compilerOptions = {
  strictNullChecks: true,
};

console.log('Starting TypeScript to OpenAPI conversion...');

// Generate JSON schema
const program = TJS.getProgramFromFiles([typesTsPath], compilerOptions);
const schema = TJS.generateSchema(program, '*', settings);

if (!schema) {
  console.error('Failed to generate JSON schema.');
  process.exit(1);
}

// List of types we want to include
const typesToInclude = [
  'RetrievalResult',
  'BaseSourceContent',
  'BaseRetrievalResult',
  'Message',
  'SourceReference',
  'TextContent',
  'MarkdownSourceContent',
  'HTMLSourceContent',
  'PDFSourceContent',
  'PDFHighlight',
  'SourceContent',
  'RetrievalResult',
  'RetrieveResponse',
  'GenerateInput',
  'GenerateResponse'
];

// Filter the schema to only include specified types
const filteredSchema = {
  $schema: schema.$schema,
  definitions: {}
};

// Copy only the types we want from the original schema
// Track which types are actually found
const foundTypes = new Set();

// First pass - add explicitly requested types
for (const type of typesToInclude) {
  if (schema.definitions && schema.definitions[type]) {
    filteredSchema.definitions[type] = schema.definitions[type];
    foundTypes.add(type);
  } else {
    console.warn(`Warning: Type "${type}" not found in schema`);
  }
}
// Second pass - check for referenced types that weren't included
// This finds any types that are referenced in our filtered schema but weren't explicitly included
const referencedTypes = new Set();
for (const def of Object.values(filteredSchema.definitions)) {
  // Look for any $ref patterns in the JSON that point to definitions
  const refs = JSON.stringify(def).match(/"\$ref":\s*"#\/definitions\/([^"]+)"/g) || [];
  refs.forEach(ref => {
    const type = ref.match(/\/([^"]+)"/)[1];
    // If we find a referenced type that wasn't in our original typesToInclude list, track it
    if (!foundTypes.has(type)) {
      referencedTypes.add(type);
    }
  });
}

// Warn about any referenced types that we didn't explicitly include
// This helps identify types that may need to be added to typesToInclude
if (referencedTypes.size > 0) {
  console.warn('Warning: The following referenced types are missing from typesToInclude:');
  referencedTypes.forEach(type => console.warn(`- ${type}`));
}

// Write the filtered schema to file
try {
  fs.writeFileSync(outputJsonPath, JSON.stringify(filteredSchema, null, 2));
  console.log(`Schema successfully written to ${outputJsonPath}`);
} catch (error) {
  console.error('Error writing schema to file:', error);
  process.exit(1);
}
