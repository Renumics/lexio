// chunking.js
const natural = require("natural");
const { spawnSync } = require("child_process");

// Initialize Natural’s sentence tokenizer.
const sentenceTokenizer = new natural.SentenceTokenizer();

function countTokensBatch(sentences) {
  const inputJson = JSON.stringify(sentences);
  const pythonProcess = spawnSync("python3", ["tokenizer.py"], {
    input: inputJson,
    encoding: "utf-8",
    maxBuffer: 1024 * 1024,
  });

  if (pythonProcess.error) {
    console.error("Error in Python process:", pythonProcess.error);
    return sentences.map(s => s.split(/\s+/).length);
  }
  if (pythonProcess.stderr) {
    console.error("Python stderr:", pythonProcess.stderr);
  }
  
  try {
    return JSON.parse(pythonProcess.stdout);
  } catch (parseError) {
    console.error("Error parsing Python output:", parseError);
    return sentences.map(s => s.split(/\s+/).length);
  }
}

function splitIntoSentences(text) {
  return sentenceTokenizer
    .tokenize(text)
    .map(sentence => sentence.trim())
    .filter(Boolean);
}

async function groupSentenceObjectsIntoChunks(sentences, maxTokens = 500) {
  const sentenceTexts = sentences.map(s => s.text);
  const tokenCounts = countTokensBatch(sentenceTexts);
  
  const chunks = [];
  let currentChunkSentences = [];
  let currentTokenCount = 0;
  
  for (let i = 0; i < sentences.length; i++) {
    const sentenceObj = sentences[i];
    const sentenceTokenCount = tokenCounts[i];
    
    if (currentTokenCount + sentenceTokenCount > maxTokens && currentChunkSentences.length > 0) {
      chunks.push({
        text: currentChunkSentences.map(s => s.text).join(" "),
        sentences: [...currentChunkSentences]
      });
      currentChunkSentences = [];
      currentTokenCount = 0;
    }
    
    currentChunkSentences.push(sentenceObj);
    currentTokenCount += sentenceTokenCount;
  }
  
  if (currentChunkSentences.length > 0) {
    chunks.push({
      text: currentChunkSentences.map(s => s.text).join(" "),
      sentences: [...currentChunkSentences]
    });
  }
  
  console.log(`Chunk grouping complete: ${chunks.length} chunks`);
  // Log only the text of each chunk:
  // console.log("Chunk Texts:");
  // chunks.forEach((chunk, index) => {
  //   console.log(`Chunk ${index + 1}: ${chunk.text}`);
  // });
  return chunks;
}

module.exports = {
  countTokensBatch,
  splitIntoSentences,
  groupSentenceObjectsIntoChunks,
};


// //Example usage:
// (async () => {
//   const filePath = 'attention.pdf';
//   const result = await parseAndCleanPdf(filePath);

//   const chunks = await chunkBlocksAdaptive(result, 500);
//   console.log(JSON.stringify(chunks.slice(0, 5), null, 2));

// })();
