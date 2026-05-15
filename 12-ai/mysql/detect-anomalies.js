import * as tf from '@tensorflow/tfjs-node';
import ZongJi from '@vlasky/zongji';

const model = await tf.loadLayersModel('file://./model/model.json');
const THRESHOLD = 0.1;

const zongji = new ZongJi({
  host: 'localhost',
  user: 'replica_user',
  password: 'replica_pass'
});

zongji.on('binlog', async (event) => {
  if (!['writerows', 'updaterows', 'deleterows'].includes(event.getEventName())) return;

  const tableName = event.tableMap[event.tableId].tableName;
  const encodedVec = encode(tableName, event.getEventName());  // Simplified encoding
  const input = tf.tensor2d([encodedVec]);
  const output = model.predict(input);
  const error = tf.losses.meanSquaredError(input, output).dataSync()[0];

  if (error > THRESHOLD) {
    console.log(`⚠️ Anomaly: ${event.getEventName()} on ${tableName} (MSE=${error.toFixed(4)})`);
  }
});

function encode(table, type) {
  const keys = ['users', 'secret_data', 'logs'];
  const ops = ['writerows', 'updaterows', 'deleterows'];
  const vec = new Array(keys.length + ops.length).fill(0);
  const tIdx = keys.indexOf(table);
  const oIdx = ops.indexOf(type);
  if (tIdx !== -1) vec[tIdx] = 1;
  if (oIdx !== -1) vec[keys.length + oIdx] = 1;
  return vec;
}

zongji.start({
    serverId: 123,
    startAtEnd: true,
    includeEvents: ['tablemap', 'writerows', 'updaterows', 'deleterows'],
    includeSchema: {
        testdb: true
    }
});
console.log('🚀 Anomaly detection started.');
