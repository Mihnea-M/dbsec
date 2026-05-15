import crypto from 'crypto'
import Sequelize from 'sequelize'

const algorithm = 'aes-256-ctr';
const secretKey = 'mysecretkey';

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: 'localhost',
  username: 'app1',
  password: 'welcome123',
  database: 'ismv4',
  logging: false
})

// Define the schema
const Secret = sequelize.define('secret', {
  content: Sequelize.STRING
})

Secret.addHook('afterFind', async (secrets, options) => {
  const decipher = crypto.createDecipher(algorithm, secretKey)

  for (let i = 0; i < secrets.length; i++) {
    let decrypted = decipher.update(secrets[i].content, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    secrets[i].content = decrypted
  }
})

Secret.addHook('beforeCreate', async (attributes, options) => {
  const cipher = crypto.createCipher(algorithm, secretKey);
  let encrypted = cipher.update(attributes.content, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  attributes.content = encrypted  
})

await sequelize.sync({ force: true })

// Create the model
await Secret.create({ content: 'secret content' })

const secrets = await Secret.findAll()
console.warn(secrets)