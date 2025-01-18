// server.js
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const NodeCache = require('node-cache');

const app = express();
const cache = new NodeCache({ stdTTL: 600 }); // Cache responses for 10 minutes
const PORT = 3000;

app.use(cors());

app.get('/leaderboard', async (req, res) => {
    const page = req.query.page || 1;
    const pageSize = req.query.pageSize || 20;
    const cacheKey = `leaderboard-page-${page}-size-${pageSize}`;

    // Check if data is cached
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
        return res.json(cachedData);
    }

    // Fetch data from the external API
    const apiUrl = `https://api.nohesi.gg/leaderboard?page=${page}&pageSize=${pageSize}`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        cache.set(cacheKey, data); // Cache the response
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
});