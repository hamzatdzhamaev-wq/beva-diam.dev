// Vercel Serverless Function - PATCH endpoint to update request status
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

    if (req.method !== 'PATCH') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { id, status } = req.body;

        if (!id || !status) {
            return res.status(400).json({ error: 'ID und Status sind erforderlich' });
        }

        // Validate status value
        const validStatuses = ['new', 'in_progress', 'completed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Ungültiger Status' });
        }

        // Connect to the Neon database
        const sql = neon(process.env.DATABASE_URL);

        // Add status column if it doesn't exist
        try {
            await sql`ALTER TABLE requests ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new'`;
        } catch (e) {
            // Column might already exist, ignore error
        }

        // Update the request status
        const result = await sql`
            UPDATE requests
            SET status = ${status}
            WHERE id = ${parseInt(id)}
            RETURNING id, status
        `;

        if (result.length === 0) {
            return res.status(404).json({ error: 'Anfrage nicht gefunden' });
        }

        return res.status(200).json({
            success: true,
            message: 'Status erfolgreich aktualisiert',
            request: result[0]
        });

    } catch (error) {
        console.error('Error updating status:', error);
        return res.status(500).json({ error: 'Serverfehler beim Aktualisieren des Status' });
    }
}
