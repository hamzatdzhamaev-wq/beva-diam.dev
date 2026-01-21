// Vercel Serverless Function - POST endpoint to save contact requests
import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
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

        // Connect to the Neon database
        const sql = neon(process.env.DATABASE_URL);

        // Create table if it doesn't exist
        await sql`
            CREATE TABLE IF NOT EXISTS requests (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                phone TEXT,
                description TEXT NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        // Insert new request
        const result = await sql`
            INSERT INTO requests (name, email, phone, description)
            VALUES (${name}, ${email}, ${phone || ''}, ${description})
            RETURNING id, name, email, phone, description, timestamp
        `;

        return res.status(200).json({
            success: true,
            message: 'Anfrage erfolgreich gespeichert',
            request: result[0]
        });

    } catch (error) {
        console.error('Error saving request:', error);
        return res.status(500).json({ error: 'Serverfehler beim Speichern der Anfrage' });
    }
}
