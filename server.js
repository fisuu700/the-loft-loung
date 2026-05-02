const express = require('express');
const path = require('path');
const os = require('os');

const app = express();
const PORT = 3000;

// Servir les fichiers statiques du dossier actuel
app.use(express.static(__dirname));

// Route par défaut
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Santé du serveur
app.get('/health', (req, res) => {
    res.json({ status: 'online', timestamp: new Date() });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log('\x1b[32m%s\x1b[0m', '╔═══════════════════════════════════════════════════════════╗');
    console.log('\x1b[32m%s\x1b[0m', '║          🏛️  THE LOFT LOUNGE - Backend API 🏛️            ║');
    console.log('\x1b[32m%s\x1b[0m', '╠═══════════════════════════════════════════════════════════╣');
    console.log('\x1b[32m%s\x1b[0m', `║  🌐 Serveur démarré sur:  http://localhost:${PORT}          ║`);
    
    // Afficher les adresses IP locales
    const networkInterfaces = os.networkInterfaces();
    for (const interfaceName in networkInterfaces) {
        for (const iface of networkInterfaces[interfaceName]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                console.log('\x1b[36m%s\x1b[0m', `║  📱 Accès mobile:        http://${iface.address}:${PORT}    ║`);
            }
        }
    }
    
    console.log('\x1b[32m%s\x1b[0m', '╚═══════════════════════════════════════════════════════════╝');
    console.log('Appuyez sur Ctrl+C pour arrêter le serveur.');
});
