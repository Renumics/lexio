const path = require('path');

const PDF_DIR = path.join(__dirname, 'sources');  

//const PDF_FILE_NAME = 'attention.pdf';  
const PDF_FILE_NAME = 'Googles_Quantum_Supremacy_Paper.pdf';        

module.exports = {
  EMBEDDINGS_FILE: 'embeddings.json',
  MAX_TOKENS: 500,
  CONCURRENCY: 5,
  MAX_CHARS: 5000,
  OPENAI_EMBEDDING_MODEL: "text-embedding-ada-002",
  
  PDF_FILE_PATH: path.join(PDF_DIR, PDF_FILE_NAME),
  
  // FINAL_ANSWER: "In Attention Is All You Need, the authors introduce the Transformer—a novel architecture that depends entirely on self-attention to process both inputs and outputs. By removing recurrence and convolution, the Transformer trains faster and achieves state-of-the-art results on machine translation tasks such as English-to-German and English-to-French."
  //FINAL_ANSWER: "The Transformer model, introduced by Vaswani et al., replaces recurrence and convolution with self-attention mechanisms, significantly improving training speed and translation accuracy."
  FINAL_ANSWER: "Google demonstrated quantum supremacy by executing a calculation on a superconducting qubit processor that would take classical supercomputers thousands of years.",
  IDEA_SPLITTING_METHOD: "llm", ///"heuristic" or "dependency" or "llm"
};
