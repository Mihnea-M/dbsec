import mysql from 'mysql2/promise'

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'testdb'
})

console.log('Generating anomalous database activity...')

// unusual table write
await connection.execute(`
  CREATE TABLE IF NOT EXISTS secret_data (
    id INT PRIMARY KEY,
    payload TEXT
  )
`)

await connection.execute(`
  INSERT INTO secret_data (id, payload)
  VALUES (?, ?)
  ON DUPLICATE KEY UPDATE payload = VALUES(payload)
`, [1, 'classified'])

// unusual delete burst
await connection.execute('DELETE FROM users WHERE id <= 10')

// unusual update burst
await connection.execute(`
  UPDATE users
  SET email = CONCAT('compromised_', id, '@example.com')
  WHERE id BETWEEN 11 AND 20
`)

// suspicious log writes
await connection.execute(`
  CREATE TABLE IF NOT EXISTS logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`)

for (let i = 0; i < 20; i++) {
  await connection.execute(
    'INSERT INTO logs (message) VALUES (?)',
    [`suspicious access attempt ${i + 1}`]
  )
}

console.log('Anomalous data generated.')

await connection.end()