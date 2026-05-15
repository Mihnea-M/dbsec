import { MongoClient, ObjectId } from 'mongodb'

const uri = 'mongodb://127.0.0.1:27017/?replicaSet=rs0'
const client = new MongoClient(uri)

async function generateAnomalies() {
  await client.connect()

  const db = client.db('testdb')
  const col = db.collection('testcoll')

  console.log('Generating anomalous MongoDB activity...')

  // suspicious inserts
  for (let i = 0; i < 10; i++) {
    await col.insertOne({
      email: `attacker${i}@evil.example`,
      role: 'godmode',
      payload: 'suspicious',
      created_at: new Date(),
      extra: 'anomaly'
    })
  }

  // suspicious updates
  await col.updateMany(
    {},
    {
      $set: {
        compromised: true,
        modified_by: 'attacker'
      }
    }
  )

  // suspicious deletes
  const docs = await col.find({}).limit(5).toArray()

  for (const doc of docs) {
    await col.deleteOne({ _id: new ObjectId(doc._id) })
  }

  console.log('Anomalous MongoDB operations generated.')

  await client.close()
}

generateAnomalies()