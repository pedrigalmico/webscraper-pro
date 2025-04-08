// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
    console.log('WebScraper Pro extension installed');
});

// Handle messages between popup and content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'EXTRACTED_CONTENT') {
        // Forward the message to the popup
        chrome.runtime.sendMessage(message);
    }
    return true;
}); 