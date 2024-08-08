const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files from the 'app/public' directory
app.use(express.static(path.join(__dirname, 'app/public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'app/public', 'login.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
