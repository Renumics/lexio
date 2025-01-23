import fs from 'fs';
import TJS from 'typescript-json-schema';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const typesTsPath = path.resolve(__dirname, '../lib/types.ts');
const typesToIncludePath = path.resolve(__dirname, './types-to-include.json');
const outputJsonPath = path.resolve(__dirname, './types.json');

// Settings for TypeScript to JSON Schema conversion
const settings = {
  required: true,
  noExtraProps: true,
  titles: true,
  defaultNumberType: 'integer',
  description: true,

  annotations: true,     // Includes @annotations from JSDoc
  examples: true,        // Includes @example from JSDoc
  propOrder: true,       // Preserves property order from the interface
  ref: true,            // Allows generating $ref references
  aliasRef: true,       // Handles type aliases correctly
  topRef: true,         // Adds definitions to the top of the schema
  jsDoc: "extended",    // Includes all JSDoc annotations
  defaultProps: true,   // Includes default values
  strictTuples: true,   // Generates proper tuple types
};

// Read TypeScript config
const compilerOptions = {
  strictNullChecks: true,
};

console.log('Starting TS Types to JSON Schema conversion...');

// Generate JSON schema
const program = TJS.getProgramFromFiles([typesTsPath], compilerOptions);
const schema = TJS.generateSchema(program, '*', settings);

if (!schema) {
  console.error('Failed to generate JSON schema.');
  process.exit(1);
}

// List of types we want to include - read this from hardcoded file
let typesToInclude = [];
try {
  const data = fs.readFileSync(typesToIncludePath, 'utf-8');
  const parsedData = JSON.parse(data);
  
  if (parsedData.typesToInclude && Array.isArray(parsedData.typesToInclude)) {
    typesToInclude = parsedData.typesToInclude;
  } else {
    throw new Error('types-to-include.json should contain an array of type names under the key "typesToInclude".');
  }
} catch (error) {
  console.error('Error reading types to include:', error.message);
  process.exit(1);
}

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
    console.warn(`Error: Type "${type}" not found in schema`);
    process.exit(1);
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
  referencedTypes.forEach(type => console.error(`- ${type}`));
}

// Write the filtered schema to file
try {
  fs.writeFileSync(outputJsonPath, JSON.stringify(filteredSchema, null, 2));
  console.log(`Schema successfully written to ${outputJsonPath}`);
} catch (error) {
  console.error('Error writing schema to file:', error);
  process.exit(1);
}
