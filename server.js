const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the 'src' directory
app.use(express.static(path.join(__dirname, 'src')));

// Optional: Redirect root ('/') to index.html for convenience
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port http://localhost:${PORT}`);
});
