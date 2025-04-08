const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Test endpoints
app.get('/api/test-elements', (req, res) => {
    res.json({
        elements: [
            {
                type: 'button',
                html: '<button class="test-button">Click Me</button>',
                css: '.test-button { background-color: blue; color: white; }',
                js: 'button.addEventListener("click", () => alert("Clicked!"))'
            },
            {
                type: 'card',
                html: '<div class="card">Card Content</div>',
                css: '.card { border: 1px solid #ddd; padding: 10px; }',
                js: null
            }
        ]
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 