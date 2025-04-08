// Initialize CodeMirror editors
let htmlEditor = CodeMirror.fromTextArea(document.getElementById('htmlEditor'), {
    mode: 'htmlmixed',
    theme: 'monokai',
    lineNumbers: true,
    autoCloseTags: true,
    autoCloseBrackets: true,
    indentUnit: 4
});

let cssEditor = CodeMirror.fromTextArea(document.getElementById('cssEditor'), {
    mode: 'css',
    theme: 'monokai',
    lineNumbers: true,
    autoCloseBrackets: true,
    indentUnit: 4
});

let jsEditor = CodeMirror.fromTextArea(document.getElementById('jsEditor'), {
    mode: 'javascript',
    theme: 'monokai',
    lineNumbers: true,
    autoCloseBrackets: true,
    indentUnit: 4
});

// Function to format HTML with proper indentation
function formatHTML(html) {
    let formatted = '';
    let indent = 0;
    const tab = '    '; // 4 spaces for indentation
    
    // Helper function to add newline and indent
    const newLine = () => '\n' + tab.repeat(indent);
    
    // Remove existing whitespace between tags
    html = html.replace(/>\s+</g, '><');
    
    // Process each character
    for (let i = 0; i < html.length; i++) {
        const char = html[i];
        
        if (char === '<') {
            const isClosing = html[i + 1] === '/';
            const isSelfClosing = html[i + 1] !== '/' && html[i - 1] !== '/';
            
            // Check if it's a closing tag
            if (isClosing) {
                indent--;
                if (formatted[formatted.length - 1] !== '\n') {
                    formatted += newLine();
                }
            } else if (formatted && isSelfClosing) {
                formatted += newLine();
            }
            
            formatted += '<';
        } else if (char === '>') {
            formatted += '>';
            
            // Check if the next char is not a closing tag
            if (i + 1 < html.length && html[i + 1] !== '<' && html[i + 1] !== '/') {
                formatted += newLine();
            }
            
            // Increase indent for opening tags
            if (html[i - 1] !== '/' && html[i - 1] !== '-' && i > 0) {
                const isClosing = html[i - 1] === '/';
                if (!isClosing) indent++;
            }
        } else {
            formatted += char;
        }
    }
    
    return formatted;
}

