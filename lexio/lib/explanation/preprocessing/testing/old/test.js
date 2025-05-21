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
        const visualResults = document.getElementById('visualResults');
        visualResults.innerHTML = '<h2>Visual Elements Results</h2>Loading...';
        
        // Fetch the test.pdf file
        const response = await fetch('test.pdf');
        if (!response.ok) {
            throw new Error(`Failed to load test.pdf: ${response.statusText}`);
        }
        
        const pdfBlob = await response.blob();
        const file = new File([pdfBlob], 'test.pdf', { type: 'application/pdf' });
        
        // Parse the PDF for visual elements
        const result = await parseVisualElements(file);
        
        // Display the results
        visualResults.innerHTML = '<h2>Visual Elements Results</h2>' + 
            `<pre>${JSON.stringify(result, null, 2)}</pre>`;
        
    } catch (error) {
        console.error('Error:', error);
        const errorMessage = `Error: ${error.message}\n${error.stack}`;
        document.getElementById('visualResults').innerHTML = 
            '<h2>Visual Elements Results</h2>' +
            `<pre style="color: red">${errorMessage}</pre>`;
    }
}

// Add file input handler
document.getElementById('pdfInput').addEventListener('change', async (event) => {
    try {
        const file = event.target.files[0];
        if (file) {
            const visualResults = document.getElementById('visualResults');
            visualResults.innerHTML = '<h2>Visual Elements Results</h2>Loading...';
            
            const result = await parseVisualElements(file);
            visualResults.innerHTML = 
                '<h2>Visual Elements Results</h2>' +
                `<pre>${JSON.stringify(result, null, 2)}</pre>`;
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('visualResults').innerHTML = 
            '<h2>Visual Elements Results</h2>' +
            `<pre style="color: red">${error.message}</pre>`;
    }
});

// Run the test when the page loads
window.addEventListener('load', testPdfParser);