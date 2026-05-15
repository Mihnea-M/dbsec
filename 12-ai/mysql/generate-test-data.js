import mysql from 'mysql2/promise';
import { faker } from '@faker-js/faker';

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'testdb'
})

await connection.execute(`CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100)
)`);

// Generate normal user inserts
for (let i = 0; i < 50; i++) {
  const name = faker.person.firstName();
  const email = faker.internet.email({ firstName: name });
  await connection.execute('INSERT INTO users (name, email) VALUES (?, ?)', [name, email]);
}

console.log('✅ Normal data generated.');

// Generate anomalies
await connection.execute(`CREATE TABLE IF NOT EXISTS secret_data (
  id INT PRIMARY KEY,
  payload TEXT
)`);

await connection.execute('INSERT INTO secret_data VALUES (1, "classified")');
await connection.execute('DELETE FROM users');

console.log('⚠️ Anomalous data generated.');

await connection.end();