document.addEventListener('DOMContentLoaded', () => {
    // Create paste area first
    const pasteArea = document.createElement('div');
    pasteArea.className = 'paste-area';
    pasteArea.innerHTML = `
        <div class="paste-container">
            <h2>Paste Extracted Content Here</h2>
            <textarea id="pasteInput" placeholder="Paste your extracted content here..."></textarea>
        </div>
    `;
    
    // Insert paste area
    const container = document.querySelector('.container');
    container.insertBefore(pasteArea, container.firstChild);

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .container {
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            box-sizing: border-box;
        }
        .screenshot-container {
            position: relative;
            margin: 15px 0;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            overflow: hidden;
            background: #f8fafc;
            min-height: 100px;
        }
        #elementScreenshot {
            display: block;
            max-width: 100%;
            height: auto;
            margin: 0 auto;
        }
        .dimensions-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
            border: 1px dashed #3B82F6;
            display: none;
        }
        .element-info {
            padding: 10px;
            background: #f8fafc;
            border-radius: 4px;
            margin-top: 10px;
            font-family: monospace;
        }
        .dimensions-info {
            display: flex;
            gap: 20px;
            color: #4B5563;
        }
        .dimension-label {
            color: #6B7280;
        }
        .paste-area {
            margin: 20px 0;
            width: 100%;
            max-width: 100%;
            overflow: hidden;
        }
        .paste-container {
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            width: 100%;
            max-width: 100%;
            overflow: hidden;
        }
        #pasteInput {
            width: 100%;
            max-width: 100%;
            height: 100px;
            padding: 10px;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            font-family: monospace;
            margin-top: 10px;
            resize: vertical;
            white-space: pre;
            overflow-x: scroll;
            overflow-y: auto;
            box-sizing: border-box;
            font-size: 14px;
            line-height: 1.5;
            word-break: break-all;
            display: block;
        }
        .editors {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 20px;
            width: 100%;
            max-width: 100%;
        }
        .editor-section {
            width: 100%;
            max-width: 100%;
            overflow: hidden;
        }
        .CodeMirror {
            height: 300px;
            max-width: 100%;
            font-size: 14px;
        }
    `;
    document.head.appendChild(style);

    // Handle paste event with screenshot
    document.getElementById('pasteInput').addEventListener('paste', async (e) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text');
        e.target.value = text;
        
        try {
            const content = JSON.parse(text);
            
            // Update screenshot and dimensions
            if (content.screenshot) {
                const screenshotImg = document.getElementById('elementScreenshot');
                const screenshotContainer = document.querySelector('.screenshot-container');
                
                // Clear previous screenshot
                screenshotImg.src = '';
                
                // Set new screenshot with error handling
                screenshotImg.onerror = () => {
                    console.error('Failed to load screenshot');
                    screenshotContainer.style.display = 'none';
                };
                
                screenshotImg.onload = () => {
                    screenshotContainer.style.display = 'block';
                    const overlay = document.querySelector('.dimensions-overlay');
                    overlay.style.display = 'block';
                    
                    // Adjust container size to match image
                    if (content.originalDimensions) {
                        const aspectRatio = content.originalDimensions.height / content.originalDimensions.width;
                        const maxWidth = Math.min(content.originalDimensions.width, screenshotContainer.offsetWidth);
                        const height = maxWidth * aspectRatio;
                        
                        screenshotImg.style.width = maxWidth + 'px';
                        screenshotImg.style.height = height + 'px';
                    }
                };
                
                // Set the screenshot source
                screenshotImg.src = content.screenshot;
            }
            
            // Update dimension info
            if (content.originalDimensions) {
                document.getElementById('elementWidth').textContent = content.originalDimensions.width;
                document.getElementById('elementHeight').textContent = content.originalDimensions.height;
            }

            if (content.html) {
                const formattedHTML = formatHTML(content.html);
                htmlEditor.setValue(formattedHTML);
            }
            if (content.css) {
                cssEditor.setValue(content.css);
            }
            if (content.js) {
                jsEditor.setValue(content.js);
            }
            updatePreview();
        } catch (err) {
            console.error('Failed to parse content:', err);
        }
    });
});

// Update preview with original dimensions
function updatePreview() {
    const html = htmlEditor.getValue();
    const css = cssEditor.getValue();
    const js = jsEditor.getValue();

    const iframe = document.getElementById('previewFrame');
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    
    // Extract and process any Google Font imports before writing to iframe
    let processedCSS = css;
    const fontImports = [];
    const fontImportRegex = /@import\s+url\(['"]?(https:\/\/fonts\.googleapis\.com[^'")\s]+)['"]?\)\s*;/g;
    let match;
    
    while ((match = fontImportRegex.exec(css)) !== null) {
        if (match[1]) {
            fontImports.push(match[1]);
            // Remove the import from the CSS
            processedCSS = processedCSS.replace(match[0], '');
        }
    }
    
    iframeDoc.open();
    iframeDoc.write(`
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                ${fontImports.map(url => `<link href="${url}" rel="stylesheet">`).join('\n')}
                <style>
                    /* Reset default styles */
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    body {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        padding: 20px;
                        background-color: #f8fafc;
                    }
                    /* Apply extracted styles */
                    ${processedCSS}
                </style>
            </head>
            <body>
                ${html}
                <script>${js}</script>
            </body>
        </html>
    `);
    iframeDoc.close();

    // Set iframe dimensions
    iframe.style.width = '100%';
    iframe.style.minHeight = '400px';
    iframe.style.border = '1px solid #e2e8f0';
    iframe.style.borderRadius = '4px';
    iframe.style.backgroundColor = '#ffffff';
}

// Event listeners for buttons
document.getElementById('applyButton').addEventListener('click', updatePreview);

document.getElementById('clearButton').addEventListener('click', () => {
    htmlEditor.setValue('');
    cssEditor.setValue('');
    jsEditor.setValue('');
    document.getElementById('pasteInput').value = '';
    updatePreview();
});

// Initial preview
updatePreview();