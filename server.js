const express = require('express');
const app = express();
const port = 3000;

// Serve static files from the "public" directory
app.use(express.static('public'));

// Route for 403 Forbidden
app.get('/forbidden', (req, res) => {
  res.status(403).send('403 Forbidden: You do not have permission to access this resource.');
});

// Route for 401 Unauthorized
app.get('/unauthorized', (req, res) => {
  res.status(401).send('401 Unauthorized: Authentication is required to access this resource.');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
