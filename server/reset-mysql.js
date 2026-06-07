// Reset MySQL root password to empty using init-file method
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const mysqlBin = 'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin';
const initFile = path.join(mysqlBin, 'init.sql');

// Create init SQL to reset root password
fs.writeFileSync(initFile, `
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'asg_root_2024';
FLUSH PRIVILEGES;
CREATE DATABASE IF NOT EXISTS ai_script_game CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SELECT 'DATABASE CREATED OK' AS status;
`);

console.log('Init file created at:', initFile);
console.log('Step 1: Stopping MySQL service...');
try {
  execSync('net stop MySQL80', { stdio: 'inherit' });
  console.log('MySQL stopped');
} catch(e) {
  console.log('Stop failed:', e.message.substring(0, 100));
}

console.log('\nStep 2: Starting MySQL with --init-file...');
try {
  const mysqld = `"${path.join(mysqlBin, 'mysqld.exe')}" --init-file="${initFile}" --console`;
  console.log('Command:', mysqld);
  
  const child = require('child_process').exec(mysqld);
  child.stdout?.on('data', d => process.stdout.write(d));
  child.stderr?.on('data', d => process.stderr.write(d));
  
  // Wait for MySQL to start and execute init file
  setTimeout(() => {
    console.log('\nStopping MySQL...');
    child.kill();
    process.exit(0);
  }, 15000);
} catch(e) {
  console.log('Start failed:', e.message);
}
