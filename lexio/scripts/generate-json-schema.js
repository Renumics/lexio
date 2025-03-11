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
  defaultNumberType: 'float',
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

// Process the schema to handle special type mappings for Python
function processSchemaForPython(schema) {
  // Deep clone the schema to avoid modifying the original
  const processedSchema = JSON.parse(JSON.stringify(schema));
  
  // Function to recursively process all properties in the schema
  function processObject(obj) {
    if (!obj || typeof obj !== 'object') return;
    
    // Handle arrays
    if (Array.isArray(obj)) {
      obj.forEach(item => processObject(item));
      return;
    }
    
    // Process each property
    for (const key in obj) {
      const value = obj[key];
      
      // Handle Uint8Array type
      if (key === 'type' && value === 'Uint8Array') {
        obj[key] = 'bytes';
      }
      
      // Handle special case for union types that include Uint8Array
      if (key === 'anyOf' && Array.isArray(value)) {
        value.forEach(typeObj => {
          if (typeObj.type === 'Uint8Array') {
            typeObj.type = 'bytes';
          }
        });
      }
      
      // Handle special JSDoc annotations
      if (key === 'description' && value && typeof value === 'string') {
        // Extract Python type information from JSDoc
        const pythonTypeMatch = value.match(/@python-type\s+([^\n]+)/);
        if (pythonTypeMatch) {
          obj['x-python-type'] = pythonTypeMatch[1].trim();
        }
        
        // Look for TJS-type annotation that might indicate a special type
        const tjsTypeMatch = value.match(/@TJS-type\s+([^\n]+)/);
        if (tjsTypeMatch) {
          const tjsType = tjsTypeMatch[1].trim();
          // Handle special case for [string, bytes]
          if (tjsType === '[string, bytes]') {
            // This indicates a union type of string | bytes in Python
            obj['x-python-type'] = 'Union[str, bytes]';
          }
        }
      }
      
      // Recursively process nested objects
      if (value && typeof value === 'object') {
        processObject(value);
      }
    }
  }
  
  processObject(processedSchema);
  return processedSchema;
}

// Process the schema for Python compatibility
const pythonCompatibleSchema = processSchemaForPython(filteredSchema);

// Write the filtered schema to file
try {
  fs.writeFileSync(outputJsonPath, JSON.stringify(pythonCompatibleSchema, null, 2));
  console.log(`✅ Schema successfully written to ${outputJsonPath}`);
} catch (error) {
  console.error('Error writing schema to file:', error);
  process.exit(1);
}
