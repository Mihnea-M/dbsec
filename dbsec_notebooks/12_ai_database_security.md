# DBSEC 12 — AI-Assisted Database Anomaly Detection

## Repository category

- `12-ai/mongo/*`
- `12-ai/mysql/*`

## Learning goals

- Generate normal and anomalous database activity.
- Train/load a TensorFlow.js autoencoder model.
- Monitor MongoDB and MySQL events for anomalies.

## Detailed concept explanation

### Anomaly detection for database security

Anomaly detection learns patterns of normal behavior and flags unusual events. In database security, this can mean unusual operations, rare table
access, unexpected deletes, abnormal write volume, or suspicious access timing. It is a detection control, not a replacement for access control.

### Autoencoder idea

An autoencoder compresses input features into a smaller representation and reconstructs them. If reconstruction error is high, the event may differ from
training data. The repository uses TensorFlow.js models for demonstration.

### Event sources

The MongoDB section uses generated data/anomalies and a saved model. The MySQL section uses binlog events through ZongJi, which can observe inserts,
updates, and deletes. Event monitoring must be secured because logs may reveal sensitive data.

## Code snippets and explanations

### Mongo anomaly generator

**Source:** `12-ai/mongo/generate-anomalies.js`

```js
import { MongoClient, ObjectId } from 'mongodb'

const uri = 'mongodb://127.0.0.1:27017/?replicaSet=rs0'
const client = new MongoClient(uri)

await client.connect()
// generate anomalous operations...
await client.close()
```

The script connects to a replica-set MongoDB instance and creates unusual operations for testing detection. Replica set setup is often required for
change-stream style monitoring.

### Train TensorFlow.js model

**Source:** `12-ai/mongo/update-model.js`

```js
import * as tf from '@tensorflow/tfjs-node'

const data = await getTrainingData()
await trainAutoencoder(data)
```

Training data is converted to features, then used to train an autoencoder. The quality of detection depends on representative normal data.

### MySQL binlog monitoring

**Source:** `12-ai/mysql/zong.js`

```js
const zongji = new ZongJi({
  host: '127.0.0.1',
  user: 'replica_user',
  password: 'replica_pass'
})

zongji.start({
  startAtEnd: true,
  includeEvents: ['tablemap', 'writerows', 'updaterows', 'deleterows'],
  includeSchema: { testdb: true }
})
```

ZongJi listens to MySQL binary log events. This can power monitoring and anomaly detection, but the replication user should have only the privileges
required to read events.

### Anomaly decision threshold

**Source:** `12-ai/mysql/detect-anomalies.js`

```js
const model = await tf.loadLayersModel('file://./model/model.json')
const THRESHOLD = 0.1
```

The model scores events and compares reconstruction error against a threshold. Low thresholds produce more alerts; high thresholds may miss attacks.

## Review checklist

- Why is anomaly detection not enough by itself?
- What features would you extract from database activity?
- How do false positives and false negatives affect security operations?
