const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);

    // API: Kontaktformular speichern (POST)
    if (req.method === 'POST' && req.url === '/api/contact') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            const newRequest = JSON.parse(body);
            const dbPath = path.join(__dirname, 'requests.json');
            
            fs.readFile(dbPath, (err, data) => {
                let requests = [];
                if (!err) {
                    try { requests = JSON.parse(data); } catch(e) {}
                }
                requests.unshift(newRequest); // Neueste zuerst
                
                fs.writeFile(dbPath, JSON.stringify(requests, null, 2), (err) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Could not save' }));
                    } else {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true }));
                    }
                });
            });
        });
        return;
    }

    // API: Anfragen abrufen (GET)
    if (req.method === 'GET' && req.url === '/api/requests') {
        const dbPath = path.join(__dirname, 'requests.json');
        fs.readFile(dbPath, (err, data) => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(err ? '[]' : data);
        });
        return;
    }

    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './index.html';
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    // Cache control for static assets (Production Best Practice)
    const headers = { 'Content-Type': contentType };
    if (['.jpg', '.png', '.gif', '.svg', '.ico', '.css', '.js'].includes(extname)) {
        // Cache for 1 day
        headers['Cache-Control'] = 'public, max-age=86400';
    } else {
        headers['Cache-Control'] = 'no-cache';
    }

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - File Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`, 'utf-8');
            }
        } else {
            res.writeHead(200, headers);
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log('\n╔═══════════════════════════════════════════╗');
    console.log('║  🚀 Server started successfully!         ║');
    console.log('╚═══════════════════════════════════════════╝\n');
    console.log(`  📡 Server running at: http://localhost:${PORT}`);
    console.log(`  🌐 Network access: http://127.0.0.1:${PORT}`);
    console.log(`\n  Press Ctrl+C to stop the server\n`);
});
