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

function createVisualElementsTable(elements) {
    const table = document.createElement('table');
    
    // Create header
    const header = table.createTHead();
    const headerRow = header.insertRow();
    ['Type', 'Page', 'Position (x, y)', 'Size (w × h)', 'Operator Info'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
    });

    // Create body
    const tbody = table.createTBody();
    elements.forEach(elem => {
        const row = tbody.insertRow();
        const cells = [
            elem.type,
            elem.pageNumber,
            `(${elem.boundingBox.x}, ${elem.boundingBox.y})`,
            `${elem.boundingBox.width} × ${elem.boundingBox.height}`,
            `${elem.operatorInfo.operator} [${elem.operatorInfo.args.join(', ')}]`
        ];

        cells.forEach((text, index) => {
            const cell = row.insertCell();
            cell.textContent = text;
            if (elem.type === 'Image') {
                cell.style.backgroundColor = '#e6f3ff';
            } else if (elem.type === 'FormXObject') {
                cell.style.backgroundColor = '#fff0e6';
            }
        });
    });

    return table;
}

// Function to handle PDF analysis
async function analyzePDF(file) {
    try {
        const visualResults = document.getElementById('visualResults');
        visualResults.innerHTML = '<h2>PDF Analysis</h2>Loading...';
        
        const result = await parseVisualElements(file);
        
        // Create a formatted JSON view
        const jsonView = document.createElement('pre');
        jsonView.textContent = JSON.stringify(result, null, 2);

        visualResults.innerHTML = '<h2>PDF Analysis Results</h2>';
        visualResults.appendChild(jsonView);

    } catch (error) {
        console.error('Error:', error);
        visualResults.innerHTML = `
            <h2>PDF Analysis</h2>
            <div class="error">
                Error: ${error.message}
            </div>`;
    }
}

// Handle file input changes
document.getElementById('pdfInput').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (file) {
        await analyzePDF(file);
    }
});

// Load test.pdf when the page loads
window.addEventListener('load', async () => {
    try {
        const response = await fetch('test.pdf');
        if (!response.ok) {
            throw new Error(`Failed to load test.pdf: ${response.statusText}`);
        }
        
        const pdfBlob = await response.blob();
        const file = new File([pdfBlob], 'test.pdf', { type: 'application/pdf' });
        
        await analyzePDF(file);
    } catch (error) {
        console.error('Error loading test PDF:', error);
        document.getElementById('visualResults').innerHTML = `
            <h2>Visual Elements Analysis</h2>
            <div class="error">
                Failed to load test.pdf automatically. Please select a PDF file manually.
            </div>`;
    }
});