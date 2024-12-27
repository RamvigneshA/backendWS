// backend/server.js
const WebSocket = require('ws');
const os = require('os');

// Create a WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

// Function to get system metrics with a timestamp
const getSystemMetrics = () => {
    return {
        timestamp: new Date().toISOString(),
        cpuUsage: os.loadavg()[0], // Average CPU load over the last minute
        memoryUsage: Math.round((os.totalmem() - os.freemem()) / os.totalmem() * 100), // Memory usage percentage
        totalMemory: Math.round(os.totalmem() / (1024 * 1024)), // Total memory in MB
        freeMemory: Math.round(os.freemem() / (1024 * 1024)), // Free memory in MB
        uptime: os.uptime(), // System uptime in seconds
        signalStrength: Math.floor(Math.random() * 101),
    };
};

// Handle client connections
wss.on('connection', (ws) => {
    console.log('Client connected');
    
    // Send initial data to the client
    ws.send(JSON.stringify(getSystemMetrics()));

    // Send system metrics every 5 seconds
    const intervalId = setInterval(() => {
        ws.send(JSON.stringify(getSystemMetrics()));
    }, 5000);

    // Handle client disconnection
    ws.on('close', () => {
        console.log('Client disconnected');
        clearInterval(intervalId);
    });
});

console.log('WebSocket server is running on ws://localhost:8080');
