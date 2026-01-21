// Vercel Serverless Function - DELETE endpoint to remove a request
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

    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'Request ID ist erforderlich' });
        }

        // Connect to the Neon database
        const sql = neon(process.env.DATABASE_URL);

        // Delete the request
        const result = await sql`
            DELETE FROM requests
            WHERE id = ${parseInt(id)}
            RETURNING id
        `;

        if (result.length === 0) {
            return res.status(404).json({ error: 'Anfrage nicht gefunden' });
        }

        return res.status(200).json({
            success: true,
            message: 'Anfrage erfolgreich gelöscht'
        });

    } catch (error) {
        console.error('Error deleting request:', error);
        return res.status(500).json({ error: 'Serverfehler beim Löschen der Anfrage' });
    }
}
