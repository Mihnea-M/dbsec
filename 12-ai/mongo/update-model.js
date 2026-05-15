import * as tf from '@tensorflow/tfjs-node';
import { MongoClient } from 'mongodb';
import { writeFile } from 'fs/promises';

const uri = 'mongodb://127.0.0.1:27017/?replicaSet=rs0'
const client = new MongoClient(uri);

function encodeOp(op) {
  return [
    op.op === 'i' ? 1 : 0,
    op.op === 'u' ? 1 : 0,
    op.op === 'd' ? 1 : 0,
  ];
}

async function getTrainingData() {
  await client.connect();
  const db = client.db('local');
  const col = db.collection('oplog.rs');

  const ops = await col.find({ op: { $in: ['i', 'u', 'd'] } }).limit(1000).toArray();
  const vectors = ops.map(encodeOp);
  await client.close();
  return tf.tensor2d(vectors);
}

async function trainAutoencoder(data) {
  const inputDim = data.shape[1];

  const model = tf.sequential();
  model.add(tf.layers.dense({ inputShape: [inputDim], units: 2, activation: 'relu' }));
  model.add(tf.layers.dense({ units: inputDim, activation: 'sigmoid' }));

  model.compile({ loss: 'meanSquaredError', optimizer: 'adam' });

  await model.fit(data, data, {
    epochs: 100,
    batchSize: 32,
    verbose: 0,
  });

  await model.save('file://model');
  console.log('Model trained and saved to ./model/');
}

async function main() {
  const data = await getTrainingData();
  await trainAutoencoder(data);
}

main();
