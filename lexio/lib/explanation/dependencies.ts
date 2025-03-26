/**
 * Dynamically loads the compromise library.
 * @throws Error if compromise is not installed
 */
export async function loadCompromise() {
  try {
    const compromise = await import('compromise');
    return compromise.default;
  } catch (error) {
    throw new Error(
      'Explainability features require the compromise library. Please install it:\n' +
      'npm install compromise\n' +
      'or\n' +
      'yarn add compromise'
    );
  }
}

/**
 * Dynamically loads the js-tiktoken library.
 * @throws Error if js-tiktoken is not installed
 */
export async function loadTiktoken() {
  try {
    const tiktoken = await import('js-tiktoken');
    return tiktoken;
  } catch (error) {
    throw new Error(
      'Token counting features require the js-tiktoken library. Please install it:\n' +
      'npm install js-tiktoken\n' +
      'or\n' +
      'yarn add js-tiktoken'
    );
  }
}

/**
 * Dynamically loads the sbd (sentence boundary detection) library.
 * @throws Error if sbd is not installed
 */
export async function loadSbd() {
  try {
    const sbd = await import('sbd');
    return sbd.default;
  } catch (error) {
    throw new Error(
      'Sentence boundary detection features require the sbd library. Please install it:\n' +
      'npm install sbd\n' +
      'or\n' +
      'yarn add sbd'
    );
  }
} 