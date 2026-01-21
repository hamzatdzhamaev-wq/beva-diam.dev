// Vercel Serverless Function - GET endpoint to retrieve all requests
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

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Connect to the Neon database
        const sql = neon(process.env.DATABASE_URL);

        // Get all requests
        const requests = await sql`
            SELECT id::text, name, email, phone, project_type, budget, start_date, description, timestamp
            FROM requests
            ORDER BY timestamp DESC
        `;

        return res.status(200).json({
            success: true,
            requests: requests
        });

    } catch (error) {
        console.error('Error reading requests:', error);
        return res.status(200).json({
            success: true,
            requests: []
        });
    }
}
