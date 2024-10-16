const express = require('express');
const app = express();
const port = 3000;

app.listen(port, '192.168.1.6', () => {
  console.log(`Server running at http://192.168.1.6:${port}`);
});
