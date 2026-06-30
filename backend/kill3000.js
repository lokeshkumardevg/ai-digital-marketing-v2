const { execSync } = require('child_process');

try {
  // Find PID of process using port 3000
  const output = execSync('netstat -ano | findstr :3000').toString();
  const lines = output.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  if (lines.length > 0) {
    const firstLine = lines[0];
    const parts = firstLine.split(/\s+/);
    const pid = parts[parts.length - 1];
    
    if (pid && pid !== '0') {
      console.log(`Killing process ${pid} on port 3000...`);
      execSync(`taskkill /F /PID ${pid}`);
      console.log('Port 3000 is now free.');
    } else {
      console.log('Could not find PID for port 3000.');
    }
  } else {
    console.log('No process running on port 3000.');
  }
} catch (e) {
  console.log('Error or no process on port 3000:', e.message);
}
