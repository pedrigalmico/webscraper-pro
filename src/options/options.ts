interface ExtensionOptions {
    autoCopy: boolean;
    showNotifications: boolean;
    codeFormat: 'minified' | 'pretty';
}

// Default options
const defaultOptions: ExtensionOptions = {
    autoCopy: false,
    showNotifications: true,
    codeFormat: 'pretty'
};

// Save options to chrome.storage
function saveOptions() {
    const options: ExtensionOptions = {
        autoCopy: (document.getElementById('autoCopy') as HTMLInputElement).checked,
        showNotifications: (document.getElementById('showNotifications') as HTMLInputElement).checked,
        codeFormat: (document.getElementById('codeFormat') as HTMLSelectElement).value as 'minified' | 'pretty'
    };

    chrome.storage.sync.set(options, () => {
        // Show save confirmation
        const saveButton = document.getElementById('saveOptions');
        if (saveButton) {
            const originalText = saveButton.textContent;
            saveButton.textContent = 'Options Saved!';
            setTimeout(() => {
                if (saveButton) saveButton.textContent = originalText;
            }, 2000);
        }
    });
}

// Load options from chrome.storage
function loadOptions() {
    chrome.storage.sync.get(defaultOptions, (items) => {
        (document.getElementById('autoCopy') as HTMLInputElement).checked = items.autoCopy;
        (document.getElementById('showNotifications') as HTMLInputElement).checked = items.showNotifications;
        (document.getElementById('codeFormat') as HTMLSelectElement).value = items.codeFormat;
    });
}

// Initialize options page
document.addEventListener('DOMContentLoaded', loadOptions);
document.getElementById('saveOptions')?.addEventListener('click', saveOptions); 