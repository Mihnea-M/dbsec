import { MongoClient } from 'mongodb'
const url = 'mongodb://root:ism@localhost:27017?authSource=admin'
const dbName = 'ismv4'

try {
  const client = await MongoClient.connect(url)
  console.log("Connected successfully to server")
  const db = client.db(dbName)
  console.log(db)
  client.close()
} catch (err) {
  console.log(err.stack)
}
