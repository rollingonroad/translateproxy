const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const translateHandler = require('./api/translate');
const configHandler = require('./api/config');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));

// API routes
app.all('/api/translate', translateHandler);
app.all('/api/config', configHandler);

// Health check
app.get('/healthz', (req, res) => {
  res.status(200).json({ ok: true });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`translateproxy server listening on port ${port}`);
});


