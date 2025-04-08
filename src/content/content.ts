import html2canvas from 'html2canvas';

let isSelecting = false;
let selectedElement: HTMLElement | null = null;

// Function to highlight an element
function highlightElement(element: HTMLElement) {
    element.style.outline = '2px solid #3B82F6';
    element.style.outlineOffset = '-2px';
    element.style.cursor = 'pointer';
}

// Function to remove highlight
function removeHighlight(element: HTMLElement) {
    element.style.outline = '';
    element.style.outlineOffset = '';
    element.style.cursor = '';
}

// Function to get computed styles
function getComputedStyles(element: HTMLElement): string {
    const computedStyle = window.getComputedStyle(element);
    let styles = '';
    
    // Get all computed styles
    Array.from(computedStyle).forEach(prop => {
        const value = computedStyle.getPropertyValue(prop);
        if (value) {
            styles += `${prop}: ${value};\n`;
        }
    });

    // Get styles for pseudo-elements
    const pseudoElements = [':before', ':after', ':hover'];
    pseudoElements.forEach(pseudo => {
        const pseudoStyle = window.getComputedStyle(element, pseudo);
        if (pseudoStyle.content !== 'none' || pseudo === ':hover') {
            styles += `\n/* ${pseudo} styles */\n`;
            Array.from(pseudoStyle).forEach(prop => {
                const value = pseudoStyle.getPropertyValue(prop);
                if (value && value !== 'none') {
                    styles += `${prop}: ${value};\n`;
                }
            });
        }
    });

    // Get external resources
    const externalResources = {
        fonts: new Set<string>(),
        images: new Set<string>()
    };

    // Extract font-family
    const fontFamily = computedStyle.getPropertyValue('font-family');
    if (fontFamily) {
        externalResources.fonts.add(fontFamily);
    }

    // Extract background images
    const backgroundImage = computedStyle.getPropertyValue('background-image');
    if (backgroundImage && backgroundImage !== 'none') {
        externalResources.images.add(backgroundImage);
    }

    // Add external resources to styles
    if (externalResources.fonts.size > 0) {
        styles = `/* Fonts */\n@import url('https://fonts.googleapis.com/css2?family=${Array.from(externalResources.fonts).join('&family=').replace(/['"]/g, '')}');\n\n` + styles;
    }

    return `/* Extracted element styles */\n${styles}`;
}

// Function to get JavaScript events
function getElementEvents(element: HTMLElement): string {
    const events: string[] = [];
    const eventTypes = ['click', 'mouseover', 'mouseout', 'keydown', 'keyup', 'submit'];
    
    eventTypes.forEach(eventType => {
        const handler = element.getAttribute(`on${eventType}`);
        if (handler) {
            events.push(`on${eventType}: ${handler}`);
        }
    });
    
    return events.join('\n');
}

// Create selection indicator
function createSelectionIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'webscraper-pro-indicator';
    indicator.style.position = 'fixed';
    indicator.style.top = '20px';
    indicator.style.right = '20px';
    indicator.style.padding = '10px 20px';
    indicator.style.background = '#3B82F6';
    indicator.style.color = 'white';
    indicator.style.borderRadius = '4px';
    indicator.style.zIndex = '999999';
    indicator.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    indicator.textContent = 'Selection Mode Active - Click an element to extract';
    document.body.appendChild(indicator);
    return indicator;
}

// Mouseover event handler
function handleMouseOver(event: MouseEvent) {
    if (!isSelecting) return;
    
    const target = event.target as HTMLElement;
    if (target.id === 'webscraper-pro-indicator') return;
    
    if (selectedElement) {
        removeHighlight(selectedElement);
    }
    highlightElement(target);
    selectedElement = target;
}

// Function to capture element screenshot
async function captureElementScreenshot(element: HTMLElement): Promise<string> {
    try {
        // Get element bounds
        const rect = element.getBoundingClientRect();
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Configure html2canvas
        const options = {
            backgroundColor: null,
            useCORS: true,
            scale: 2, // Higher resolution
            logging: false,
            allowTaint: true,
            foreignObjectRendering: true,
            x: rect.left + scrollLeft,
            y: rect.top + scrollTop,
            width: rect.width,
            height: rect.height,
            windowWidth: document.documentElement.offsetWidth,
            windowHeight: document.documentElement.offsetHeight
        };

        // Create a clone of the element to capture
        const clone = element.cloneNode(true) as HTMLElement;
        clone.style.position = 'absolute';
        clone.style.left = rect.left + 'px';
        clone.style.top = rect.top + 'px';
        clone.style.width = rect.width + 'px';
        clone.style.height = rect.height + 'px';
        
        // Temporarily append clone to body
        document.body.appendChild(clone);

        // Capture the screenshot
        const canvas = await html2canvas(clone, options);
        const screenshot = canvas.toDataURL('image/png');

        // Clean up
        document.body.removeChild(clone);

        return screenshot;
    } catch (err) {
        console.error('Failed to capture screenshot:', err);
        return '';
    }
}

// Click event handler
async function handleClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    if (!isSelecting) return;
    
    const element = event.target as HTMLElement;
    if (!element) return;

    // Create a unique class name for the extracted element
    const uniqueClass = 'extracted-element-' + Math.random().toString(36).substr(2, 9);
    element.classList.add(uniqueClass);

    // Capture screenshot before getting styles
    const screenshot = await captureElementScreenshot(element);

    const extractedContent = {
        html: element.outerHTML,
        css: `/* Scoped styles for extracted element */\n.${uniqueClass} {\n${getComputedStyles(element)}\n}`,
        js: getElementEvents(element),
        screenshot: screenshot,
        originalDimensions: {
            width: element.offsetWidth,
            height: element.offsetHeight,
            scrollWidth: element.scrollWidth,
            scrollHeight: element.scrollHeight
        }
    };

    // Remove the temporary class
    element.classList.remove(uniqueClass);

    try {
        await navigator.clipboard.writeText(JSON.stringify(extractedContent, null, 2));
        console.log('Content copied to clipboard!');
        
        chrome.runtime.sendMessage({
            type: 'EXTRACTED_CONTENT',
            content: extractedContent
        });
    } catch (err) {
        console.error('Failed to copy to clipboard:', err);
    }

    removeHighlight(element);
    isSelecting = false;
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Received message:', message);
    
    if (message.type === 'START_SELECTION') {
        console.log('Starting selection mode');
        isSelecting = true;
        createSelectionIndicator();
        document.addEventListener('mouseover', handleMouseOver);
        document.addEventListener('click', handleClick);
        sendResponse({ status: 'Selection mode activated' });
    }
    
    return true; // Keep the message channel open for sendResponse
}); 