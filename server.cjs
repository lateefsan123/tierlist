// server.cjs
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const upload = multer();
app.use(cors());

// Serve static images
app.use('/snapshots', express.static(path.join(__dirname, 'public/snapshots')));

// Basic test endpoint
app.get('/', (req, res) => {
  res.send('Tierlist API is working.');
});

// Save uploaded tierlist image
app.post('/api/post-tierlist', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided.' });
    }

    // Generate unique filename
    const filename = `tierlist-${uuidv4()}.png`;
    const filepath = path.join(__dirname, 'public/snapshots', filename);

    // Ensure snapshots directory exists
    const snapshotDir = path.dirname(filepath);
    if (!fs.existsSync(snapshotDir)) {
      fs.mkdirSync(snapshotDir, { recursive: true });
    }

    // Save the file
    fs.writeFileSync(filepath, req.file.buffer);

    // Create a shareable link
    const link = `https://fightercenter.net/view?id=${filename}`;

    // Send tweet with link (no image upload)
    const { TwitterApi } = require('twitter-api-v2');
    const twitterClient = new TwitterApi({
      appKey: process.env.TWITTER_CONSUMER_KEY,
      appSecret: process.env.TWITTER_CONSUMER_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_SECRET,
    });

    const rwClient = twitterClient.readWrite;
    const tweet = await rwClient.v2.tweet({
      text: `Here's my Street Fighter 6 tier list 🔥 #SF6\n${link}`
    });

    res.status(200).json({ success: true, tweet, link });
  } catch (err) {
    console.error('❌ Error saving or tweeting:', err);
    res.status(500).json({ error: 'Tweet failed', details: err.message });
  }
});

app.listen(3001, () => {
  console.log('🚀 Server listening at http://localhost:3001');
});