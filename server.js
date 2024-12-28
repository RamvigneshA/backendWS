const WebSocket = require('ws');
const si = require('systeminformation');

// Created a WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

const getSystemMetrics = async () => {
  const memInfo = await si.mem();
  const battery = await si.battery();
  const cpuData = await si.currentLoad();
  const diskInfo = await si.fsSize(); 

  // Calculate total and free space across all disks
  const totalDiskSpace = diskInfo.reduce((acc, disk) => acc + disk.size, 0);
  const freeDiskSpace = diskInfo.reduce((acc, disk) => acc + disk.available, 0);
  const usedDiskSpace = totalDiskSpace - freeDiskSpace;

  return {
    timestamp: new Date().toUTCString(),
    cpuUsage: Math.round(cpuData.currentLoad), 
    ram: {
      used: Math.round((memInfo.used / memInfo.total) * 100), 
      active: Math.round((memInfo.active / memInfo.total) * 100), 
      swapUsed: Math.round((memInfo.swapused / memInfo.swaptotal) * 100),
    },
    battery: {
      percentage: battery.percent,
      isCharging: battery.isCharging,
      timeRemaining: battery.timeRemaining,
    },
    rom: {
      total: Math.round((totalDiskSpace / (1024 * 1024 * 1024)) * 100) / 100, // Total disk space in GB
      free: Math.round((freeDiskSpace / (1024 * 1024 * 1024)) * 100) / 100, // Free disk space in GB
      used: Math.round((usedDiskSpace / (1024 * 1024 * 1024)) * 100) / 100, // Used disk space in GB
      percentage: Math.round((usedDiskSpace / totalDiskSpace) * 100), // Disk usage percentage
    },
  };
};

// Handle client connections
wss.on('connection', async (ws) => {
  console.log('Client connected');

  // Send initial data to the client
  ws.send(JSON.stringify(await getSystemMetrics()));

  // Send system metrics every second
  const intervalId = setInterval(async () => {
    ws.send(JSON.stringify(await getSystemMetrics()));
  }, 1000);

  // Handle client disconnection
  ws.on('close', () => {
    console.log('Client disconnected');
    clearInterval(intervalId);
  });
});

console.log('WebSocket server is running on ws://localhost:8080');
