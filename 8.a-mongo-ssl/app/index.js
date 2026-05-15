import { MongoClient } from 'mongodb'

const client = new MongoClient('mongodb://localhost:27017', {
  tls: true,
  tlsCAFile: '../certs/ca.crt',
  tlsCertificateKeyFile: '../certs/client.pem'
})

async function main() {
  await client.connect()

  console.log('Connected successfully')

  const db = client.db('test')

  const result = await db.collection('items').findOne({})

  console.log(result)

  await client.close()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})