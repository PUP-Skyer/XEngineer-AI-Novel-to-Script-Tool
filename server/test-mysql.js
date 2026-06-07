const mysql = require('mysql2/promise');

async function test() {
  const passwords = ['', 'root', 'rootpassword', '123456', 'password', 'admin'];
  
  for (const pwd of passwords) {
    try {
      const conn = await mysql.createConnection({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: pwd,
      });
      console.log(`OK Connected with password: "${pwd}"`);
      
      await conn.execute('CREATE DATABASE IF NOT EXISTS ai_script_game CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
      console.log('OK Database ai_script_game created/exists');
      
      // List databases
      const [rows] = await conn.execute('SHOW DATABASES');
      console.log('Databases:', rows.map(r => r.Database).join(', '));
      
      await conn.end();
      process.exit(0);
    } catch (e) {
      console.log(`FAIL password "${pwd}": ${e.message.substring(0, 80)}`);
    }
  }
  console.log('No password worked');
  process.exit(1);
}

test();
