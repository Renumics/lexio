// Create a results div
const resultsDiv = document.createElement('div');
resultsDiv.id = 'results';
resultsDiv.style.whiteSpace = 'pre-wrap';
resultsDiv.style.marginTop = '20px';
resultsDiv.style.padding = '10px';
resultsDiv.style.border = '1px solid #ccc';
resultsDiv.style.borderRadius = '4px';

// Add elements to the page
document.body.appendChild(resultsDiv);

// Function to test the PDF parser
async function testPdfParser() {
    try {
        resultsDiv.textContent = 'Loading and parsing test.pdf...';
        
        // Fetch the test.pdf file
        const response = await fetch('test.pdf');
        if (!response.ok) {
            throw new Error(`Failed to load test.pdf: ${response.statusText}`);
        }
        
        const pdfBlob = await response.blob();
        const file = new File([pdfBlob], 'test.pdf', { type: 'application/pdf' });
        
        // Parse the PDF
        const result = await parsePdfWithMarker(file);
        
        // Display the results
        const output = {
            fileName: result.metadata.fileName,
            totalPages: result.metadata.numPages,
            blocks: result.blocks
        };

        resultsDiv.textContent = JSON.stringify(output, null, 2);
    } catch (error) {
        resultsDiv.textContent = `Error: ${error.message}`;
        console.error('Error:', error);
    }
}

// Run the test when the page loads
window.addEventListener('load', testPdfParser); 