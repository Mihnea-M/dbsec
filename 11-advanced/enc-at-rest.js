import mongoose from 'mongoose'
import crypto from 'crypto'
import Sequelize from 'sequelize'

const algorithm = 'aes-256-ctr';
const secretKey = 'mysecretkey';

mongoose.connect('mongodb://localhost/ismv4', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})


// Define the schema
const secretsSchema = new mongoose.Schema({
  encryptedContent: {
    type: String,
    required: true
  }, 
  key: {
    type: String
  }
})

// Define the encryption hook for 'save' event
secretsSchema.pre('save', function (next) {
  const cipher = crypto.createCipher(algorithm, secretKey);
  let encrypted = cipher.update(this.encryptedContent, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  this.encryptedContent = encrypted;
  next();
});

// Define the decryption hook for 'find' event
secretsSchema.post('find', function (docs, next) {
  const decipher = crypto.createDecipher(algorithm, secretKey);
  docs.forEach((doc) => {
    let decrypted = decipher.update(doc.encryptedContent, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    doc.encryptedContent = decrypted;
  });
  next();
});

// Create the model
const Secrets = mongoose.model('Secrets', secretsSchema);

let secret = new Secrets({ encryptedContent: 'test123', key: 'a1' })
await secret.save()

let results = await Secrets.find({ key: 'a1' })
console.warn(results)