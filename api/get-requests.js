// Vercel Serverless Function - GET endpoint to retrieve all requests
const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Handle OPTIONS request for CORS
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Path to data file
        const dataFile = path.join('/tmp', 'data', 'requests.json');

        // Read existing requests or return empty array
        let requests = [];
        if (fs.existsSync(dataFile)) {
            const data = fs.readFileSync(dataFile, 'utf8');
            requests = JSON.parse(data);
        }

        return res.status(200).json({
            success: true,
            requests: requests
        });

    } catch (error) {
        console.error('Error reading requests:', error);
        return res.status(500).json({ error: 'Serverfehler beim Abrufen der Anfragen' });
    }
};
