import * as tf from '@tensorflow/tfjs-node';
import ZongJi from '@vlasky/zongji';

const TABLES = ['users', 'logs', 'secret_data'];
const OPS = ['writerows', 'updaterows', 'deleterows'];

function encode(table, op) {
  const vec = new Array(TABLES.length + OPS.length).fill(0);
  const tableIdx = TABLES.indexOf(table);
  const opIdx = OPS.indexOf(op);
  if (tableIdx !== -1) vec[tableIdx] = 1;
  if (opIdx !== -1) vec[TABLES.length + opIdx] = 1;
  return vec;
}


// CREATE USER 'replica_user'@'%' IDENTIFIED WITH mysql_native_password BY 'replica_pass';
// GRANT REPLICATION SLAVE, REPLICATION CLIENT ON *.* TO 'replica_user'@'%';
// FLUSH PRIVILEGES;
// ALTER USER 'replica_user'@'%' IDENTIFIED WITH mysql_native_password BY 'replica_pass';
// FLUSH PRIVILEGES;
function getBinlogData() {
  return new Promise((resolve) => {
    const zongji = new ZongJi({
      host: 'localhost',
      user: 'replica_user',
      password: 'replica_pass',
    });

    const encoded = [];

    zongji.on('binlog', (event) => {
      if (!['writerows', 'updaterows', 'deleterows'].includes(event.getEventName())) return;
      const tableName = event.tableMap[event.tableId]?.tableName;
      if (tableName) {
        encoded.push(encode(tableName, event.getEventName()));
      }

      // If we have enough, stop early
      if (encoded.length >= 100) {
        zongji.stop();
        resolve(encoded);
      }
    });

    zongji.start({
      serverId: 123,
      startAtEnd: true,
      includeEvents: ['tablemap', 'writerows', 'updaterows', 'deleterows'],
      includeSchema: {
        testdb: true
      }
    });
    

    // Fallback in case there aren't many events
    setTimeout(() => {
      zongji.stop();
      resolve(encoded);
    }, 5000);
  });
}

async function trainModel(data) {
  const X = tf.tensor2d(data);
  const inputDim = X.shape[1];

  const model = tf.sequential();
  model.add(tf.layers.dense({ inputShape: [inputDim], units: 16, activation: 'relu' }));
  model.add(tf.layers.dense({ units: inputDim, activation: 'sigmoid' }));

  model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });
  await model.fit(X, X, { epochs: 20, batchSize: 8 });

  await model.save('file://./model');
  console.log("✅ Model trained and saved.");
}

(async () => {
  console.log("⏳ Reading binlog data...");
  const logData = await getBinlogData();

  if (logData.length === 0) {
    console.error("❌ No usable binlog data found. Try generating some events first.");
    process.exit(1);
  }

  console.log(`✅ Loaded ${logData.length} binlog events`);
  await trainModel(logData);
})();
