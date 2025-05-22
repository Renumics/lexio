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

// Import the intersection function
const { findIntersections } = require('./intersection');

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

// Function to display intersection results
function displayIntersectionResults(intersectionResults) {
    const visualResults = document.getElementById('visualResults');
    
    // Create a summary section
    const summary = document.createElement('div');
    summary.innerHTML = `
        <h3>Intersection Analysis Results</h3>
        <p>Total Intersections: ${intersectionResults.totalIntersections}</p>
        <p>Affected Pages: ${intersectionResults.affectedPages.join(', ')}</p>
        <p>Visual Elements Processed: ${intersectionResults.visualElementsProcessed}</p>
    `;
    
    // Create a table for detailed results
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.marginTop = '20px';
    
    // Add table header
    const header = table.createTHead();
    const headerRow = header.insertRow();
    ['Page', 'Text', 'Position', 'Visual Elements'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        th.style.padding = '8px';
        th.style.borderBottom = '2px solid #ddd';
        headerRow.appendChild(th);
    });
    
    // Add intersection details
    const tbody = table.createTBody();
    intersectionResults.intersections.forEach(intersection => {
        const row = tbody.insertRow();
        
        // Add cells
        [
            intersection.pageNumber,
            intersection.text,
            `(${intersection.position.left.toFixed(2)}, ${intersection.position.top.toFixed(2)})`,
            `${intersection.visualElements.length} element(s)`
        ].forEach(text => {
            const cell = row.insertCell();
            cell.textContent = text;
            cell.style.padding = '8px';
            cell.style.borderBottom = '1px solid #ddd';
        });
    });
    
    // Clear previous results and add new content
    visualResults.innerHTML = '<h2>Intersection Analysis</h2>';
    visualResults.appendChild(summary);
    visualResults.appendChild(table);
}

// Function to load and process the intersection analysis
async function loadIntersectionAnalysis() {
    try {
        // Get the visual elements
        const visualElementsResponse = await fetch('visualElements2.json');
        const visualElements = await visualElementsResponse.json();
        
        // Get the text content
        const textContentResponse = await fetch('traffic.textContent.json');
        const textContent = await textContentResponse.json();
        
        // Find intersections
        const intersectionResults = findIntersections(visualElements, textContent);
        
        // Display results
        displayIntersectionResults(intersectionResults);

    } catch (error) {
        console.error('Error:', error);
        document.getElementById('visualResults').innerHTML = `
            <h2>Intersection Analysis</h2>
            <div class="error">
                Error: ${error.message}
            </div>`;
    }
}

// Load intersection analysis when the page loads
window.addEventListener('load', loadIntersectionAnalysis);