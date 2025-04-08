document.addEventListener('DOMContentLoaded', () => {
    const startSelectionBtn = document.getElementById('startSelection');
    const extractedContent = document.getElementById('extractedContent');
    const htmlOutput = document.getElementById('htmlOutput');
    const cssOutput = document.getElementById('cssOutput');
    const jsOutput = document.getElementById('jsOutput');
    const copyAllBtn = document.getElementById('copyAll');

    if (!startSelectionBtn || !extractedContent || !htmlOutput || !cssOutput || !jsOutput || !copyAllBtn) {
        console.error('Required elements not found');
        return;
    }

    // Handle start selection button click
    startSelectionBtn.addEventListener('click', async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab.id) return;

        try {
            // Inject the content script
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content/content.js']
            });

            // Start the selection process
            chrome.tabs.sendMessage(tab.id, { type: 'START_SELECTION' });
        } catch (error) {
            console.error('Failed to inject content script:', error);
        }
    });

    // Handle copy all button click
    copyAllBtn.addEventListener('click', () => {
        const content = `
HTML:
${htmlOutput?.textContent || ''}

CSS:
${cssOutput?.textContent || ''}

JavaScript:
${jsOutput?.textContent || ''}
        `.trim();

        navigator.clipboard.writeText(content).then(() => {
            const originalText = copyAllBtn.textContent;
            copyAllBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyAllBtn.textContent = originalText;
            }, 2000);
        });
    });

    // Listen for messages from content script
    chrome.runtime.onMessage.addListener((message) => {
        if (message.type === 'EXTRACTED_CONTENT') {
            if (htmlOutput) htmlOutput.textContent = message.content.html;
            if (cssOutput) cssOutput.textContent = message.content.css;
            if (jsOutput) jsOutput.textContent = message.content.js;
            extractedContent.classList.remove('hidden');
        }
    });
}); 