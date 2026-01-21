// Vercel Serverless Function - POST endpoint to save contact requests
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

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { name, email, phone, description } = req.body;

        // Validate required fields
        if (!name || !email || !description) {
            return res.status(400).json({ error: 'Name, Email und Beschreibung sind erforderlich' });
        }

        // Create request object with timestamp
        const newRequest = {
            id: Date.now().toString(),
            name,
            email,
            phone: phone || '',
            description,
            timestamp: new Date().toISOString()
        };

        // Path to data file
        const dataDir = path.join('/tmp', 'data');
        const dataFile = path.join(dataDir, 'requests.json');

        // Create directory if it doesn't exist
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        // Read existing requests or create new array
        let requests = [];
        if (fs.existsSync(dataFile)) {
            const data = fs.readFileSync(dataFile, 'utf8');
            requests = JSON.parse(data);
        }

        // Add new request
        requests.push(newRequest);

        // Save to file
        fs.writeFileSync(dataFile, JSON.stringify(requests, null, 2));

        return res.status(200).json({
            success: true,
            message: 'Anfrage erfolgreich gespeichert',
            request: newRequest
        });

    } catch (error) {
        console.error('Error saving request:', error);
        return res.status(500).json({ error: 'Serverfehler beim Speichern der Anfrage' });
    }
};
