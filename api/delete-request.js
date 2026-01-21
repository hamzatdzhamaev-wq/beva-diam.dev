// Vercel Serverless Function - DELETE endpoint to remove a request
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

    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'Request ID ist erforderlich' });
        }

        // Path to data file
        const dataFile = path.join('/tmp', 'data', 'requests.json');

        // Read existing requests
        if (!fs.existsSync(dataFile)) {
            return res.status(404).json({ error: 'Keine Anfragen gefunden' });
        }

        const data = fs.readFileSync(dataFile, 'utf8');
        let requests = JSON.parse(data);

        // Find and remove the request
        const initialLength = requests.length;
        requests = requests.filter(req => req.id !== id);

        if (requests.length === initialLength) {
            return res.status(404).json({ error: 'Anfrage nicht gefunden' });
        }

        // Save updated requests
        fs.writeFileSync(dataFile, JSON.stringify(requests, null, 2));

        return res.status(200).json({
            success: true,
            message: 'Anfrage erfolgreich gelöscht'
        });

    } catch (error) {
        console.error('Error deleting request:', error);
        return res.status(500).json({ error: 'Serverfehler beim Löschen der Anfrage' });
    }
};
