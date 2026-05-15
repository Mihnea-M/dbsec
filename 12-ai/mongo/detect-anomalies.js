import * as tf from '@tensorflow/tfjs-node';
import { MongoClient, Timestamp } from 'mongodb';

const uri = 'mongodb://127.0.0.1:27017/?replicaSet=rs0'
const client = new MongoClient(uri);
const MODEL_PATH = 'file://model';
const THRESHOLD = 0.01;
let latestTs = new Timestamp({ t: 0, i: 1 }) 

function encodeOp(op) {
  return [
    op.op === 'i' ? 1 : 0,
    op.op === 'u' ? 1 : 0,
    op.op === 'd' ? 1 : 0,
  ];
}

function mse(a, b) {
  const diff = a.map((x, i) => x - b[i]);
  const square = diff.map(x => x * x);
  return square.reduce((sum, x) => sum + x, 0) / a.length;
}

async function monitor() {
  const model = await tf.loadLayersModel(MODEL_PATH + '/model.json');
  await client.connect();
  const db = client.db('local');
  const oplog = db.collection('oplog.rs');

  console.log('Monitoring for anomalies...');

  while (true) {
    const cursor = oplog.find({ ts: { $gt: latestTs } }, {
      tailable: true,
      awaitData: true,
      noCursorTimeout: true,
    });

    while (await cursor.hasNext()) {
      const op = await cursor.next();
      latestTs = op.ts;
      if (!['i', 'u', 'd'].includes(op.op)) continue;

      const input = encodeOp(op);
      const inputTensor = tf.tensor2d([input]);
      const outputTensor = model.predict(inputTensor);
      const output = outputTensor.dataSync();
      const error = mse(input, Array.from(output));

      if (error > THRESHOLD) {
        console.log(`[ALERT] Anomaly detected: ${JSON.stringify(op)} (MSE: ${error.toFixed(4)})`);
      }

      tf.dispose([inputTensor, outputTensor]); // clean up
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

monitor();
