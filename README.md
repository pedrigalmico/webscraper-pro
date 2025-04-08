# WebScraper Pro

A browser extension that allows you to extract HTML, CSS, and JavaScript code from any webpage.

## Features

- Extract HTML structure from selected elements
- Capture computed CSS styles
- Identify JavaScript event handlers
- Copy all extracted code with one click
- User-friendly interface
- Real-time element highlighting

## Project Structure

```
webscraper-pro/
├── src/                # Extension source code
│   ├── background/     # Extension background scripts
│   ├── content/        # Content scripts for webpage interaction
│   ├── popup/         # Popup UI and logic
│   └── utils/         # Shared utilities
├── server/            # Test server
│   ├── public/        # Public assets for test interface
│   │   ├── index.html
│   │   ├── styles.css
│   │   └── script.js
│   └── server.js
├── public/            # Extension static assets
├── manifest.json      # Extension configuration
└── package.json       # Project dependencies
```

## Installation

1. Clone this repository:
```bash
git clone https://github.com/yourusername/webscraper-pro.git
cd webscraper-pro
```

2. Install dependencies:
```bash
npm install
```

3. Build the extension:
```bash
npm run build
```

4. Load the extension in Chrome:
- Open Chrome and navigate to `chrome://extensions/`
- Enable "Developer mode" in the top right
- Click "Load unpacked" and select the `dist` directory from this project

## Test Interface

To run the test interface:

1. Install the server dependencies:
```bash
npm install express cors body-parser nodemon
```

2. Start the server:
```bash
npm start
```

3. Open your browser to `http://localhost:3000`

## Usage

### Extension Usage
1. Click the extension icon in your browser toolbar
2. Click "Start Selection" in the popup
3. Hover over elements on the webpage to see them highlighted
4. Click on an element to extract its code
5. View the extracted HTML, CSS, and JavaScript in the popup
6. Click "Copy All" to copy all the code to your clipboard

### Test Interface Features
The test interface provides various elements to test:
- Basic element selection
- Style extraction
- Event handler detection
- Dynamic content scraping
- Form element handling

Available test components:
- Styled buttons with click events
- Cards with hover effects
- Forms with submit handlers
- Dynamic content loading
- Interactive elements with multiple events
- Complex styling with gradients and animations

## Development

To start development:

```bash
npm run dev
```

This will watch for changes and rebuild the extension automatically.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This extension is intended for educational and development purposes only. Please respect website terms of service and copyright laws when using extracted code. 