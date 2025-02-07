// pdfParser.js
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

async function parsePdfWithMarker(filePath) {
  console.log(`Parsing PDF using Marker: ${filePath}`);
  const outputDir = "marker";
  
  const markerArgs = [
    filePath,
    "--output_dir", outputDir,
    "--output_format", "json",
    "--paginate_output",
    //"--quiet"
  ];
  
  const markerProcess = spawnSync(
    "marker_single", 
    markerArgs,
    {
      encoding: "utf-8",
    }
  );

  if (markerProcess.error) {
    throw new Error(`Failed to run Marker: ${markerProcess.error.message}`);
  }
  
  if (markerProcess.stderr) {
    console.error("Marker stderr:", markerProcess.stderr);
  }

  let markerOutput = null;
  
  // Try to extract JSON from stdout
  const stdoutText = markerProcess.stdout;
  const jsonStartIndex = stdoutText.indexOf('{');
  if (jsonStartIndex !== -1) {
    try {
      const jsonString = stdoutText.slice(jsonStartIndex);
      markerOutput = JSON.parse(jsonString);
    } catch (err) {
      console.error("Error parsing JSON from stdout:", err);
    }
  } else {
    console.error("No JSON found in Marker stdout.");
  }
  
  // If we didn't get JSON from stdout, fallback to reading an output file.
  if (!markerOutput) {
    const basename = path.basename(filePath, path.extname(filePath));
    const possiblePaths = [
      path.join(outputDir, basename, `${basename}.json`),
      path.join(outputDir, `${basename}.json`)
    ];
    
    let foundPath = null;
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        foundPath = p;
        break;
      }
    }
    
    if (!foundPath) {
      throw new Error(`Marker did not produce an output JSON file in any of these locations: ${possiblePaths.join(', ')}`);
    }
    
    const markerFileContents = fs.readFileSync(foundPath, "utf-8");
    try {
      markerOutput = JSON.parse(markerFileContents);
    } catch (err) {
      throw new Error(`Error parsing Marker JSON file: ${err.message}`);
    }
  }
  
  return {
    blocks: markerOutput,  // the entire document JSON
    metadata: markerOutput.metadata || {}
  };
}

function cleanAndSplitText(rawBlocks, metadata) {
  const inputJson = JSON.stringify({ rawBlocks, metadata });
  const pythonProcess = spawnSync("python3", ["clean_and_split.py"], {
    input: inputJson,
    encoding: "utf-8",
  });

  if (pythonProcess.error) {
    throw new Error(`Failed to start Python script: ${pythonProcess.error.message}`);
  }
  if (pythonProcess.stderr) {
    console.error("Python stderr:", pythonProcess.stderr);
  }
  try {
    return JSON.parse(pythonProcess.stdout);
  } catch (parseError) {
    console.error("Error parsing Python output:", parseError);
    throw new Error("Failed to process text with Python script.");
  }
}

async function parseAndCleanPdf(filePath) {
  const { blocks, metadata } = await parsePdfWithMarker(filePath);
  if (!blocks) {
    console.error("Parsed data is empty. Skipping cleaning.");
    return [];
  }
  return cleanAndSplitText(blocks, metadata);
}

module.exports = {
  parseAndCleanPdf,
};

  
  // // Example usage:
  // (async () => {
  //   const filePath = 'attention.pdf';
  //   try {
  //     const result = await parseAndCleanPdf(filePath);
  //     console.log(JSON.stringify(result.slice(0, 30), null, 2));
  //   } catch (error) {
  //     console.error("Error processing PDF:", error);
  //   }
  // })();