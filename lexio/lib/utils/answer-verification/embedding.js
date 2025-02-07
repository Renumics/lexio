// embedding.js
require('dotenv').config({ override: true });
const fs = require("fs");
const path = require("path");
const OpenAI = require('openai');
const nlp = require('compromise');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const EMBEDDINGS_DIR = path.join(__dirname, 'embeddings');
const EMBEDDINGS_FILE = path.join(EMBEDDINGS_DIR, 'embeddings.json');

if (!fs.existsSync(EMBEDDINGS_DIR)) {
  fs.mkdirSync(EMBEDDINGS_DIR, { recursive: true });
  console.log(`Created directory: ${EMBEDDINGS_DIR}`);
}

async function getEmbedding(chunk) {
  try {
    // Always normalize before getting embedding
    const normalizedChunk = normalizeForEmbedding(chunk);
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: [normalizedChunk],
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error("Error getting embedding:", error);
    return null;
  }
}

function normalizeForEmbedding(text) {
  if (!text || typeof text !== 'string') {
    console.warn('Invalid input provided to normalizeForEmbedding');
    return '';
  }
  let doc = nlp(text);
  doc.contractions().expand();
  // Additional normalization steps
  let cleanedText = doc.out('text')
    .replace(/\s+/g, ' ')           // Normalize whitespace
    .trim()                         // Remove leading/trailing whitespace
    .toLowerCase();                 // Convert to lowercase for consistency
  return cleanedText;
}

function saveEmbeddingsToFile(embeddings) {
  fs.writeFileSync(EMBEDDINGS_FILE, JSON.stringify(embeddings, null, 2));
  console.log(`Embeddings saved to ${EMBEDDINGS_FILE}`);
}

function loadEmbeddingsFromFile() {
  if (fs.existsSync(EMBEDDINGS_FILE)) {
    console.log(`Loading embeddings from ${EMBEDDINGS_FILE}`);
    return JSON.parse(fs.readFileSync(EMBEDDINGS_FILE, "utf8"));
  }
  return null;
}

async function generateEmbeddingsForChunks(chunks, concurrency = 5) {
  let chunkEmbeddings = loadEmbeddingsFromFile();

  if (chunkEmbeddings) {
    console.log("Using cached embeddings.");
    chunkEmbeddings = chunkEmbeddings.filter(({ chunk, embedding }) =>
      chunk && typeof chunk.text === "string" && chunk.text.trim() !== "" &&
      Array.isArray(embedding) && embedding.length === 1536
    );
    console.log(`Cleaned up embeddings. Remaining valid embeddings: ${chunkEmbeddings.length}`);
    return chunkEmbeddings;
  }

  if (!chunkEmbeddings || chunkEmbeddings.length === 0) {
    console.log(`Generating embeddings for ${chunks.length} chunks...`);
    chunkEmbeddings = [];

    const totalChunks = chunks.length;
    let index = 0;
    const MAX_CHARS = 5000;

    while (index < totalChunks) {
      const batch = chunks.slice(index, index + concurrency);
      console.log(`Processing batch ${index + 1}-${Math.min(index + concurrency, totalChunks)} of ${totalChunks}...`);

      const results = await Promise.all(
        batch.map(async (chunkObj, i) => {
          const chunk = typeof chunkObj === "string" ? chunkObj : chunkObj.text;
          if (!chunk || typeof chunk !== "string" || chunk.trim() === "") {
            console.error(`❌ Skipping empty or invalid chunk at index: ${index + i}`);
            return null;
          }

          let processedChunk = chunk;
          if (chunk.length > MAX_CHARS) {
            console.warn(`⚠️ Truncating chunk at index ${index + i} from ${chunk.length} to ${MAX_CHARS} characters`);
            processedChunk = chunk.slice(0, MAX_CHARS);
          }

          console.log(`Generating embedding for chunk ${index + i + 1}/${totalChunks}`);
          let embedding = await getEmbedding(processedChunk);

          if (!embedding) {
            console.warn(`Retrying embedding for chunk ${index + i + 1}/${totalChunks}...`);
            embedding = await getEmbedding(processedChunk);
          }

          if (!embedding) {
            console.error(`❌ Failed to get embedding for chunk: "${processedChunk.slice(0, 50)}..."`);
            return null;
          }

          // Store both original and normalized versions
          return {
            chunk: {
              ...chunkObj,
              original: chunk,
              normalized: normalizeForEmbedding(chunk)
            },
            embedding
          };
        })
      );

      chunkEmbeddings.push(...results.filter(Boolean));

      if (index % (concurrency * 2) === 0) {
        saveEmbeddingsToFile(chunkEmbeddings);
      }

      index += concurrency;
    }

    saveEmbeddingsToFile(chunkEmbeddings);
  }

  return chunkEmbeddings;
}

module.exports = {
  getEmbedding,
  normalizeForEmbedding,
  generateEmbeddingsForChunks,
};