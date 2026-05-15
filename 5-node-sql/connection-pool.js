// structure
// CREATE TABLE students (
//   id INT AUTO_INCREMENT PRIMARY KEY,
//   first_name VARCHAR(255) NOT NULL,
//   last_name VARCHAR(255) NOT NULL,
//   telephone VARCHAR(20) NOT NULL,
//   email VARCHAR(255) NOT NULL UNIQUE
// );


// get the client
import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: 'localhost',
  database: 'midgard',
  user: 'root',
  password: 'root',
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
  idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
  queueLimit: 0
})


await pool.execute('insert into students (name, email, phone) value (?, ?, ?)', ['clara', 'clara@a.com', '111'])

let [rows, fields] = await pool.query('select * from students')

console.warn(rows)

await pool.execute('delete from students where first_name = ?', ['clara']);

[rows, fields] = await pool.query('select * from students')

console.warn(rows)

await pool.end()