const { fork } = require('child_process');
const path = require('path');

const serverProcess = fork(path.join(__dirname, 'server.js'), [], {
  env: { ...process.env, PORT: '5000' },
  stdio: 'inherit',
});

// Give server 1.5s to initialize SQLite and listen
setTimeout(() => {
  const testProcess = fork(path.join(__dirname, 'verify-backend.js'), [], {
    stdio: 'inherit',
  });

  testProcess.on('exit', (code) => {
    serverProcess.kill();
    process.exit(code || 0);
  });
}, 1500);
